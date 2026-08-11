import { PRIVACY_THRESHOLD, type EmployeeRecord } from './model'

export interface EmployerMetrics {
  readonly invited: number
  readonly engaged: number
  readonly booked: number
  readonly completed: number
  readonly completionRatePercent: number
}

export type EmployerDashboard =
  | {
      readonly kind: 'displayed'
      readonly evidenceStatus: 'Synthetic'
      readonly privacyNote: string
      readonly metrics: EmployerMetrics
    }
  | {
      readonly kind: 'suppressed'
      readonly evidenceStatus: 'Synthetic'
      readonly threshold: typeof PRIVACY_THRESHOLD
      readonly privacyNote: string
    }
  | {
      readonly kind: 'empty'
      readonly evidenceStatus: 'Synthetic'
      readonly privacyNote: string
    }

const engagedStates = new Set([
  'ENGAGED',
  'BARRIER_CONFIRMED',
  'ACTION_OFFERED',
  'BOOKING_OFFERED',
  'BOOKED',
  'COMPLETED',
  'HUMAN_HANDOFF_PENDING',
  'HUMAN_HANDOFF_RESOLVED',
  'COMPLETION_UNKNOWN',
])

export const projectEmployerDashboard = (employees: readonly EmployeeRecord[]): EmployerDashboard => {
  if (employees.length === 0) {
    return {
      kind: 'empty',
      evidenceStatus: 'Synthetic',
      privacyNote: 'No synthetic campaign outcomes are available.',
    }
  }

  if (employees.length < PRIVACY_THRESHOLD) {
    return {
      kind: 'suppressed',
      evidenceStatus: 'Synthetic',
      threshold: PRIVACY_THRESHOLD,
      privacyNote: 'This fixed aggregate view is hidden because the cohort contains fewer than 10 synthetic people.',
    }
  }

  const completed = employees.filter((employee) => employee.state === 'COMPLETED').length
  const booked = employees.filter((employee) =>
    ['BOOKED', 'COMPLETION_UNKNOWN', 'COMPLETED'].includes(employee.state),
  ).length
  const engaged = employees.filter((employee) => engagedStates.has(employee.state)).length

  return {
    kind: 'displayed',
    evidenceStatus: 'Synthetic',
    privacyNote: 'Aggregate-only demonstration with small-cell suppression. This is not a production privacy firewall.',
    metrics: {
      invited: employees.length,
      engaged,
      booked,
      completed,
      completionRatePercent: Math.round((completed / employees.length) * 100),
    },
  }
}
