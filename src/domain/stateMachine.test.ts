import { describe, expect, it } from 'vitest'
import { journeyStates, transitionJourney, validNextStates } from './index'

describe('campaign state machine', () => {
  it('allows every declared edge and rejects every other edge', () => {
    for (const from of journeyStates) {
      for (const to of journeyStates) {
        expect(transitionJourney(from, to).ok).toBe(validNextStates(from).includes(to))
      }
    }
  })

  it('never permits a booking to move backwards to barrier confirmation', () => {
    const result = transitionJourney('BOOKED', 'BARRIER_CONFIRMED')
    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } })
  })
})
