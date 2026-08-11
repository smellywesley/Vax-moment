import {
  SNAPSHOT_SCHEMA_VERSION,
  SEED_VERSION,
  barrierCategories,
  err,
  journeyStates,
  ok,
  type DemoSnapshot,
  type Result,
} from '../../domain'
import type { SnapshotRepository } from '../../application'
import { createCanonicalSnapshot } from './seeds'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const roles = ['employee', 'operator', 'employer'] as const
const scenarios = ['ready_to_book', 'convenience', 'clinical_handoff'] as const
const commands = [
  'SWITCH_ROLE',
  'SELECT_SCENARIO',
  'CLASSIFY_BARRIER',
  'CONFIRM_BARRIER',
  'OFFER_NEXT_ACTION',
  'QUERY_SLOTS',
  'BOOK_SLOT',
  'RECORD_COMPLETION',
  'QUERY_EMPLOYER_DASHBOARD',
  'QUERY_OPERATOR_DASHBOARD',
  'RESET_DEMO',
] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.length > 0
const isInteger = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0
const isOneOf = <T extends string>(value: unknown, values: readonly T[]): value is T =>
  isString(value) && values.includes(value as T)
const optional = (value: unknown, predicate: (candidate: unknown) => boolean) =>
  value === undefined || predicate(value)

const isCampaign = (value: unknown) => isRecord(value)
  && isNonEmptyString(value.id)
  && isOneOf(value.scenarioId, scenarios)
  && isNonEmptyString(value.title)
  && isNonEmptyString(value.organisationLabel)
  && isNonEmptyString(value.closesAt)
  && !Number.isNaN(Date.parse(value.closesAt))

const isEmployee = (value: unknown) => isRecord(value)
  && isNonEmptyString(value.id)
  && isOneOf(value.scenarioId, scenarios)
  && isNonEmptyString(value.campaignId)
  && isNonEmptyString(value.displayLabel)
  && typeof value.isPrimary === 'boolean'
  && isOneOf(value.state, journeyStates)
  && isInteger(value.stateVersion)
  && optional(value.barrierCategory, (candidate) => isOneOf(candidate, barrierCategories))
  && optional(value.interventionId, isNonEmptyString)
  && optional(value.bookingId, isNonEmptyString)
  && optional(value.handoffId, isNonEmptyString)

const isBooking = (value: unknown) => isRecord(value)
  && isNonEmptyString(value.id)
  && isOneOf(value.scenarioId, scenarios)
  && isNonEmptyString(value.campaignId)
  && isNonEmptyString(value.employeeId)
  && isNonEmptyString(value.slotId)
  && isNonEmptyString(value.bookedAt)
  && !Number.isNaN(Date.parse(value.bookedAt))
  && value.evidenceStatus === 'Synthetic'

const isHandoff = (value: unknown) => isRecord(value)
  && isNonEmptyString(value.id)
  && isOneOf(value.scenarioId, scenarios)
  && isNonEmptyString(value.campaignId)
  && isNonEmptyString(value.employeeId)
  && isOneOf(value.status, ['pending', 'resolved', 'unable_to_contact'] as const)
  && value.ownerRole === 'Proposed accountable clinical service — not agreed'
  && value.expectedResponseWindow === 'Must be agreed before any pilot'
  && isNonEmptyString(value.createdAt)
  && !Number.isNaN(Date.parse(value.createdAt))
  && value.evidenceStatus === 'Synthetic'
  && value.messageSent === false

const isCompletion = (value: unknown) => isRecord(value)
  && value.sourceType === 'operator_attestation'
  && isNonEmptyString(value.sourceReference)
  && value.recordedByRole === 'operator'
  && isNonEmptyString(value.eventAt)
  && isNonEmptyString(value.receivedAt)
  && value.verificationStatus === 'synthetic_unverified'
  && isInteger(value.version)
  && optional(value.supersedesEventId, isNonEmptyString)

const isEvent = (value: unknown) => isRecord(value)
  && isNonEmptyString(value.id)
  && isOneOf(value.scenarioId, scenarios)
  && optional(value.campaignId, isNonEmptyString)
  && optional(value.employeeId, isNonEmptyString)
  && isNonEmptyString(value.correlationId)
  && isOneOf(value.actorRole, roles)
  && isOneOf(value.command, commands)
  && optional(value.priorState, (candidate) => isOneOf(candidate, journeyStates))
  && optional(value.nextState, (candidate) => isOneOf(candidate, journeyStates))
  && isNonEmptyString(value.resultCode)
  && typeof value.fallback === 'boolean'
  && isNonEmptyString(value.timestamp)
  && !Number.isNaN(Date.parse(value.timestamp))
  && optional(value.completion, isCompletion)

const isSnapshot = (value: unknown): value is DemoSnapshot => {
  if (!isRecord(value)
    || value.schemaVersion !== SNAPSHOT_SCHEMA_VERSION
    || value.seedVersion !== SEED_VERSION
    || !isInteger(value.version)
    || !isOneOf(value.activeScenarioId, scenarios)
    || !isOneOf(value.activeRole, roles)
    || !Array.isArray(value.campaigns) || !value.campaigns.every(isCampaign)
    || !Array.isArray(value.employees) || !value.employees.every(isEmployee)
    || !Array.isArray(value.bookings) || !value.bookings.every(isBooking)
    || !Array.isArray(value.handoffs) || !value.handoffs.every(isHandoff)
    || !Array.isArray(value.timeline) || !value.timeline.every(isEvent)) return false

  const snapshot = value as unknown as DemoSnapshot
  const campaigns = new Map(snapshot.campaigns.map((campaign) => [campaign.id, campaign]))
  const employees = new Map(snapshot.employees.map((employee) => [employee.id, employee]))
  const bookings = new Map(snapshot.bookings.map((booking) => [booking.id, booking]))
  const handoffs = new Map(snapshot.handoffs.map((handoff) => [handoff.id, handoff]))
  if (!snapshot.campaigns.some((campaign) => campaign.scenarioId === snapshot.activeScenarioId)) return false
  if (new Set(snapshot.campaigns.map((campaign) => campaign.id)).size !== snapshot.campaigns.length) return false
  if (new Set(snapshot.employees.map((employee) => employee.id)).size !== snapshot.employees.length) return false
  if (bookings.size !== snapshot.bookings.length) return false
  if (handoffs.size !== snapshot.handoffs.length) return false
  if (new Set(snapshot.timeline.map((event) => event.id)).size !== snapshot.timeline.length) return false
  if (!scenarios.every((scenarioId) =>
    snapshot.employees.filter((employee) =>
      employee.scenarioId === scenarioId && employee.isPrimary,
    ).length === 1)) return false

  if (!snapshot.employees.every((employee) => {
    const campaign = campaigns.get(employee.campaignId)
    return campaign?.scenarioId === employee.scenarioId
  })) return false

  if (!snapshot.bookings.every((booking) => {
    const campaign = campaigns.get(booking.campaignId)
    const employee = employees.get(booking.employeeId)
    return campaign?.scenarioId === booking.scenarioId
      && employee?.scenarioId === booking.scenarioId
      && employee.campaignId === booking.campaignId
  })) return false

  if (!snapshot.employees.every((employee) => {
    const booking = employee.bookingId === undefined ? undefined : bookings.get(employee.bookingId)
    const handoff = employee.handoffId === undefined ? undefined : handoffs.get(employee.handoffId)
    return (employee.bookingId === undefined
      || (booking?.employeeId === employee.id && booking.campaignId === employee.campaignId))
      && (employee.handoffId === undefined
        || (handoff?.employeeId === employee.id && handoff.campaignId === employee.campaignId))
  })) return false

  const bookingStates = ['BOOKED', 'COMPLETED', 'COMPLETION_UNKNOWN'] as const
  const handoffStates = ['HUMAN_HANDOFF_PENDING', 'HUMAN_HANDOFF_RESOLVED', 'UNABLE_TO_CONTACT'] as const
  if (!snapshot.employees.every((employee) => {
    if (employee.bookingId !== undefined && !bookingStates.includes(employee.state as typeof bookingStates[number])) return false
    if (employee.handoffId !== undefined && !handoffStates.includes(employee.state as typeof handoffStates[number])) return false
    if (employee.isPrimary && bookingStates.includes(employee.state as typeof bookingStates[number]) && employee.bookingId === undefined) return false
    if (employee.isPrimary && handoffStates.includes(employee.state as typeof handoffStates[number]) && employee.handoffId === undefined) return false
    if (employee.isPrimary && ['ACTION_OFFERED', 'BOOKING_OFFERED', ...bookingStates, ...handoffStates].includes(employee.state as never)) {
      return employee.barrierCategory !== undefined && employee.interventionId !== undefined
    }
    return true
  })) return false

  return snapshot.handoffs.every((handoff) => {
    const campaign = campaigns.get(handoff.campaignId)
    const employee = employees.get(handoff.employeeId)
    return campaign?.scenarioId === handoff.scenarioId
      && employee?.scenarioId === handoff.scenarioId
      && employee.campaignId === handoff.campaignId
  })
}

export class DemoSnapshotRepository implements SnapshotRepository {
  static readonly storageKey = 'vaxmoment.demo.snapshot.v1'

  constructor(private readonly storage: StorageLike = new MemoryStorage()) {}

  load(): Result<DemoSnapshot> {
    try {
      const raw = this.storage.getItem(DemoSnapshotRepository.storageKey)
      if (raw === null) return this.reset()
      const parsed: unknown = JSON.parse(raw)
      return isSnapshot(parsed)
        ? ok(clone(parsed))
        : err('CORRUPT_STATE', 'The synthetic snapshot has an incompatible schema.', 'Reset the demo to restore the canonical seed.')
    } catch {
      return err('CORRUPT_STATE', 'The synthetic snapshot could not be read.', 'Reset the demo to restore the canonical seed.')
    }
  }

  save(snapshot: DemoSnapshot, expectedVersion: number): Result<DemoSnapshot> {
    const current = this.load()
    if (!current.ok) return current
    if (current.value.version !== expectedVersion) {
      return err('CONFLICT', 'The synthetic snapshot changed before this command completed.', 'Refresh and retry the action.')
    }
    if (!isSnapshot(snapshot) || snapshot.version !== expectedVersion + 1) {
      return err('CORRUPT_STATE', 'The replacement snapshot failed validation.', 'Keep the previous state and retry.')
    }
    try {
      this.storage.setItem(DemoSnapshotRepository.storageKey, JSON.stringify(snapshot))
      return ok(clone(snapshot))
    } catch {
      return err('RESET_FAILED', 'The browser could not save the synthetic snapshot.', 'The previous consistent snapshot remains available.')
    }
  }

  reset(): Result<DemoSnapshot> {
    const canonical = createCanonicalSnapshot()
    try {
      this.storage.setItem(DemoSnapshotRepository.storageKey, JSON.stringify(canonical))
      return ok(clone(canonical))
    } catch {
      return err('RESET_FAILED', 'The browser could not reset the synthetic snapshot.', 'Retry without closing this page.')
    }
  }
}
