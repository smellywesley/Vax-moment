import type { BarrierCategory, BarrierOption } from './types';

export const BARRIER_OPTIONS: readonly BarrierOption[] = [
  {
    category: 'ready',
    shortLabel: 'Ready to book',
    prompt: 'I am ready and want a convenient appointment.',
    confirmation: 'Choose a convenient appointment.',
    nextAction: 'Show available workplace or clinic slots.',
    evidenceStatus: 'Synthetic workflow',
  },
  {
    category: 'convenience',
    shortLabel: 'Timing or location',
    prompt: 'The available times or locations do not fit my schedule.',
    confirmation: "Let’s find an option that fits your schedule.",
    nextAction: 'Prioritise nearby, on-site, and suitable-time slots.',
    evidenceStatus: 'Evidence-informed · outcome To Validate',
  },
  {
    category: 'cost_or_access',
    shortLabel: 'Cost or access',
    prompt: 'I need help understanding programme access or cost.',
    confirmation: 'See the programme options and what to confirm with the clinic.',
    nextAction: 'Show campaign information and a human contact.',
    evidenceStatus: 'Source-linked · individual applicability To Validate',
  },
  {
    category: 'information',
    shortLabel: 'More information',
    prompt: 'I want trusted general information before deciding.',
    confirmation: 'Review trusted information or ask a healthcare professional.',
    nextAction: 'Show curated evidence and a human-information route.',
    evidenceStatus: 'Source-linked',
  },
  {
    category: 'clinical_question',
    shortLabel: 'Personal medical question',
    prompt: 'I have a question about whether vaccination is suitable for me.',
    confirmation: 'A healthcare professional should answer this.',
    nextAction: 'Create a synthetic human-handoff receipt. Do not generate an answer.',
    evidenceStatus: 'Product safety rule · To Validate',
  },
  {
    category: 'decline_or_opt_out',
    shortLabel: 'Not now',
    prompt: 'I do not want to continue right now.',
    confirmation: 'Your choice is recorded. You can return while the campaign is open.',
    nextAction: 'Record the choice without pressure.',
    evidenceStatus: 'Product rule',
  },
] as const;

export function getBarrierOption(category: BarrierCategory): BarrierOption {
  const option = BARRIER_OPTIONS.find((candidate) => candidate.category === category);

  if (!option) {
    throw new Error(`Unknown barrier category: ${category}`);
  }

  return option;
}
