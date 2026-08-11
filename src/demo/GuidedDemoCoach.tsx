import { useEffect, useRef, useState } from 'react';
import { ActionButton, LiveRegion, StatusBadge } from '../components';
import { GUIDED_CHECKPOINTS, type GuidedCheckpoint } from './checkpoints';
import { focusPageHeading } from './focus';

export interface GuidedDemoCoachProps {
  active: boolean;
  currentStep: number;
  checkpoints?: readonly GuidedCheckpoint[];
  onStepChange: (nextStep: number) => void;
  onExit: () => void;
  onRestart: () => void | Promise<void>;
  onPrimaryAction?: (checkpoint: GuidedCheckpoint) => boolean | Promise<boolean>;
  focusOnStepChange?: boolean;
}

export function GuidedDemoCoach({
  active,
  checkpoints = GUIDED_CHECKPOINTS,
  currentStep,
  focusOnStepChange = true,
  onExit,
  onPrimaryAction,
  onRestart,
  onStepChange,
}: GuidedDemoCoachProps) {
  const previousStep = useRef(currentStep);
  const [completedStep, setCompletedStep] = useState<number>();
  const [pending, setPending] = useState(false);
  const [actionAnnouncement, setActionAnnouncement] = useState('');
  const safeStep = Math.min(Math.max(currentStep, 0), Math.max(checkpoints.length - 1, 0));
  const checkpoint = checkpoints[safeStep];

  useEffect(() => {
    const stepChanged = previousStep.current !== safeStep;
    previousStep.current = safeStep;
    if (
      active &&
      focusOnStepChange &&
      checkpoint &&
      stepChanged
    ) {
      const frame = window.requestAnimationFrame(() => {
        focusPageHeading(checkpoint.targetHeadingId);
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [active, checkpoint, focusOnStepChange, safeStep]);

  if (!active || !checkpoint) {
    return null;
  }

  const progressMessage = `Step ${safeStep + 1} of ${checkpoints.length}: ${checkpoint.headline}`;

  async function runPrimaryAction() {
    if (!onPrimaryAction || !checkpoint || pending) return;
    setPending(true);
    try {
      const completed = await onPrimaryAction(checkpoint);
      if (completed) {
        setCompletedStep(safeStep);
        setActionAnnouncement('Checkpoint complete. Next is now available.');
      } else {
        setActionAnnouncement('Checkpoint was not completed. Review the visible message and retry.');
      }
    } catch {
      setActionAnnouncement('Checkpoint was not completed. Review the visible message and retry.');
    } finally {
      setPending(false);
    }
  }

  async function restart() {
    if (pending) return;
    setPending(true);
    try {
      await onRestart();
      setCompletedStep(undefined);
      setActionAnnouncement('Walkthrough restarted at step one.');
    } finally {
      setPending(false);
    }
  }

  return (
    <aside aria-labelledby="guided-demo-heading" className="vm-coach">
      <div className="vm-coach__header">
        <div>
          <p className="vm-eyebrow">Guided three-minute walkthrough</p>
          <h2 id="guided-demo-heading" tabIndex={-1}>{checkpoint.headline}</h2>
        </div>
        <StatusBadge tone="info">Walkthrough</StatusBadge>
      </div>

      <div className="vm-coach__progress">
        <span aria-hidden="true">
          Step {safeStep + 1} / {checkpoints.length}
        </span>
        <progress
          aria-label={`Guided walkthrough progress: ${safeStep + 1} of ${checkpoints.length}`}
          max={checkpoints.length}
          value={safeStep + 1}
        />
      </div>

      <p className="vm-coach__takeaway">
        <strong>Takeaway:</strong> {checkpoint.takeaway}
      </p>

      {onPrimaryAction ? (
        <ActionButton
          fullWidth
          disabled={pending}
          onClick={() => void runPrimaryAction()}
        >
          {pending ? 'Preparing checkpoint…' : checkpoint.primaryActionLabel}
        </ActionButton>
      ) : null}

      <nav aria-label="Guided walkthrough controls" className="vm-coach__controls">
        <ActionButton
          aria-label="Go to previous guided step"
          disabled={pending || safeStep === 0}
          onClick={() => {
            setActionAnnouncement('');
            onStepChange(safeStep - 1);
          }}
          variant="secondary"
        >
          Back
        </ActionButton>
        <ActionButton
          aria-label="Go to next guided step"
          disabled={
            pending
            || safeStep === checkpoints.length - 1
            || (Boolean(onPrimaryAction) && completedStep !== safeStep)
          }
          onClick={() => {
            setActionAnnouncement('');
            onStepChange(safeStep + 1);
          }}
        >
          Next
        </ActionButton>
        <ActionButton disabled={pending} onClick={onExit} variant="quiet">
          Exit
        </ActionButton>
        <ActionButton disabled={pending} onClick={() => void restart()} variant="quiet">
          Restart
        </ActionButton>
      </nav>
      <p className="vm-coach__escape-note">
        Exit returns to the ordinary product. Restart restores the default demo story.
      </p>
      <LiveRegion message={`${progressMessage}${actionAnnouncement ? ` ${actionAnnouncement}` : ''}`} />
    </aside>
  );
}
