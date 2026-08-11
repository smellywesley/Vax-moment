import type { Role } from './model'
import { err, ok, type Result } from './result'

export type Capability =
  | 'read_own_journey'
  | 'classify_own_barrier'
  | 'mutate_own_journey'
  | 'read_operator_dashboard'
  | 'record_completion'
  | 'read_employer_aggregate'
  | 'read_timeline'
  | 'control_demo'

const permissions: Readonly<Record<Role, readonly Capability[]>> = {
  employee: ['read_own_journey', 'classify_own_barrier', 'mutate_own_journey', 'control_demo'],
  operator: ['read_operator_dashboard', 'record_completion', 'read_timeline', 'control_demo'],
  employer: ['read_employer_aggregate', 'control_demo'],
}

export const authorize = (role: Role, capability: Capability): Result<true> =>
  permissions[role].includes(capability)
    ? ok(true)
    : err('FORBIDDEN', 'This demo identity cannot perform that action.', 'Switch to the appropriate demo identity.')
