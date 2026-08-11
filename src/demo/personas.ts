export type DemoPersonaRole = 'employee' | 'operator' | 'employer';

export interface DemoPersona {
  id: string;
  displayName: string;
  role: DemoPersonaRole;
  roleLabel: 'Employee' | 'Parkway operator' | 'Employer';
  scenarioLabel: string;
  synthetic: true;
}

export const DEMO_PERSONAS: readonly DemoPersona[] = [
  {
    id: 'employee-convenience',
    displayName: 'Maya (fictional)',
    role: 'employee',
    roleLabel: 'Employee',
    scenarioLabel: 'Convenience barrier',
    synthetic: true,
  },
  {
    id: 'employee-clinical',
    displayName: 'Arun (fictional)',
    role: 'employee',
    roleLabel: 'Employee',
    scenarioLabel: 'Clinical question handoff',
    synthetic: true,
  },
  {
    id: 'parkway-operator',
    displayName: 'Parkway demo operator',
    role: 'operator',
    roleLabel: 'Parkway operator',
    scenarioLabel: 'Synthetic completion checkpoint',
    synthetic: true,
  },
  {
    id: 'employer-reviewer',
    displayName: 'Employer programme lead',
    role: 'employer',
    roleLabel: 'Employer',
    scenarioLabel: 'Aggregate-only outcomes',
    synthetic: true,
  },
] as const;

export function getDemoPersona(id: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((persona) => persona.id === id);
}
