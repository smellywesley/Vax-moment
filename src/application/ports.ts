import type {
  BarrierCategory,
  BookingSlot,
  DemoSnapshot,
  Role,
  ScenarioId,
  SyntheticEvent,
} from '../domain'
import type { Result } from '../domain'

export interface SnapshotRepository {
  load(): Result<DemoSnapshot>
  save(snapshot: DemoSnapshot, expectedVersion: number): Result<DemoSnapshot>
  reset(): Result<DemoSnapshot>
}

export interface IdentityPort {
  currentRole(): Role
  switchRole(role: Role): void
}

export interface BarrierClassifierPort {
  classify(rawText: string): Promise<Result<{ readonly category: string }>>
}

export interface BookingPort {
  listSlots(campaignId: string): Promise<Result<readonly BookingSlot[]>>
  reserve(
    slotId: string,
    versionToken: string,
    /** Stable for one booking attempt; a compensated retry must use a new key. */
    idempotencyKey: string,
  ): Promise<Result<{ readonly reference: string }>>
  cancelReservation(
    reference: string,
    idempotencyKey: string,
  ): Promise<Result<true>>
}

export interface ClockPort {
  now(): string
}

export interface IdPort {
  next(prefix: string): string
}

export interface AuditSinkPort {
  write(event: SyntheticEvent): void
}

export interface DeterministicClassificationPort {
  classify(rawText: string): BarrierCategory
}

export interface DemoRuntimePorts {
  readonly repository: SnapshotRepository
  readonly identity: IdentityPort
  readonly classifier: BarrierClassifierPort
  readonly deterministicClassifier: DeterministicClassificationPort
  readonly booking: BookingPort
  readonly clock: ClockPort
  readonly ids: IdPort
  readonly audit: AuditSinkPort
}

export interface ScenarioSelection {
  readonly scenarioId: ScenarioId
}
