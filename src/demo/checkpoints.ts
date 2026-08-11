import type { DemoPersonaRole } from './personas';

export interface GuidedCheckpoint {
  id: string;
  role: DemoPersonaRole;
  headline: string;
  takeaway: string;
  primaryActionLabel: string;
  targetHeadingId: string;
  suggestedSeconds: number;
}

export const GUIDED_CHECKPOINTS: readonly GuidedCheckpoint[] = [
  {
    id: 'promise-and-barrier',
    role: 'employee',
    headline: 'Start with privacy and one barrier',
    takeaway:
      'The employee can disclose less, skip optional text, and still reach a useful next step.',
    primaryActionLabel: 'Choose a barrier',
    targetHeadingId: 'page-heading',
    suggestedSeconds: 35,
  },
  {
    id: 'confirm-category',
    role: 'employee',
    headline: 'Confirm the category before it affects the workflow',
    takeaway:
      'Simulated classification categorises intent; it never decides clinical eligibility or suitability.',
    primaryActionLabel: 'Confirm the prepared category',
    targetHeadingId: 'page-heading',
    suggestedSeconds: 20,
  },
  {
    id: 'book-slot',
    role: 'employee',
    headline: 'Book one seeded appointment',
    takeaway:
      'The receipt says booked, not completed, and remains usable when external services are unavailable.',
    primaryActionLabel: 'Book the seeded slot',
    targetHeadingId: 'page-heading',
    suggestedSeconds: 20,
  },
  {
    id: 'operator-checkpoint',
    role: 'operator',
    headline: 'Record a separate completion checkpoint',
    takeaway:
      'Booking cannot silently become completion; the Parkway operator owns the distinct checkpoint.',
    primaryActionLabel: 'Open the Parkway checkpoint',
    targetHeadingId: 'operator-heading',
    suggestedSeconds: 20,
  },
  {
    id: 'employer-reveal',
    role: 'employer',
    headline: 'Reveal aggregate outcomes only',
    takeaway:
      'The employer receives a fixed aggregate view while cohorts below 10 are visibly suppressed.',
    primaryActionLabel: 'View aggregate outcomes',
    targetHeadingId: 'employer-heading',
    suggestedSeconds: 25,
  },
  {
    id: 'safety-resilience-evidence',
    role: 'employee',
    headline: 'Prove the safety and resilience boundaries',
    takeaway:
      'Clinical wording routes to a non-monitored human handoff; fallback and evidence status stay visible.',
    primaryActionLabel: 'View safety proof point',
    targetHeadingId: 'page-heading',
    suggestedSeconds: 30,
  },
  {
    id: 'close',
    role: 'employer',
    headline: 'Close with what the prototype proves',
    takeaway:
      'The workflow is demonstrated; buyer demand, uplift, completion-data access, and production security remain to validate.',
    primaryActionLabel: 'Review validation boundaries',
    targetHeadingId: 'employer-heading',
    suggestedSeconds: 15,
  },
] as const;

export const GUIDED_WALKTHROUGH_SECONDS = GUIDED_CHECKPOINTS.reduce(
  (total, checkpoint) => total + checkpoint.suggestedSeconds,
  0,
);
