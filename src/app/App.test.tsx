import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './App';

describe('VaxMoment integrated walkthrough', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses the governed product path from barrier to aggregate privacy suppression', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', {
        name: 'What would make the next step easier?',
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('radio', {
        name: /Timing or location/i,
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm fictional barrier' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Confirm the category' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yes, use this category' }));

    const bookButton = await screen.findByRole('button', {
      name: 'Book a seeded slot',
    });
    fireEvent.click(bookButton);

    expect(
      await screen.findByRole('heading', { name: 'Demo appointment booked' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Vaccination not yet confirmed')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Parkway operator' }));
    expect(
      await screen.findByRole('heading', { name: 'Campaign control room' }),
    ).toBeInTheDocument();

    const completionButton = screen.getByRole('button', {
      name: 'Record operator-attested synthetic completion',
    });
    expect(completionButton).toBeEnabled();
    fireEvent.click(completionButton);
    expect(
      await screen.findByText(/not a verified clinical record/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Employer' }));
    expect(
      await screen.findByRole('heading', { name: 'Campaign outcomes' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Small cohort suppressed')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Synthetic scenario'), {
      target: { value: 'clinical_handoff' },
    });
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'What would make the next step easier?',
        }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Employer' }));
    expect(await screen.findByText('Small cohort suppressed')).toBeInTheDocument();
    expect(screen.getAllByText('Suppressed')).toHaveLength(3);
    expect(screen.queryByText('Fictional employee 2')).not.toBeInTheDocument();
  });

  it('clears transient text on reset and preserves a selected clinical category when text is skipped', async () => {
    render(<App />);

    const textArea = await screen.findByLabelText(/Optional fictional text/i);
    fireEvent.change(textArea, { target: { value: 'fictional sensitive text' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset scenario' }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Optional fictional text/i)).toHaveValue('');
    });

    fireEvent.click(
      screen.getByRole('radio', { name: /Personal medical question/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Skip optional text' }));

    expect(
      await screen.findByRole('heading', { name: 'Personal medical question' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/healthcare professional should answer/i)).toBeInTheDocument();
  });
});
