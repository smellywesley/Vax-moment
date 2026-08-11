import type { ReactNode } from 'react';
import { DemoBanner, type DemoBannerProps } from '../../components';
import { BarrierCapture, type BarrierCaptureProps } from './BarrierCapture';
import {
  BookingReceipt,
  type BookingReceiptProps,
} from './BookingReceipt';
import {
  CategoryConfirmation,
  type CategoryConfirmationProps,
} from './CategoryConfirmation';
import {
  GovernedNextAction,
  type GovernedNextActionProps,
} from './GovernedNextAction';
import { HandoffReceipt, type HandoffReceiptProps } from './HandoffReceipt';

export type EmployeeJourneyScreen =
  | { kind: 'barrier'; props: BarrierCaptureProps }
  | { kind: 'confirmation'; props: CategoryConfirmationProps }
  | { kind: 'next-action'; props: GovernedNextActionProps }
  | { kind: 'booking-receipt'; props: BookingReceiptProps }
  | { kind: 'handoff-receipt'; props: HandoffReceiptProps }
  | { kind: 'custom'; content: ReactNode };

export interface EmployeeJourneyProps {
  banner: DemoBannerProps;
  screen: EmployeeJourneyScreen;
  heading?: string;
  headingId?: string;
}

function renderScreen(screen: EmployeeJourneyScreen) {
  switch (screen.kind) {
    case 'barrier':
      return <BarrierCapture {...screen.props} />;
    case 'confirmation':
      return <CategoryConfirmation {...screen.props} />;
    case 'next-action':
      return <GovernedNextAction {...screen.props} />;
    case 'booking-receipt':
      return <BookingReceipt {...screen.props} />;
    case 'handoff-receipt':
      return <HandoffReceipt {...screen.props} />;
    case 'custom':
      return screen.content;
    default: {
      const exhaustive: never = screen;
      return exhaustive;
    }
  }
}

export function EmployeeJourney({
  banner,
  heading = 'Your vaccination campaign next step',
  headingId = 'page-heading',
  screen,
}: EmployeeJourneyProps) {
  return (
    <div className="vm-page-shell">
      <DemoBanner {...banner} />
      <main className="vm-page-main" id="main-content">
        <header className="vm-page-heading">
          <p className="vm-eyebrow">VaxMoment employee experience</p>
          <h1 id={headingId} tabIndex={-1}>
            {heading}
          </h1>
        </header>
        {renderScreen(screen)}
      </main>
    </div>
  );
}
