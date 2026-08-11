import { ActionButton, StatusBadge, SurfaceCard } from '../../components';
import {
  BarrierActionTrace,
  type BarrierActionTraceProps,
} from './BarrierActionTrace';
import type { EmployeeAction, EvidenceStatus } from './types';

export interface GovernedNextActionProps {
  headline: string;
  description: string;
  evidenceStatus: EvidenceStatus;
  primaryAction: EmployeeAction;
  secondaryAction?: EmployeeAction;
  safetyNote?: string;
  trace: Omit<BarrierActionTraceProps, 'progress'>;
}

export function GovernedNextAction({
  description,
  evidenceStatus,
  headline,
  primaryAction,
  safetyNote = 'This is a non-clinical workflow action, not medical advice or a suitability decision.',
  secondaryAction,
  trace,
}: GovernedNextActionProps) {
  return (
    <SurfaceCard eyebrow="Governed next action" title={headline} titleId="employee-stage-heading">
      <p className="vm-lead">{description}</p>
      <div className="vm-inline-status">
        <span>Evidence status</span>
        <StatusBadge tone="info">{evidenceStatus}</StatusBadge>
      </div>
      <p className="vm-safety-note">{safetyNote}</p>
      <div className="vm-actions">
        <ActionButton
          disabled={primaryAction.disabled}
          onClick={primaryAction.onAction}
        >
          {primaryAction.label}
        </ActionButton>
        {secondaryAction ? (
          <ActionButton
            disabled={secondaryAction.disabled}
            onClick={secondaryAction.onAction}
            variant="secondary"
          >
            {secondaryAction.label}
          </ActionButton>
        ) : null}
      </div>
      <BarrierActionTrace {...trace} progress="authorized" />
    </SurfaceCard>
  );
}
