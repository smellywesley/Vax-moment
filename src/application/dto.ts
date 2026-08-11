import type {
  BarrierCategory,
  BookingSlot,
  EvidenceStatus,
  Intervention,
  JourneyState,
  Role,
  ScenarioId,
} from '../domain'
import type { EmployerDashboard } from '../domain'

export interface ScenarioSummary {
  readonly id: ScenarioId
  readonly label: string
}

export interface SessionView {
  readonly snapshotVersion: number
  readonly seedVersion: string
  readonly role: Role
  readonly scenarioId: ScenarioId
  readonly scenarios: readonly ScenarioSummary[]
  readonly syntheticDataNotice: 'Public demo · No real people or outcomes'
  readonly securityNotice: string
}

export interface EmployeeJourneyView {
  readonly scenarioId: ScenarioId
  readonly campaignId: string
  readonly employeeId: string
  readonly displayLabel: string
  readonly state: JourneyState
  readonly stateVersion: number
  readonly validNextStates: readonly JourneyState[]
  readonly barrierCategory?: BarrierCategory
  readonly intervention?: Intervention
  readonly booking?: BookingReceipt
  readonly handoff?: HandoffReceipt
}

export interface ClassificationView {
  readonly category: BarrierCategory
  readonly mode: 'simulated-classification' | 'deterministic-fallback'
  readonly evidenceStatus: 'Synthetic'
  readonly fallbackActive: boolean
  readonly fallbackReason?: 'CLASSIFIER_UNAVAILABLE' | 'INVALID_CLASSIFICATION'
  readonly safetyNote: string
}

export interface NextActionView {
  readonly intervention: Intervention
  readonly journey: EmployeeJourneyView
  readonly handoff?: HandoffReceipt
}

export interface BookingSlotsView {
  readonly slots: readonly BookingSlot[]
  readonly mode: 'simulated-booking' | 'deterministic-fallback'
  readonly fallbackActive: boolean
  readonly evidenceStatus: 'Synthetic'
  readonly alternatives?: string
}

export interface BookingReceipt {
  readonly id: string
  readonly reference: string
  readonly slotId: string
  readonly startsAt: string
  readonly location: string
  readonly evidenceStatus: 'Synthetic'
  readonly statusText: 'Demo appointment booked · Vaccination not yet confirmed'
}

export interface HandoffReceipt {
  readonly id: string
  readonly reference: string
  readonly status: 'Synthetic receipt — not submitted'
  readonly ownerRole: string
  readonly expectedResponseWindow: string
  readonly evidenceStatus: 'Synthetic'
  readonly messageSent: false
  readonly safetyNote: 'No message was sent or monitored in this demo.'
}

export interface OperatorEmployeeRow {
  readonly employeeId: string
  readonly displayLabel: string
  readonly state: JourneyState
  readonly stateVersion: number
  readonly barrierCategory?: BarrierCategory
  readonly needsAction: boolean
}

export interface OperatorDashboard {
  readonly scenarioId: ScenarioId
  readonly campaignTitle: string
  readonly evidenceStatus: 'Synthetic'
  readonly employees: readonly OperatorEmployeeRow[]
  readonly pendingHandoffs: number
  readonly bookedNotCompleted: number
}

export type EmployerDashboardView = EmployerDashboard

export interface SyntheticTimelineEventView {
  readonly id: string
  readonly scenarioId: ScenarioId
  readonly campaignId?: string
  readonly correlationId: string
  readonly actorRole: Role
  readonly command: string
  readonly priorState?: JourneyState
  readonly nextState?: JourneyState
  readonly resultCode: string
  readonly fallback: boolean
  readonly timestamp: string
}

export interface SyntheticTimelineView {
  readonly label: 'Synthetic event timeline'
  readonly evidenceStatus: 'Synthetic'
  readonly events: readonly SyntheticTimelineEventView[]
}

export interface CommandContext {
  readonly correlationId?: string
}

export interface VersionedCommandContext extends CommandContext {
  readonly expectedVersion: number
}

export interface VersionedEmployeeCommandContext extends VersionedCommandContext {
  readonly employeeId: string
}

export interface ConfirmBarrierCommand extends VersionedEmployeeCommandContext {
  readonly category: BarrierCategory
}

export interface BookSlotCommand extends VersionedEmployeeCommandContext {
  readonly slotId: string
}

export interface RecordCompletionCommand extends VersionedEmployeeCommandContext {
  readonly sourceReference?: string
}

export interface ClaimStatusView {
  readonly status: EvidenceStatus
}
