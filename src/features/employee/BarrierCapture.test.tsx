import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BarrierCapture } from './BarrierCapture';

describe('BarrierCapture', () => {
  it('keeps the real-data warning adjacent and offers a text skip', () => {
    render(
      <BarrierCapture
        onConfirmed={vi.fn()}
        onSkip={vi.fn()}
        onSubmit={vi.fn(() => ({
          category: 'ready' as const,
          mode: 'preset' as const,
        }))}
      />,
    );

    expect(
      screen.getByText('Do not enter real health or identifying information.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Skip optional text' })).toBeTruthy();
  });

  it('clears transient text after a successful confirmation', async () => {
    const onSubmit = vi.fn(() => ({
      category: 'convenience' as const,
      mode: 'simulated-classification' as const,
    }));
    const onConfirmed = vi.fn();

    render(
      <BarrierCapture
        onConfirmed={onConfirmed}
        onSkip={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByLabelText(/Optional fictional text/);
    fireEvent.change(input, {
      target: { value: 'The fictional clinic hours overlap with my shift' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm fictional barrier' }),
    );

    await waitFor(() => expect(onConfirmed).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      selectedCategory: undefined,
      transientText: 'The fictional clinic hours overlap with my shift',
    });
    expect((input as HTMLTextAreaElement).value).toBe('');
  });
});
