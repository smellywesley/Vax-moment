import { describe, expect, it } from 'vitest'
import { projectEmployerDashboard, type EmployeeRecord } from './index'

const employees = (count: number): EmployeeRecord[] => Array.from({ length: count }, (_, index) => ({
  id: `employee-${index}`,
  scenarioId: 'convenience',
  campaignId: 'campaign',
  displayLabel: 'Synthetic employee',
  isPrimary: index === 0,
  state: index === 0 ? 'COMPLETED' : 'INVITED',
  stateVersion: 1,
}))

describe('employer privacy projection', () => {
  it.each([1, 9])('suppresses a cohort of %s without returning counts', (count) => {
    const result = projectEmployerDashboard(employees(count))
    expect(result.kind).toBe('suppressed')
    expect(result).not.toHaveProperty('metrics')
    expect(JSON.stringify(result)).not.toContain('employee-')
  })

  it('makes ten the first displayable cohort', () => {
    expect(projectEmployerDashboard(employees(10))).toMatchObject({ kind: 'displayed', metrics: { invited: 10 } })
  })
})
