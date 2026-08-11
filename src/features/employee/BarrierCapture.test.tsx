import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BarrierCapture } from './BarrierCapture';
import { BARRIER_FAMILIES, BARRIER_OPTIONS } from './barrierOptions';

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
      screen.getByText('Do not enter personal, identifying, or medical information.'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Skip optional context' })).toBeTruthy();
    expect(screen.getByText('Ready')).toBeTruthy();
    expect(screen.getByText('Practical access')).toBeTruthy();
    expect(screen.getByText('Information / confidence')).toBeTruthy();
    expect(screen.getByText('Clinical / private')).toBeTruthy();
    expect(screen.getAllByText('Not now')).toHaveLength(2);
    expect(screen.getByRole('group', { name: /Practical access/i })).toBeTruthy();
  });

  it('maps every governed category to exactly one matching family', () => {
    const groupedCategories = BARRIER_FAMILIES.flatMap((family) =>
      family.categories.map((category) => ({ category, family: family.family })),
    );
    expect(groupedCategories).toHaveLength(BARRIER_OPTIONS.length);
    expect(new Set(groupedCategories.map(({ category }) => category)).size).toBe(
      BARRIER_OPTIONS.length,
    );
    for (const option of BARRIER_OPTIONS) {
      expect(groupedCategories).toContainEqual({
        category: option.category,
        family: option.family,
      });
    }
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

    const input = screen.getByLabelText(/Optional context/);
    fireEvent.change(input, {
      target: { value: 'The fictional clinic hours overlap with my shift' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm barrier' }),
    );

    await waitFor(() => expect(onConfirmed).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      selectedCategory: undefined,
      transientText: 'The fictional clinic hours overlap with my shift',
    });
    expect((input as HTMLTextAreaElement).value).toBe('');
  });
});
