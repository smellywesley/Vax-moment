import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarrierActionTrace, MicrosoftExecutionPath } from './BarrierActionTrace';

describe('BarrierActionTrace', () => {
  it('separates model suggestion, user confirmation, deterministic policy, and action', () => {
    const { container } = render(
      <BarrierActionTrace
        classification={{
          category: 'convenience',
          mode: 'simulated-classification',
        }}
        policyAction="Show an allowlisted booking route."
        policyRule="intervention-convenience-v1"
        progress="authorized"
      />,
    );

    expect(
      screen.getByText(/Language understanding suggested the allowlisted barrier/),
    ).toBeTruthy();
    expect(screen.getByText('Confirmed by user')).toBeTruthy();
    expect(screen.getByText('Allowed by deterministic policy')).toBeTruthy();
    expect(screen.getByText(/Rule intervention-convenience-v1 mapped this category/)).toBeTruthy();
    expect(screen.getByText(/Clinical suitability.*eligibility.*completion decisions are forbidden/)).toBeTruthy();
    expect(screen.getByText('Awaiting your action')).toBeTruthy();
    const steps = container.querySelectorAll('.vm-action-trace__steps > li');
    expect(steps[2]).not.toHaveAttribute('aria-current');
    expect(steps[3]).toHaveAttribute('aria-current', 'step');
  });

  it('has no current step after the action has executed', () => {
    const { container } = render(
      <BarrierActionTrace
        classification={{ category: 'convenience', mode: 'preset' }}
        progress="executed"
      />,
    );
    expect(container.querySelector('[aria-current="step"]')).toBeNull();
  });

  it('labels the Microsoft architecture as proposed and disconnected', () => {
    render(<MicrosoftExecutionPath />);

    expect(screen.getByText('Current public demo')).toBeTruthy();
    expect(screen.getByText('Proposed production path · not connected')).toBeTruthy();
    expect(screen.getByText(/No Microsoft tenant/)).toBeTruthy();
    expect(screen.getByText(/Copilot Studio.*Power Automate.*Microsoft Bookings.*Dataverse/)).toBeTruthy();
  });
});
