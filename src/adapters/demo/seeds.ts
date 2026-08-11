import {
  SEED_VERSION,
  SNAPSHOT_SCHEMA_VERSION,
  type DemoSnapshot,
  type EmployeeRecord,
  type JourneyState,
  type ScenarioId,
} from '../../domain'

const campaignIds: Readonly<Record<ScenarioId, string>> = {
  ready_to_book: 'campaign-ready',
  convenience: 'campaign-convenience',
  clinical_handoff: 'campaign-clinical',
}

const makeCohort = (
  scenarioId: ScenarioId,
  size: number,
  states: readonly JourneyState[],
): readonly EmployeeRecord[] =>
  Array.from({ length: size }, (_, index) => ({
    id: `${scenarioId}-employee-${index + 1}`,
    scenarioId,
    campaignId: campaignIds[scenarioId],
    displayLabel: index === 0 ? 'You · fictional employee' : `Fictional employee ${index + 1}`,
    isPrimary: index === 0,
    state: index === 0 ? 'ENGAGED' : (states[(index - 1) % states.length] ?? 'INVITED'),
    stateVersion: 1,
  }))

export const createCanonicalSnapshot = (): DemoSnapshot => ({
  schemaVersion: SNAPSHOT_SCHEMA_VERSION,
  seedVersion: SEED_VERSION,
  version: 1,
  activeScenarioId: 'convenience',
  activeRole: 'employee',
  campaigns: [
    {
      id: campaignIds.ready_to_book,
      scenarioId: 'ready_to_book',
      title: 'Northstar influenza campaign · ready path',
      organisationLabel: 'Northstar Pte Ltd (synthetic)',
      closesAt: '2026-09-30T15:59:59.000Z',
    },
    {
      id: campaignIds.convenience,
      scenarioId: 'convenience',
      title: 'Northstar influenza campaign · schedule path',
      organisationLabel: 'Northstar Pte Ltd (synthetic)',
      closesAt: '2026-09-30T15:59:59.000Z',
    },
    {
      id: campaignIds.clinical_handoff,
      scenarioId: 'clinical_handoff',
      title: 'Harbour Studio influenza campaign · clinical handoff',
      organisationLabel: 'Harbour Studio (synthetic)',
      closesAt: '2026-09-30T15:59:59.000Z',
    },
  ],
  employees: [
    ...makeCohort('ready_to_book', 12, ['INVITED', 'ENGAGED', 'BOOKED', 'COMPLETED']),
    ...makeCohort('convenience', 24, ['INVITED', 'ENGAGED', 'BOOKED', 'COMPLETED']),
    ...makeCohort('clinical_handoff', 9, ['INVITED', 'ENGAGED', 'HUMAN_HANDOFF_PENDING']),
  ],
  bookings: [],
  handoffs: [],
  timeline: [],
})

export const demoCampaignIds = campaignIds
