import { describe, expect, it } from 'vitest'
import { createDemoRuntime } from '../adapters/demo'
import type { Result } from '../domain'
import type { StorageLike } from '../adapters/demo'

function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
  return result.value
}

describe('VaxMomentService', () => {
  it('never stores or audits transient free text', async () => {
    const sentinel = 'SENTINEL-RAW-HEALTH-TEXT-9917'
    const runtime = createDemoRuntime()
    const classified = await runtime.service.classifyBarrier({ rawText: sentinel })
    expect(classified.ok).toBe(true)
    const snapshot = runtime.repository.load()
    expect(snapshot.ok).toBe(true)
    expect(JSON.stringify(snapshot)).not.toContain(sentinel)
    expect(JSON.stringify(runtime.audit.events())).not.toContain(sentinel)
  })

  it('visibly labels deterministic classifier fallback', async () => {
    const runtime = createDemoRuntime({ classifierMode: 'unavailable' })
    const result = await runtime.service.classifyBarrier({ rawText: 'I am busy during office hours' })
    expect(result).toMatchObject({ ok: true, value: { category: 'convenience', fallbackActive: true, mode: 'deterministic-fallback' } })
  })

  it('fails closed for urgent, mixed-intent, and multilingual safety phrases', async () => {
    const cases = [
      'I have chest pain and want to book',
      'I cannot breathe and need an appointment',
      'I fainted and am ready',
      'I am having a seizure but want to book',
      'My lips and tongue are swelling; book me now',
      'I am choking and need an appointment',
      'My face is drooping and I want to book',
      'I have severe bleeding and need an appointment',
      'I have sudden weakness on one side and want a booking',
      '我胸痛但想预约',
      'Saya sakit dada dan mahu tempah janji temu',
    ]

    for (const rawText of cases) {
      const runtime = createDemoRuntime()
      expect(await runtime.service.classifyBarrier({ rawText })).toMatchObject({
        ok: true,
        value: { category: 'clinical_question' },
      })
    }
  })

  it('only classifies complete allowlisted non-clinical free-text templates', async () => {
    const runtime = createDemoRuntime()
    const cases = [
      ['I am ready to book', 'ready'],
      ['I am busy during office hours', 'convenience'],
      ['The clinic hours overlap with my shift', 'convenience'],
      ['Cost is my concern', 'cost_or_access'],
      ['I want to opt out', 'decline_or_opt_out'],
      ['I need more information', 'information'],
    ] as const

    for (const [rawText, category] of cases) {
      expect(await runtime.service.classifyBarrier({ rawText })).toMatchObject({
        ok: true,
        value: { category },
      })
    }
  })

  it('keeps booking separate from operator-attested completion', async () => {
    const runtime = createDemoRuntime()
    const initial = expectOk(await runtime.service.getEmployeeJourney())
    const confirmed = expectOk(await runtime.service.confirmBarrier({ category: 'convenience', employeeId: initial.employeeId, expectedVersion: initial.stateVersion }))
    const offered = expectOk(await runtime.service.offerNextAction({ employeeId: confirmed.employeeId, expectedVersion: confirmed.stateVersion }))
    const slots = expectOk(await runtime.service.getBookingSlots({ employeeId: offered.journey.employeeId, expectedVersion: offered.journey.stateVersion }))
    const firstSlot = slots.slots[0]
    expect(firstSlot).toBeDefined()
    const bookingJourney = expectOk(await runtime.service.getEmployeeJourney())
    expectOk(await runtime.service.bookSlot({ employeeId: bookingJourney.employeeId, slotId: firstSlot?.id ?? '', expectedVersion: bookingJourney.stateVersion }))
    expectOk(await runtime.service.switchRole('employer'))
    const before = await runtime.service.getEmployerDashboard()
    expect(before.ok && before.value.kind === 'displayed' ? before.value.metrics.completed : -1).toBe(5)
    expectOk(await runtime.service.switchRole('operator'))
    const dashboard = expectOk(await runtime.service.getOperatorDashboard())
    const operatorEmployee = dashboard.employees[0]
    expect(operatorEmployee).toBeDefined()
    expectOk(await runtime.service.recordCompletion({
      employeeId: operatorEmployee?.employeeId ?? '',
      expectedVersion: operatorEmployee?.stateVersion ?? -1,
    }))
    expectOk(await runtime.service.switchRole('employer'))
    const after = await runtime.service.getEmployerDashboard()
    expect(after.ok && after.value.kind === 'displayed' ? after.value.metrics.completed : -1).toBe(6)
  })

  it('returns an aggregate-only suppressed employer DTO', async () => {
    const runtime = createDemoRuntime()
    await runtime.service.selectScenario('clinical_handoff')
    await runtime.service.switchRole('employer')
    const result = await runtime.service.getEmployerDashboard()
    expect(result).toMatchObject({ ok: true, value: { kind: 'suppressed', threshold: 10 } })
    expect(JSON.stringify(result)).not.toMatch(/employeeId|barrierCategory|bookingId|handoff/i)
  })

  it('creates a non-monitored clinical handoff with no answer content', async () => {
    const runtime = createDemoRuntime()
    const selected = expectOk(await runtime.service.selectScenario('clinical_handoff'))
    const confirmed = expectOk(await runtime.service.confirmBarrier({ category: 'clinical_question', employeeId: selected.employeeId, expectedVersion: selected.stateVersion }))
    const action = await runtime.service.offerNextAction({ employeeId: confirmed.employeeId, expectedVersion: confirmed.stateVersion })
    expect(action).toMatchObject({ ok: true, value: { handoff: { messageSent: false, safetyNote: 'No message was sent or monitored in this demo.' } } })
    expect(JSON.stringify(action)).not.toMatch(/diagnos|eligible|suitable/i)
  })

  it('resets to the identical canonical snapshot after mutations', async () => {
    const runtime = createDemoRuntime()
    const initial = runtime.repository.reset()
    const journey = expectOk(await runtime.service.getEmployeeJourney())
    expectOk(await runtime.service.confirmBarrier({ category: 'ready', employeeId: journey.employeeId, expectedVersion: journey.stateVersion }))
    expectOk(await runtime.service.switchRole('operator'))
    expectOk(await runtime.service.reset())
    const restored = runtime.repository.load()
    expect(restored).toEqual(initial)
  })

  it('books a deterministic fallback slot when the booking adapter is unavailable', async () => {
    const runtime = createDemoRuntime({ bookingMode: 'unavailable' })
    const initial = expectOk(await runtime.service.getEmployeeJourney())
    const confirmed = expectOk(await runtime.service.confirmBarrier({
      category: 'convenience',
      employeeId: initial.employeeId,
      expectedVersion: initial.stateVersion,
    }))
    const offered = expectOk(await runtime.service.offerNextAction({
      employeeId: confirmed.employeeId,
      expectedVersion: confirmed.stateVersion,
    }))
    const slots = expectOk(await runtime.service.getBookingSlots({
      employeeId: offered.journey.employeeId,
      expectedVersion: offered.journey.stateVersion,
    }))
    expect(slots.fallbackActive).toBe(true)
    const firstSlot = slots.slots[0]
    expect(firstSlot).toBeDefined()
    const bookingJourney = expectOk(await runtime.service.getEmployeeJourney())
    const booked = await runtime.service.bookSlot({
      employeeId: bookingJourney.employeeId,
      slotId: firstSlot?.id ?? '',
      expectedVersion: bookingJourney.stateVersion,
    })
    expect(booked).toMatchObject({
      ok: true,
      value: { statusText: 'Demo appointment booked · Vaccination not yet confirmed' },
    })
  })

  it('does not turn non-booking policy actions into booking access', async () => {
    const runtime = createDemoRuntime()
    const initial = expectOk(await runtime.service.getEmployeeJourney())
    const confirmed = expectOk(await runtime.service.confirmBarrier({
      category: 'information',
      employeeId: initial.employeeId,
      expectedVersion: initial.stateVersion,
    }))
    const offered = expectOk(await runtime.service.offerNextAction({
      employeeId: confirmed.employeeId,
      expectedVersion: confirmed.stateVersion,
    }))
    expect(await runtime.service.getBookingSlots({
      employeeId: offered.journey.employeeId,
      expectedVersion: offered.journey.stateVersion,
    })).toMatchObject({ ok: false, error: { code: 'FORBIDDEN' } })
  })

  it('records opt-out without attempting an invalid transition', async () => {
    const runtime = createDemoRuntime()
    const initial = expectOk(await runtime.service.getEmployeeJourney())
    const confirmed = expectOk(await runtime.service.confirmBarrier({
      category: 'decline_or_opt_out',
      employeeId: initial.employeeId,
      expectedVersion: initial.stateVersion,
    }))
    const offered = await runtime.service.offerNextAction({
      employeeId: confirmed.employeeId,
      expectedVersion: confirmed.stateVersion,
    })
    expect(offered).toMatchObject({
      ok: true,
      value: { journey: { state: 'OPTED_OUT' }, intervention: { action: 'record_opt_out' } },
    })
  })

  it('restricts timelines to operators and returns an allowlisted DTO', async () => {
    const runtime = createDemoRuntime()
    expect(await runtime.service.getSyntheticTimeline()).toMatchObject({
      ok: false,
      error: { code: 'FORBIDDEN' },
    })
    await runtime.service.switchRole('operator')
    const timeline = await runtime.service.getSyntheticTimeline()
    expect(timeline.ok).toBe(true)
    expect(JSON.stringify(timeline)).not.toMatch(/employeeId|sourceReference|completion/i)
  })

  it('rejects a stale employee command after the active scenario changes', async () => {
    const runtime = createDemoRuntime()
    const staleJourney = expectOk(await runtime.service.getEmployeeJourney())
    expectOk(await runtime.service.selectScenario('clinical_handoff'))

    expect(await runtime.service.confirmBarrier({
      category: 'ready',
      employeeId: staleJourney.employeeId,
      expectedVersion: staleJourney.stateVersion,
    })).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } })
  })

  it('rejects employee-role mutations against non-primary cohort records', async () => {
    const runtime = createDemoRuntime()
    const snapshot = expectOk(runtime.repository.load())
    const nonPrimary = snapshot.employees.find((employee) =>
      employee.scenarioId === snapshot.activeScenarioId && !employee.isPrimary,
    )
    expect(nonPrimary).toBeDefined()

    expect(await runtime.service.confirmBarrier({
      category: 'ready',
      employeeId: nonPrimary?.id ?? '',
      expectedVersion: nonPrimary?.stateVersion ?? -1,
    })).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } })
  })

  it('continues unique identifiers after a browser reload', async () => {
    const storage: StorageLike = {
      value: null as string | null,
      getItem() { return this.value },
      setItem(_key: string, value: string) { this.value = value },
    } as StorageLike & { value: string | null }
    const firstRuntime = createDemoRuntime({ storage })
    const firstJourney = expectOk(await firstRuntime.service.getEmployeeJourney())
    const confirmed = expectOk(await firstRuntime.service.confirmBarrier({
      category: 'convenience',
      employeeId: firstJourney.employeeId,
      expectedVersion: firstJourney.stateVersion,
    }))

    const reloadedRuntime = createDemoRuntime({ storage })
    expectOk(await reloadedRuntime.service.offerNextAction({
      employeeId: confirmed.employeeId,
      expectedVersion: confirmed.stateVersion,
    }))
    const snapshot = expectOk(reloadedRuntime.repository.load())
    expect(new Set(snapshot.timeline.map(({ id }) => id)).size).toBe(snapshot.timeline.length)
  })
})
