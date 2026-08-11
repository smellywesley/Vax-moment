import { err, ok, type BarrierCategory, type BookingSlot, type Role, type SyntheticEvent } from '../../domain'
import type {
  AuditSinkPort,
  BarrierClassifierPort,
  BookingPort,
  ClockPort,
  DeterministicClassificationPort,
  IdPort,
  IdentityPort,
} from '../../application'

export class DemoIdentityAdapter implements IdentityPort {
  constructor(private role: Role = 'employee') {}
  currentRole(): Role { return this.role }
  switchRole(role: Role): void { this.role = role }
}

export class FixedDemoClock implements ClockPort {
  private tick = 0
  now(): string {
    const date = new Date('2026-08-10T09:00:00.000Z')
    date.setSeconds(date.getSeconds() + this.tick++)
    return date.toISOString()
  }
}

export class SequentialDemoIds implements IdPort {
  constructor(private sequence = 0) {}
  next(prefix: string): string { return `${prefix}-${++this.sequence}` }
}

export class DemoAuditSink implements AuditSinkPort {
  private readonly recorded: SyntheticEvent[] = []
  write(event: SyntheticEvent): void { this.recorded.push({ ...event }) }
  events(): readonly SyntheticEvent[] { return this.recorded.map((event) => ({ ...event })) }
}

const urgentPatterns = [
  /chest pain|chest tight/i,
  /cannot breathe|can't breathe|difficulty breathing|shortness of breath/i,
  /faint|fainted|unconscious|loss of consciousness/i,
  /seizure|stroke|heavy bleeding|excessive bleeding|anaphyl/i,
  /胸痛|呼吸困难|晕倒|昏迷|癫痫|中风|大量出血/u,
  /sakit dada|sukar bernafas|pengsan|sawan|strok|pendarahan/i,
]

const clinicalPatterns = [
  /allerg/i, /pregnan/i, /pregnant/i, /immun/i, /fever/i, /unwell/i, /medicine/i,
  /medication/i, /contraindicat/i, /adverse/i, /reaction/i, /could not breathe/i,
  /过敏/u, /怀孕/u, /hamil/i, /ubat/i,
]

const allowlistedNonClinicalPatterns: readonly (readonly [BarrierCategory, RegExp])[] = [
  ['ready', /^\s*(?:i am |i'm )?(?:ready|ready to book|ready for an appointment)\s*[.!]?\s*$/i],
  ['convenience', /^\s*(?:i am |i'm )?(?:busy during office hours|unable to attend during office hours)\s*[.!]?\s*$/i],
  ['convenience', /^\s*(?:the )?clinic hours overlap with my shift\s*[.!]?\s*$/i],
  ['cost_or_access', /^\s*(?:cost|price|subsidy|access|affordability)(?: is my concern)?\s*[.!]?\s*$/i],
  ['decline_or_opt_out', /^\s*(?:i )?(?:want to opt out|decline|do not want to participate|don't want to participate)\s*[.!]?\s*$/i],
  ['information', /^\s*(?:i )?(?:want|need)(?: more)? (?:information|details|evidence)\s*[.!]?\s*$/i],
]

export class DeterministicBarrierClassifier implements DeterministicClassificationPort {
  classify(rawText: string): BarrierCategory {
    const text = rawText.normalize('NFKC')
    if (urgentPatterns.some((pattern) => pattern.test(text))) return 'clinical_question'
    if (clinicalPatterns.some((pattern) => pattern.test(text))) return 'clinical_question'
    const allowlisted = allowlistedNonClinicalPatterns.find(([, pattern]) => pattern.test(text))
    if (allowlisted) return allowlisted[0]
    // Arbitrary health-related prose is never used to infer a booking path. The
    // prototype fails closed to a human-information route when the whole input
    // is not one of the narrow non-clinical templates above.
    return 'clinical_question'
  }
}

export type ClassifierMode = 'available' | 'unavailable' | 'malformed'
export class DemoClassifierAdapter implements BarrierClassifierPort {
  constructor(
    private readonly baseline: DeterministicClassificationPort,
    private readonly mode: ClassifierMode = 'available',
  ) {}
  async classify(rawText: string) {
    if (this.mode === 'unavailable') return err('CLASSIFIER_UNAVAILABLE', 'The simulated classifier is unavailable.')
    if (this.mode === 'malformed') return ok({ category: 'not-an-allowed-category' })
    return ok({ category: this.baseline.classify(rawText) })
  }
}

export type BookingMode = 'available' | 'unavailable' | 'empty' | 'malformed'
export class DemoBookingAdapter implements BookingPort {
  constructor(private readonly mode: BookingMode = 'available') {}
  async listSlots(campaignId: string) {
    if (this.mode === 'unavailable') return err('BOOKING_UNAVAILABLE', 'The simulated booking service is unavailable.')
    if (this.mode === 'empty') return ok([] as readonly BookingSlot[])
    if (this.mode === 'malformed') {
      return ok([{ id: 'bad-slot', campaignId: 'wrong-campaign', startsAt: 'invalid', location: '', channel: 'clinic', versionToken: '', evidenceStatus: 'Synthetic' }] as readonly BookingSlot[])
    }
    return ok([
      { id: `${campaignId}-slot-1`, campaignId, startsAt: '2026-08-12T04:30:00.000Z', location: 'Workplace clinic · Level 3', channel: 'workplace', versionToken: `${campaignId}:1`, evidenceStatus: 'Synthetic' },
      { id: `${campaignId}-slot-2`, campaignId, startsAt: '2026-08-12T10:00:00.000Z', location: 'Parkway Shenton clinic · Demo location', channel: 'clinic', versionToken: `${campaignId}:1`, evidenceStatus: 'Synthetic' },
    ] as const)
  }
  async reserve(slotId: string, versionToken: string, idempotencyKey: string) {
    return versionToken.length === 0
      ? err('CONFLICT', 'That demo slot is stale.', 'Refresh the available slots.')
      : ok({ reference: `DEMO-${slotId.toUpperCase()}-${idempotencyKey.length}` })
  }
  async cancelReservation(reference: string, idempotencyKey: string) {
    void reference
    void idempotencyKey
    return ok(true as const)
  }
}
