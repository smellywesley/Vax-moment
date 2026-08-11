import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CategoryConfirmation } from './CategoryConfirmation';

describe('CategoryConfirmation', () => {
  it('locks both actions while the governed transition is pending', () => {
    const onContinue = vi.fn();
    const onChange = vi.fn();
    render(
      <CategoryConfirmation
        classification={{ category: 'convenience', mode: 'preset' }}
        disabled
        onChange={onChange}
        onContinue={onContinue}
      />,
    );

    const continueButton = screen.getByRole('button', { name: 'Preparing governed action…' });
    const changeButton = screen.getByRole('button', { name: 'Change category' });
    expect(continueButton).toBeDisabled();
    expect(changeButton).toBeDisabled();
    fireEvent.click(continueButton);
    fireEvent.click(changeButton);
    expect(onContinue).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
