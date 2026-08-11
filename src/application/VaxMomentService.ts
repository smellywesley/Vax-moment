import {
  authorize,
  barrierCategories,
  err,
  ok,
  projectEmployerDashboard,
  selectIntervention,
  transitionJourney,
  validNextStates,
  type BarrierCategory,
  type DemoSnapshot,
  type EmployeeRecord,
  type Result,
  type Role,
  type ScenarioId,
  type SyntheticEvent,
} from '../domain'
import type {
  BookingReceipt,
  BookingSlotsView,
  BookSlotCommand,
  ClassificationView,
  ConfirmBarrierCommand,
  EmployeeJourneyView,
  EmployerDashboardView,
  NextActionView,
  OperatorDashboard,
  RecordCompletionCommand,
  SessionView,
  SyntheticTimelineEventView,
  SyntheticTimelineView,
  VersionedEmployeeCommandContext,
} from './dto'
import type { DemoRuntimePorts } from './ports'

const MAX_TRANSIENT_TEXT_LENGTH = 2_000
const SCENARIO_LABELS: Readonly<Record<ScenarioId, string>> = {
  ready_to_book: 'Ready to book',
  convenience: 'Schedule barrier',
  clinical_handoff: 'Clinical question and privacy suppression',
}

const isBarrierCategory = (value: string): value is BarrierCategory =>
  (barrierCategories as readonly string[]).includes(value)

const primaryEmployee = (snapshot: DemoSnapshot): EmployeeRecord | undefined =>
  snapshot.employees.find(
    (employee) => employee.scenarioId === snapshot.activeScenarioId && employee.isPrimary,
  )

const campaignForActiveScenario = (snapshot: DemoSnapshot) =>
  snapshot.campaigns.find((campaign) => campaign.scenarioId === snapshot.activeScenarioId)

const replaceEmployee = (
  snapshot: DemoSnapshot,
  employee: EmployeeRecord,
): readonly EmployeeRecord[] =>
  snapshot.employees.map((candidate) => (candidate.id === employee.id ? employee : candidate))

export class VaxMomentService {
  constructor(private readonly ports: DemoRuntimePorts) {}

  async getSession(): Promise<Result<SessionView>> {
    const loaded = this.ports.repository.load()
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    this.ports.identity.switchRole(snapshot.activeRole)
    return ok({
      snapshotVersion: snapshot.version,
      seedVersion: snapshot.seedVersion,
      role: snapshot.activeRole,
      scenarioId: snapshot.activeScenarioId,
      scenarios: snapshot.campaigns.map((campaign) => ({
        id: campaign.scenarioId,
        label: SCENARIO_LABELS[campaign.scenarioId],
      })),
      syntheticDataNotice: 'Public demo · No real people or outcomes',
      securityNotice:
        'Application-level access rules demonstrate the intended design; this public static prototype is not a production privacy firewall.',
    })
  }

  async switchRole(role: Role): Promise<Result<SessionView>> {
    const loaded = this.ports.repository.load()
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const event = this.event(snapshot, 'SWITCH_ROLE', 'OK', false)
    const saved = this.saveWithEvent({ ...snapshot, activeRole: role }, event, snapshot.version)
    if (!saved.ok) return saved
    this.ports.identity.switchRole(role)
    return this.getSession()
  }

  async selectScenario(scenarioId: ScenarioId): Promise<Result<EmployeeJourneyView>> {
    const loaded = this.ports.repository.load()
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    if (!snapshot.campaigns.some((campaign) => campaign.scenarioId === scenarioId)) {
      return err('NOT_FOUND', 'That synthetic scenario does not exist.', 'Choose one of the available demo scenarios.')
    }
    const selected = { ...snapshot, activeScenarioId: scenarioId }
    const event = this.event(selected, 'SELECT_SCENARIO', 'OK', false)
    const saved = this.saveWithEvent(selected, event, snapshot.version)
    if (!saved.ok) return saved
    return this.getEmployeeJourney()
  }

  async getEmployeeJourney(): Promise<Result<EmployeeJourneyView>> {
    const loaded = this.loadAuthorized('read_own_journey')
    if (!loaded.ok) return loaded
    const employee = primaryEmployee(loaded.value)
    return employee
      ? ok(this.toEmployeeJourney(loaded.value, employee))
      : err('NOT_FOUND', 'The primary synthetic employee is missing.', 'Reset the demo scenario.')
  }

  async classifyBarrier(input: { readonly rawText: string; readonly correlationId?: string }): Promise<Result<ClassificationView>> {
    const loaded = this.loadAuthorized('classify_own_barrier')
    if (!loaded.ok) return loaded
    const normalized = input.rawText.normalize('NFKC').trim()
    if (normalized.length === 0) {
      return err('INVALID_INPUT', 'Add optional context or choose a barrier.', 'Context is optional; choosing a barrier remains fully actionable.')
    }
    if (normalized.length > MAX_TRANSIENT_TEXT_LENGTH) {
      return err('INVALID_INPUT', 'Optional context must be 2,000 characters or fewer.', 'Shorten the context or use a barrier button.')
    }

    let classified
    try {
      classified = await this.ports.classifier.classify(normalized)
    } catch {
      classified = err('CLASSIFIER_UNAVAILABLE', 'The simulated classifier threw an unexpected error.')
    }
    let category: BarrierCategory
    let fallbackReason: ClassificationView['fallbackReason']
    if (!classified.ok) {
      category = this.ports.deterministicClassifier.classify(normalized)
      fallbackReason = 'CLASSIFIER_UNAVAILABLE'
    } else if (!isBarrierCategory(classified.value.category)) {
      category = this.ports.deterministicClassifier.classify(normalized)
      fallbackReason = 'INVALID_CLASSIFICATION'
    } else {
      category = classified.value.category
    }

    const snapshot = loaded.value
    const event = this.event(
      snapshot,
      'CLASSIFY_BARRIER',
      fallbackReason ?? 'OK',
      fallbackReason !== undefined,
      input.correlationId,
    )
    const saved = this.saveWithEvent(snapshot, event, snapshot.version)
    if (!saved.ok) return saved

    return ok({
      category,
      mode: fallbackReason === undefined ? 'simulated-classification' : 'deterministic-fallback',
      evidenceStatus: 'Synthetic',
      fallbackActive: fallbackReason !== undefined,
      ...(fallbackReason === undefined ? {} : { fallbackReason }),
      safetyNote: 'This simulated classifier categorises intent only. It does not assess eligibility or suitability.',
    })
  }

  async confirmBarrier(command: ConfirmBarrierCommand): Promise<Result<EmployeeJourneyView>> {
    const loaded = this.loadAuthorized('mutate_own_journey')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const employee = snapshot.employees.find(
      (candidate) => candidate.id === command.employeeId
        && candidate.isPrimary
        && candidate.scenarioId === snapshot.activeScenarioId,
    )
    if (!employee) return err('NOT_FOUND', 'The primary synthetic employee is missing.', 'Reset the demo scenario.')
    const conflict = this.checkExpectedVersion(employee, command.expectedVersion)
    if (conflict) return conflict

    const targetState = command.category === 'decline_or_opt_out' ? 'OPTED_OUT' : 'BARRIER_CONFIRMED'
    const transitioned = transitionJourney(employee.state, targetState)
    if (!transitioned.ok) return transitioned
    const updated: EmployeeRecord = {
      ...employee,
      state: transitioned.value,
      stateVersion: employee.stateVersion + 1,
      barrierCategory: command.category,
    }
    const nextBase = { ...snapshot, employees: replaceEmployee(snapshot, updated) }
    const event = this.event(
      snapshot,
      'CONFIRM_BARRIER',
      'OK',
      false,
      command.correlationId,
      employee,
      updated,
    )
    const saved = this.saveWithEvent(nextBase, event, snapshot.version)
    return saved.ok ? ok(this.toEmployeeJourney(saved.value, updated)) : saved
  }

  async offerNextAction(command: VersionedEmployeeCommandContext): Promise<Result<NextActionView>> {
    const loaded = this.loadAuthorized('mutate_own_journey')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const employee = snapshot.employees.find(
      (candidate) => candidate.id === command.employeeId
        && candidate.isPrimary
        && candidate.scenarioId === snapshot.activeScenarioId,
    )
    if (!employee) return err('NOT_FOUND', 'The primary synthetic employee is missing.', 'Reset the demo scenario.')
    if (!employee.barrierCategory) {
      return err('CONFLICT', 'Confirm an allowlisted barrier before selecting an action.', 'Return to barrier confirmation.')
    }
    const conflict = this.checkExpectedVersion(employee, command.expectedVersion)
    if (conflict) return conflict
    const intervention = selectIntervention(employee.barrierCategory)
    if (intervention.action === 'record_opt_out') {
      return employee.state === 'OPTED_OUT'
        ? ok({ intervention, journey: this.toEmployeeJourney(snapshot, employee) })
        : err('CONFLICT', 'The opt-out choice has not been recorded.', 'Return to barrier confirmation.')
    }
    const targetState = intervention.action === 'create_handoff' ? 'HUMAN_HANDOFF_PENDING' : 'ACTION_OFFERED'
    const transitioned = transitionJourney(employee.state, targetState)
    if (!transitioned.ok) return transitioned

    const handoff = intervention.action === 'create_handoff' ? this.createHandoff(snapshot, employee) : undefined
    const updated: EmployeeRecord = {
      ...employee,
      state: transitioned.value,
      stateVersion: employee.stateVersion + 1,
      interventionId: intervention.id,
      ...(handoff === undefined ? {} : { handoffId: handoff.id }),
    }
    const nextBase: DemoSnapshot = {
      ...snapshot,
      employees: replaceEmployee(snapshot, updated),
      handoffs: handoff === undefined ? snapshot.handoffs : [...snapshot.handoffs, handoff],
    }
    const event = this.event(snapshot, 'OFFER_NEXT_ACTION', 'OK', false, command.correlationId, employee, updated)
    const saved = this.saveWithEvent(nextBase, event, snapshot.version)
    if (!saved.ok) return saved
    return ok({
      intervention,
      journey: this.toEmployeeJourney(saved.value, updated),
      ...(handoff === undefined ? {} : { handoff: this.toHandoffReceipt(handoff) }),
    })
  }

  async getBookingSlots(input: VersionedEmployeeCommandContext): Promise<Result<BookingSlotsView>> {
    const loaded = this.loadAuthorized('mutate_own_journey')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const employee = snapshot.employees.find(
      (candidate) => candidate.id === input.employeeId
        && candidate.isPrimary
        && candidate.scenarioId === snapshot.activeScenarioId,
    )
    const campaign = campaignForActiveScenario(snapshot)
    if (!employee || !campaign) return err('NOT_FOUND', 'The active synthetic scenario is incomplete.', 'Reset the demo scenario.')
    const conflict = this.checkExpectedVersion(employee, input.expectedVersion)
    if (conflict) return conflict
    if (!employee.barrierCategory || selectIntervention(employee.barrierCategory).action !== 'show_slots') {
      return err('FORBIDDEN', 'This governed action does not permit booking.', 'Use the action shown for the confirmed barrier.')
    }
    if (employee.state !== 'ACTION_OFFERED' && employee.state !== 'BOOKING_OFFERED') {
      return err('CONFLICT', 'Booking options are not available at this journey step.', 'Complete the current next action first.')
    }
    let listed
    try {
      listed = await this.ports.booking.listSlots(campaign.id)
    } catch {
      listed = err('BOOKING_UNAVAILABLE', 'The simulated booking service threw an unexpected error.')
    }
    if (!listed.ok) return this.bookingFallback(snapshot, employee, input.correlationId, listed.error.code)
    if (listed.value.length === 0) {
      return err('NO_SLOTS', 'No demo slots are available.', 'Use the clinic contact route or try the seeded fallback.')
    }
    if (!listed.value.every((slot) => this.isValidSlot(slot, campaign.id))) {
      return this.bookingFallback(snapshot, employee, input.correlationId, 'INVALID_SLOT_DATA')
    }
    const advanced = employee.state === 'ACTION_OFFERED'
      ? this.advanceEmployee(snapshot, employee, 'BOOKING_OFFERED', 'QUERY_SLOTS', 'OK', false, input.correlationId)
      : ok(snapshot)
    if (!advanced.ok) return advanced
    return ok({ slots: listed.value, mode: 'simulated-booking', fallbackActive: false, evidenceStatus: 'Synthetic' })
  }

  async bookSlot(command: BookSlotCommand): Promise<Result<BookingReceipt>> {
    const loaded = this.loadAuthorized('mutate_own_journey')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const employee = snapshot.employees.find(
      (candidate) => candidate.id === command.employeeId
        && candidate.isPrimary
        && candidate.scenarioId === snapshot.activeScenarioId,
    )
    const campaign = campaignForActiveScenario(snapshot)
    if (!employee || !campaign) return err('NOT_FOUND', 'The active synthetic scenario is incomplete.', 'Reset the demo scenario.')
    const existing = snapshot.bookings.find((booking) => booking.employeeId === employee.id)
    if (existing) {
      if (existing.slotId !== command.slotId) return err('CONFLICT', 'A different demo slot is already booked.', 'Cancel it before choosing another slot.')
      return this.bookingReceipt(snapshot, existing)
    }
    const conflict = this.checkExpectedVersion(employee, command.expectedVersion)
    if (conflict) return conflict
    if (employee.state !== 'BOOKING_OFFERED') {
      return err('CONFLICT', 'Choose from the current booking options before booking.', 'Refresh the available demo slots.')
    }
    let listed
    try {
      listed = await this.ports.booking.listSlots(campaign.id)
    } catch {
      listed = err('BOOKING_UNAVAILABLE', 'The simulated booking service threw an unexpected error.')
    }
    const fallbackSlot = this.defaultFallbackSlots(campaign.id).find(
      (candidate) => candidate.id === command.slotId,
    )
    const slot = listed.ok
      ? listed.value.find((candidate) => candidate.id === command.slotId)
      : fallbackSlot
    if (!slot || !this.isValidSlot(slot, campaign.id)) {
      return err('CONFLICT', 'That demo slot is stale or unavailable.', 'Refresh the available slots.')
    }
    let reservationReference: string
    const bookingAttemptId = this.ports.ids.next('booking-attempt')
    const idempotencyKey = `${snapshot.activeScenarioId}:${employee.id}:${slot.id}:${bookingAttemptId}`
    let adapterReservationCreated = false
    if (!listed.ok) {
      reservationReference = `DEMO-FALLBACK-${slot.id.toUpperCase()}`
    } else {
      let reserved
      try {
        reserved = await this.ports.booking.reserve(
          slot.id,
          slot.versionToken,
          idempotencyKey,
        )
      } catch {
        reserved = err('BOOKING_UNAVAILABLE', 'The simulated booking service threw an unexpected error.')
      }
      if (!reserved.ok) return reserved
      reservationReference = reserved.value.reference
      adapterReservationCreated = true
    }
    const transitioned = transitionJourney(employee.state, 'BOOKED')
    if (!transitioned.ok) return transitioned
    const booking = {
      id: this.ports.ids.next('booking'),
      scenarioId: snapshot.activeScenarioId,
      campaignId: campaign.id,
      employeeId: employee.id,
      slotId: slot.id,
      bookedAt: this.ports.clock.now(),
      evidenceStatus: 'Synthetic' as const,
    }
    const updated: EmployeeRecord = {
      ...employee,
      state: transitioned.value,
      stateVersion: employee.stateVersion + 1,
      bookingId: booking.id,
    }
    const base: DemoSnapshot = {
      ...snapshot,
      employees: replaceEmployee(snapshot, updated),
      bookings: [...snapshot.bookings, booking],
    }
    const event = this.event(snapshot, 'BOOK_SLOT', 'OK', false, command.correlationId, employee, updated)
    const saved = this.saveWithEvent(base, event, snapshot.version)
    if (saved.ok) return this.bookingReceipt(saved.value, booking, reservationReference)
    if (adapterReservationCreated) {
      try {
        const compensated = await this.ports.booking.cancelReservation(
          reservationReference,
          idempotencyKey,
        )
        if (!compensated.ok) {
          return err(
            'BOOKING_COMPENSATION_FAILED',
            'The synthetic reservation could not be reconciled after a local save failure.',
            'Reset the demo before continuing.',
          )
        }
      } catch {
        return err(
          'BOOKING_COMPENSATION_FAILED',
          'The synthetic reservation could not be reconciled after a local save failure.',
          'Reset the demo before continuing.',
        )
      }
    }
    return saved
  }

  async getOperatorDashboard(): Promise<Result<OperatorDashboard>> {
    const loaded = this.loadAuthorized('read_operator_dashboard')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const campaign = campaignForActiveScenario(snapshot)
    if (!campaign) return err('NOT_FOUND', 'The active campaign is missing.', 'Reset the demo scenario.')
    const employees = snapshot.employees.filter((employee) => employee.campaignId === campaign.id)
    return ok({
      scenarioId: snapshot.activeScenarioId,
      campaignTitle: campaign.title,
      evidenceStatus: 'Synthetic',
      employees: employees.map((employee) => ({
        employeeId: employee.id,
        displayLabel: employee.displayLabel,
        state: employee.state,
        stateVersion: employee.stateVersion,
        ...(employee.barrierCategory === undefined ? {} : { barrierCategory: employee.barrierCategory }),
        needsAction: ['HUMAN_HANDOFF_PENDING', 'BOOKED', 'COMPLETION_UNKNOWN'].includes(employee.state),
      })),
      pendingHandoffs: employees.filter((employee) => employee.state === 'HUMAN_HANDOFF_PENDING').length,
      bookedNotCompleted: employees.filter((employee) => ['BOOKED', 'COMPLETION_UNKNOWN'].includes(employee.state)).length,
    })
  }

  async recordCompletion(command: RecordCompletionCommand): Promise<Result<EmployeeJourneyView>> {
    const loaded = this.loadAuthorized('record_completion')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const employee = snapshot.employees.find((candidate) => candidate.id === command.employeeId)
    if (!employee || employee.scenarioId !== snapshot.activeScenarioId) {
      return err('NOT_FOUND', 'The requested synthetic employee is not in this scenario.', 'Open the current operator queue.')
    }
    const conflict = this.checkExpectedVersion(employee, command.expectedVersion)
    if (conflict) return conflict
    if (employee.state === 'COMPLETED') return ok(this.toEmployeeJourney(snapshot, employee))
    const transitioned = transitionJourney(employee.state, 'COMPLETED')
    if (!transitioned.ok) return transitioned
    const updated: EmployeeRecord = {
      ...employee,
      state: transitioned.value,
      stateVersion: employee.stateVersion + 1,
    }
    const completion = {
      sourceType: 'operator_attestation' as const,
      sourceReference: command.sourceReference ?? `DEMO-${employee.id}`,
      recordedByRole: 'operator' as const,
      eventAt: this.ports.clock.now(),
      receivedAt: this.ports.clock.now(),
      verificationStatus: 'synthetic_unverified' as const,
      version: 1,
    }
    const base = { ...snapshot, employees: replaceEmployee(snapshot, updated) }
    const event = {
      ...this.event(snapshot, 'RECORD_COMPLETION', 'OK', false, command.correlationId, employee, updated),
      completion,
    }
    const saved = this.saveWithEvent(base, event, snapshot.version)
    return saved.ok ? ok(this.toEmployeeJourney(saved.value, updated)) : saved
  }

  async getEmployerDashboard(): Promise<Result<EmployerDashboardView>> {
    const loaded = this.loadAuthorized('read_employer_aggregate')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const campaign = campaignForActiveScenario(snapshot)
    if (!campaign) return err('NOT_FOUND', 'The active campaign is missing.', 'Reset the demo scenario.')
    const projection = projectEmployerDashboard(
      snapshot.employees.filter((employee) => employee.campaignId === campaign.id),
    )
    return ok(projection)
  }

  async getSyntheticTimeline(): Promise<Result<SyntheticTimelineView>> {
    const loaded = this.loadAuthorized('read_timeline')
    if (!loaded.ok) return loaded
    const snapshot = loaded.value
    const events = snapshot.timeline
      .filter((event) => event.scenarioId === snapshot.activeScenarioId)
      .map((event) => this.toTimelineEventView(event))
    return ok({ label: 'Synthetic event timeline', evidenceStatus: 'Synthetic', events })
  }

  async reset(): Promise<Result<SessionView>> {
    const reset = this.ports.repository.reset()
    if (!reset.ok) return err('RESET_FAILED', reset.error.message, 'Retry reset; the prior consistent snapshot remains available.')
    this.ports.identity.switchRole(reset.value.activeRole)
    return this.getSession()
  }

  private loadAuthorized(capability: Parameters<typeof authorize>[1]): Result<DemoSnapshot> {
    const loaded = this.ports.repository.load()
    if (!loaded.ok) return loaded
    const authorization = authorize(loaded.value.activeRole, capability)
    return authorization.ok ? loaded : authorization
  }

  private checkExpectedVersion(employee: EmployeeRecord, expectedVersion?: number): Result<never> | undefined {
    return expectedVersion !== undefined && employee.stateVersion !== expectedVersion
      ? err('CONFLICT', 'This journey changed since it was displayed.', 'Refresh the journey and retry the action.')
      : undefined
  }

  private toEmployeeJourney(snapshot: DemoSnapshot, employee: EmployeeRecord): EmployeeJourneyView {
    const booking = snapshot.bookings.find((candidate) => candidate.id === employee.bookingId)
    const handoff = snapshot.handoffs.find((candidate) => candidate.id === employee.handoffId)
    const intervention = employee.barrierCategory === undefined ? undefined : selectIntervention(employee.barrierCategory)
    return {
      scenarioId: employee.scenarioId,
      campaignId: employee.campaignId,
      employeeId: employee.id,
      displayLabel: employee.displayLabel,
      state: employee.state,
      stateVersion: employee.stateVersion,
      validNextStates: validNextStates(employee.state),
      ...(employee.barrierCategory === undefined ? {} : { barrierCategory: employee.barrierCategory }),
      ...(intervention === undefined ? {} : { intervention }),
      ...(booking === undefined ? {} : { booking: this.bookingReceiptValue(snapshot, booking) }),
      ...(handoff === undefined ? {} : { handoff: this.toHandoffReceipt(handoff) }),
    }
  }

  private createHandoff(snapshot: DemoSnapshot, employee: EmployeeRecord) {
    return {
      id: this.ports.ids.next('handoff'),
      scenarioId: snapshot.activeScenarioId,
      campaignId: employee.campaignId,
      employeeId: employee.id,
      status: 'pending' as const,
      ownerRole: 'Proposed accountable clinical service — not agreed' as const,
      expectedResponseWindow: 'Must be agreed before any pilot' as const,
      createdAt: this.ports.clock.now(),
      evidenceStatus: 'Synthetic' as const,
      messageSent: false as const,
    }
  }

  private toHandoffReceipt(handoff: DemoSnapshot['handoffs'][number]) {
    return {
      id: handoff.id,
      reference: handoff.id.toUpperCase(),
      status: 'Synthetic receipt — not submitted' as const,
      ownerRole: handoff.ownerRole,
      expectedResponseWindow: handoff.expectedResponseWindow,
      evidenceStatus: 'Synthetic' as const,
      messageSent: false as const,
      safetyNote: 'No message was sent or monitored in this demo.' as const,
    }
  }

  private bookingReceipt(snapshot: DemoSnapshot, booking: DemoSnapshot['bookings'][number], reference?: string): Result<BookingReceipt> {
    return ok(this.bookingReceiptValue(snapshot, booking, reference))
  }

  private bookingReceiptValue(snapshot: DemoSnapshot, booking: DemoSnapshot['bookings'][number], reference?: string): BookingReceipt {
    const slot = this.seededSlots(snapshot).find((candidate) => candidate.id === booking.slotId)
    return {
      id: booking.id,
      reference: reference ?? booking.id.toUpperCase(),
      slotId: booking.slotId,
      startsAt: slot?.startsAt ?? booking.bookedAt,
      location: slot?.location ?? 'Demo workplace clinic',
      evidenceStatus: 'Synthetic',
      statusText: 'Demo appointment booked · Vaccination not yet confirmed',
    }
  }

  private seededSlots(snapshot: DemoSnapshot) {
    const campaign = campaignForActiveScenario(snapshot)
    return campaign ? this.defaultFallbackSlots(campaign.id) : []
  }

  private async bookingFallback(
    snapshot: DemoSnapshot,
    employee: EmployeeRecord,
    correlationId: string | undefined,
    reason: string,
  ): Promise<Result<BookingSlotsView>> {
    const advanced = employee.state === 'ACTION_OFFERED'
      ? this.advanceEmployee(snapshot, employee, 'BOOKING_OFFERED', 'QUERY_SLOTS', reason, true, correlationId)
      : ok(snapshot)
    if (!advanced.ok) return advanced
    return ok({
      slots: this.defaultFallbackSlots(employee.campaignId),
      mode: 'deterministic-fallback',
      fallbackActive: true,
      evidenceStatus: 'Synthetic',
      alternatives: 'Seeded demo slots are shown because the simulated booking service is unavailable.',
    })
  }

  private defaultFallbackSlots(campaignId: string) {
    return [
      {
        id: `${campaignId}-slot-1`,
        campaignId,
        startsAt: '2026-08-12T04:30:00.000Z',
        location: 'Workplace clinic · Level 3',
        channel: 'workplace' as const,
        versionToken: `${campaignId}:1`,
        evidenceStatus: 'Synthetic' as const,
      },
      {
        id: `${campaignId}-slot-2`,
        campaignId,
        startsAt: '2026-08-12T10:00:00.000Z',
        location: 'Parkway Shenton clinic · Demo location',
        channel: 'clinic' as const,
        versionToken: `${campaignId}:1`,
        evidenceStatus: 'Synthetic' as const,
      },
    ]
  }

  private isValidSlot(slot: { campaignId: string; startsAt: string; versionToken: string }, campaignId: string): boolean {
    return slot.campaignId === campaignId && slot.versionToken.length > 0 && !Number.isNaN(Date.parse(slot.startsAt))
  }

  private advanceEmployee(
    snapshot: DemoSnapshot,
    employee: EmployeeRecord,
    state: EmployeeRecord['state'],
    command: SyntheticEvent['command'],
    resultCode: string,
    fallback: boolean,
    correlationId?: string,
  ): Result<DemoSnapshot> {
    const transitioned = transitionJourney(employee.state, state)
    if (!transitioned.ok) return transitioned
    const updated = { ...employee, state: transitioned.value, stateVersion: employee.stateVersion + 1 }
    const base = { ...snapshot, employees: replaceEmployee(snapshot, updated) }
    const event = this.event(snapshot, command, resultCode, fallback, correlationId, employee, updated)
    return this.saveWithEvent(base, event, snapshot.version)
  }

  private withEvent(snapshot: DemoSnapshot, event: SyntheticEvent): DemoSnapshot {
    return { ...snapshot, version: snapshot.version + 1, timeline: [...snapshot.timeline, event] }
  }

  private saveWithEvent(
    snapshot: DemoSnapshot,
    event: SyntheticEvent,
    expectedVersion: number,
  ): Result<DemoSnapshot> {
    const saved = this.ports.repository.save(this.withEvent(snapshot, event), expectedVersion)
    if (saved.ok) {
      try {
        this.ports.audit.write(event)
      } catch {
        // The persisted synthetic timeline is the inspectable source of truth.
        // A secondary demo sink must never turn a committed command into a retry.
      }
    }
    return saved
  }

  private event(
    snapshot: DemoSnapshot,
    command: SyntheticEvent['command'],
    resultCode: string,
    fallback: boolean,
    correlationId?: string,
    prior?: EmployeeRecord,
    next?: EmployeeRecord,
  ): SyntheticEvent {
    const campaign = campaignForActiveScenario(snapshot)
    return {
      id: this.ports.ids.next('event'),
      scenarioId: snapshot.activeScenarioId,
      ...(campaign === undefined ? {} : { campaignId: campaign.id }),
      ...(prior === undefined ? {} : { employeeId: prior.id, priorState: prior.state }),
      ...(next === undefined ? {} : { nextState: next.state }),
      correlationId: correlationId ?? this.ports.ids.next('correlation'),
      actorRole: snapshot.activeRole,
      command,
      resultCode,
      fallback,
      timestamp: this.ports.clock.now(),
    }
  }

  private toTimelineEventView(event: SyntheticEvent): SyntheticTimelineEventView {
    return {
      id: event.id,
      scenarioId: event.scenarioId,
      ...(event.campaignId === undefined ? {} : { campaignId: event.campaignId }),
      correlationId: event.correlationId,
      actorRole: event.actorRole,
      command: event.command,
      ...(event.priorState === undefined ? {} : { priorState: event.priorState }),
      ...(event.nextState === undefined ? {} : { nextState: event.nextState }),
      resultCode: event.resultCode,
      fallback: event.fallback,
      timestamp: event.timestamp,
    }
  }
}
