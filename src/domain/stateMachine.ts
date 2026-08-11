import type { JourneyState } from './model'
import { err, ok, type Result } from './result'

const transitionTable: Readonly<Record<JourneyState, readonly JourneyState[]>> = {
  INVITED: ['ENGAGED', 'CAMPAIGN_CLOSED'],
  ENGAGED: ['BARRIER_CONFIRMED', 'DECLINED', 'OPTED_OUT', 'CAMPAIGN_CLOSED'],
  BARRIER_CONFIRMED: [
    'ACTION_OFFERED',
    'HUMAN_HANDOFF_PENDING',
    'DECLINED',
    'OPTED_OUT',
    'CAMPAIGN_CLOSED',
  ],
  ACTION_OFFERED: [
    'BOOKING_OFFERED',
    'HUMAN_HANDOFF_PENDING',
    'DECLINED',
    'OPTED_OUT',
    'CAMPAIGN_CLOSED',
  ],
  BOOKING_OFFERED: ['BOOKED', 'UNREACHABLE', 'DECLINED', 'OPTED_OUT', 'CAMPAIGN_CLOSED'],
  BOOKED: ['CANCELLED', 'COMPLETION_UNKNOWN', 'COMPLETED', 'CAMPAIGN_CLOSED'],
  COMPLETED: [],
  DECLINED: ['ENGAGED', 'CAMPAIGN_CLOSED'],
  OPTED_OUT: [],
  UNREACHABLE: ['ENGAGED', 'CAMPAIGN_CLOSED'],
  HUMAN_HANDOFF_PENDING: ['HUMAN_HANDOFF_RESOLVED', 'UNABLE_TO_CONTACT', 'OPTED_OUT', 'CAMPAIGN_CLOSED'],
  HUMAN_HANDOFF_RESOLVED: ['ACTION_OFFERED', 'DECLINED', 'OPTED_OUT', 'CAMPAIGN_CLOSED'],
  UNABLE_TO_CONTACT: ['ENGAGED', 'CAMPAIGN_CLOSED'],
  CANCELLED: ['BOOKING_OFFERED', 'OPTED_OUT', 'CAMPAIGN_CLOSED'],
  COMPLETION_UNKNOWN: ['COMPLETED', 'CAMPAIGN_CLOSED'],
  CAMPAIGN_CLOSED: [],
}

export const validNextStates = (state: JourneyState): readonly JourneyState[] => transitionTable[state]

export const transitionJourney = (
  from: JourneyState,
  to: JourneyState,
): Result<JourneyState> =>
  transitionTable[from].includes(to)
    ? ok(to)
    : err('INVALID_TRANSITION', `Cannot move a journey from ${from} to ${to}.`, 'Use one of the currently available actions.')
