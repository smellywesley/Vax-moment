import { useId } from 'react';
import { StatusBadge } from '../../components';
import { getBarrierOption } from './barrierOptions';
import type { BarrierClassification } from './types';
import './barrier-action-trace.css';

export type BarrierTraceProgress = 'suggestion' | 'authorized' | 'executed';

export interface BarrierActionTraceProps {
  classification: BarrierClassification;
  progress: BarrierTraceProgress;
  policyAction?: string;
  policyRule?: string;
  executionLabel?: string;
  openByDefault?: boolean;
}

function TraceStatus({
  state,
}: {
  state: 'complete' | 'current' | 'pending';
}) {
  if (state === 'complete') return <StatusBadge tone="success">Complete</StatusBadge>;
  if (state === 'current') return <StatusBadge tone="info">Current</StatusBadge>;
  return <StatusBadge>Pending</StatusBadge>;
}

export function BarrierActionTrace({
  classification,
  executionLabel,
  policyAction,
  policyRule,
  progress,
  openByDefault = false,
}: BarrierActionTraceProps) {
  const headingId = useId();
  const option = getBarrierOption(classification.category);
  const suggestionDetail =
    classification.mode === 'preset'
      ? `Direct selection matched the allowlisted barrier “${option.shortLabel}”.`
      : classification.mode === 'deterministic-fallback'
        ? `Deterministic fallback suggested the allowlisted barrier “${option.shortLabel}”.`
        : `Language understanding suggested the allowlisted barrier “${option.shortLabel}”.`;
  const isAuthorized = progress === 'authorized' || progress === 'executed';
  const isExecuted = progress === 'executed';

  return (
    <details className="vm-action-trace" open={openByDefault || undefined}>
      <summary className="vm-action-trace__header">
        <div>
          <p className="vm-eyebrow">Decision controls</p>
          <h3 id={headingId}>Barrier-to-action trace</h3>
        </div>
        <StatusBadge tone="info">Inspectable</StatusBadge>
      </summary>
      <div className="vm-action-trace__body" aria-labelledby={headingId}>
        <p className="vm-action-trace__intro">
          Suggestion, consent, policy, and execution are separate checkpoints.
        </p>

        <ol className="vm-action-trace__steps">
        <li>
          <div className="vm-action-trace__step-heading">
            <span>1 · Understand</span>
            <TraceStatus state="complete" />
          </div>
          <strong>{option.family}</strong>
          <p>{suggestionDetail}</p>
        </li>
        <li aria-current={progress === 'suggestion' ? 'step' : undefined}>
          <div className="vm-action-trace__step-heading">
            <span>2 · Confirm</span>
            <TraceStatus state={progress === 'suggestion' ? 'current' : 'complete'} />
          </div>
          <strong>{progress === 'suggestion' ? 'Your decision' : 'Confirmed by user'}</strong>
          <p>
            {progress === 'suggestion'
              ? 'Nothing continues until you confirm or change the suggested category.'
              : 'The user explicitly accepted the category before policy evaluation.'}
          </p>
        </li>
        <li>
          <div className="vm-action-trace__step-heading">
            <span>3 · Authorize</span>
            <TraceStatus state={isAuthorized ? 'complete' : 'pending'} />
          </div>
          <strong>{isAuthorized ? 'Allowed by deterministic policy' : 'Policy check not run'}</strong>
          <p>
            {isAuthorized
              ? `${policyRule ? `Rule ${policyRule} mapped this category. ` : ''}${policyAction ?? option.nextAction} No model can override this allowlist.`
              : 'The confirmed category will be mapped to one pre-approved non-clinical action.'}
          </p>
        </li>
        <li aria-current={progress === 'authorized' ? 'step' : undefined}>
          <div className="vm-action-trace__step-heading">
            <span>4 · Act</span>
            <TraceStatus state={isExecuted ? 'complete' : isAuthorized ? 'current' : 'pending'} />
          </div>
          <strong>
            {isExecuted
              ? executionLabel ?? 'Action recorded'
              : isAuthorized
                ? 'Awaiting your action'
                : 'No action authorized'}
          </strong>
          <p>
            {isExecuted
              ? 'Execution has its own receipt and does not imply vaccination completion.'
              : 'Booking, handoff, and completion remain distinct events.'}
          </p>
        </li>
        </ol>

        <p className="vm-action-trace__boundary">
          <strong>Hard boundary:</strong> language understanding may suggest an allowlisted
          barrier only. Clinical suitability, programme eligibility, and vaccination
          completion decisions are forbidden.
        </p>
      </div>
    </details>
  );
}

export function MicrosoftExecutionPath() {
  const headingId = useId();

  return (
    <details className="vm-execution-path">
      <summary className="vm-execution-path__header">
        <div>
          <p className="vm-eyebrow">Point-of-use execution receipt</p>
          <h3 id={headingId}>How this reservation was handled</h3>
        </div>
        <StatusBadge tone="synthetic">Demo adapter</StatusBadge>
      </summary>
      <div aria-labelledby={headingId}>
        <dl className="vm-execution-path__comparison">
          <div>
            <dt>Current public demo</dt>
            <dd>
              A local deterministic adapter reserved seeded data. No Microsoft tenant,
              workflow, booking service, or clinical system was contacted.
            </dd>
          </div>
          <div>
            <dt>Proposed production path · not connected</dt>
            <dd>
              Copilot Studio suggests an allowlisted barrier → Power Automate enforces
              the approved action → Microsoft Bookings reserves the slot → Dataverse
              stores the auditable journey state.
            </dd>
          </div>
        </dl>
        <p>
          A later completion event would require a separate authorised source; a booking
          record can never create it.
        </p>
      </div>
    </details>
  );
}
