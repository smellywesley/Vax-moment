export const SNAPSHOT_SCHEMA_VERSION = 1 as const
export const SEED_VERSION = '2026-08-10.1' as const
export const PRIVACY_THRESHOLD = 10 as const

export type Role = 'employee' | 'operator' | 'employer'
export type ScenarioId = 'ready_to_book' | 'convenience' | 'clinical_handoff'
export type EvidenceStatus = 'Verified' | 'Synthetic' | 'Assumed' | 'To Validate'

export const barrierCategories = [
  'ready',
  'convenience',
  'cost_or_access',
  'information',
  'clinical_question',
  'decline_or_opt_out',
] as const

export type BarrierCategory = (typeof barrierCategories)[number]

export const journeyStates = [
  'INVITED',
  'ENGAGED',
  'BARRIER_CONFIRMED',
  'ACTION_OFFERED',
  'BOOKING_OFFERED',
  'BOOKED',
  'COMPLETED',
  'DECLINED',
  'OPTED_OUT',
  'UNREACHABLE',
  'HUMAN_HANDOFF_PENDING',
  'HUMAN_HANDOFF_RESOLVED',
  'UNABLE_TO_CONTACT',
  'CANCELLED',
  'COMPLETION_UNKNOWN',
  'CAMPAIGN_CLOSED',
] as const

export type JourneyState = (typeof journeyStates)[number]

export interface Campaign {
  readonly id: string
  readonly scenarioId: ScenarioId
  readonly title: string
  readonly organisationLabel: string
  readonly closesAt: string
}

export interface EmployeeRecord {
  readonly id: string
  readonly scenarioId: ScenarioId
  readonly campaignId: string
  readonly displayLabel: string
  readonly isPrimary: boolean
  readonly state: JourneyState
  readonly stateVersion: number
  readonly barrierCategory?: BarrierCategory
  readonly interventionId?: string
  readonly bookingId?: string
  readonly handoffId?: string
}

export interface BookingRecord {
  readonly id: string
  readonly scenarioId: ScenarioId
  readonly campaignId: string
  readonly employeeId: string
  readonly slotId: string
  readonly bookedAt: string
  readonly evidenceStatus: 'Synthetic'
}

export interface HandoffRecord {
  readonly id: string
  readonly scenarioId: ScenarioId
  readonly campaignId: string
  readonly employeeId: string
  readonly status: 'pending' | 'resolved' | 'unable_to_contact'
  readonly ownerRole: 'Proposed accountable clinical service — not agreed'
  readonly expectedResponseWindow: 'Must be agreed before any pilot'
  readonly createdAt: string
  readonly evidenceStatus: 'Synthetic'
  readonly messageSent: false
}

export interface CompletionProvenance {
  readonly sourceType: 'operator_attestation'
  readonly sourceReference: string
  readonly recordedByRole: 'operator'
  readonly eventAt: string
  readonly receivedAt: string
  readonly verificationStatus: 'synthetic_unverified'
  readonly version: number
  readonly supersedesEventId?: string
}

export type CommandName =
  | 'SWITCH_ROLE'
  | 'SELECT_SCENARIO'
  | 'CLASSIFY_BARRIER'
  | 'CONFIRM_BARRIER'
  | 'OFFER_NEXT_ACTION'
  | 'QUERY_SLOTS'
  | 'BOOK_SLOT'
  | 'RECORD_COMPLETION'
  | 'QUERY_EMPLOYER_DASHBOARD'
  | 'QUERY_OPERATOR_DASHBOARD'
  | 'RESET_DEMO'

export interface SyntheticEvent {
  readonly id: string
  readonly scenarioId: ScenarioId
  readonly campaignId?: string
  readonly employeeId?: string
  readonly correlationId: string
  readonly actorRole: Role
  readonly command: CommandName
  readonly priorState?: JourneyState
  readonly nextState?: JourneyState
  readonly resultCode: string
  readonly fallback: boolean
  readonly timestamp: string
  readonly completion?: CompletionProvenance
}

export interface DemoSnapshot {
  readonly schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION
  readonly seedVersion: string
  readonly version: number
  readonly activeScenarioId: ScenarioId
  readonly activeRole: Role
  readonly campaigns: readonly Campaign[]
  readonly employees: readonly EmployeeRecord[]
  readonly bookings: readonly BookingRecord[]
  readonly handoffs: readonly HandoffRecord[]
  readonly timeline: readonly SyntheticEvent[]
}

export interface Intervention {
  readonly id: string
  readonly category: BarrierCategory
  readonly wording: string
  readonly action:
    | 'show_slots'
    | 'show_campaign_access'
    | 'show_trusted_information'
    | 'create_handoff'
    | 'record_opt_out'
  readonly escalationTrigger: string
  readonly evidenceStatus: EvidenceStatus
  readonly approver: string
}

export interface BookingSlot {
  readonly id: string
  readonly campaignId: string
  readonly startsAt: string
  readonly location: string
  readonly channel: 'workplace' | 'clinic'
  readonly versionToken: string
  readonly evidenceStatus: 'Synthetic'
}
