import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GuidedDemoCoach } from './GuidedDemoCoach';
import { GUIDED_CHECKPOINTS, GUIDED_WALKTHROUGH_SECONDS } from './checkpoints';

describe('GuidedDemoCoach', () => {
  it('defines exactly seven checkpoints in the three-minute envelope', () => {
    expect(GUIDED_CHECKPOINTS).toHaveLength(7);
    expect(GUIDED_WALKTHROUGH_SECONDS).toBeLessThanOrEqual(165);
  });

  it('offers named Back, Next, Exit, and Restart controls', () => {
    const onStepChange = vi.fn();
    const onExit = vi.fn();
    const onRestart = vi.fn();

    render(
      <GuidedDemoCoach
        active
        currentStep={1}
        focusOnStepChange={false}
        onExit={onExit}
        onRestart={onRestart}
        onStepChange={onStepChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to previous guided step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to next guided step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));

    expect(onStepChange).toHaveBeenNthCalledWith(1, 0);
    expect(onStepChange).toHaveBeenNthCalledWith(2, 2);
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('enables Next only after a successful checkpoint and clears completion on restart', async () => {
    const onPrimaryAction = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(
      <GuidedDemoCoach
        active
        currentStep={0}
        focusOnStepChange={false}
        onExit={vi.fn()}
        onPrimaryAction={onPrimaryAction}
        onRestart={vi.fn()}
        onStepChange={vi.fn()}
      />,
    );
    const next = screen.getByRole('button', { name: 'Go to next guided step' });
    const primary = screen.getByRole('button', { name: GUIDED_CHECKPOINTS[0]?.primaryActionLabel });
    expect(next).toBeDisabled();

    fireEvent.click(primary);
    await waitFor(() => expect(onPrimaryAction).toHaveBeenCalledTimes(1));
    expect(next).toBeDisabled();

    fireEvent.click(primary);
    await waitFor(() => expect(next).toBeEnabled());
    expect(screen.getByText(/Checkpoint complete\. Next is now available\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    await waitFor(() => expect(next).toBeDisabled());
  });

  it('disables every coach control while a checkpoint is pending', async () => {
    let resolveAction: ((value: boolean) => void) | undefined;
    const pendingAction = new Promise<boolean>((resolve) => { resolveAction = resolve; });
    render(
      <GuidedDemoCoach
        active
        currentStep={0}
        focusOnStepChange={false}
        onExit={vi.fn()}
        onPrimaryAction={() => pendingAction}
        onRestart={vi.fn()}
        onStepChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: GUIDED_CHECKPOINTS[0]?.primaryActionLabel }));
    await waitFor(() => {
      expect(screen.getAllByRole('button').every((button) => button.hasAttribute('disabled'))).toBe(true);
    });
    resolveAction?.(true);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Exit' })).toBeEnabled());
  });
});
