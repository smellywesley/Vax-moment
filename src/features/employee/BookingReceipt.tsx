import { ActionButton, Notice, StatusBadge, SurfaceCard } from '../../components';
import type { BookingReceiptModel } from './types';

export interface BookingReceiptProps {
  receipt: BookingReceiptModel;
  onBackToCampaign?: () => void;
  onChangeBooking?: () => void;
}

export function BookingReceipt({
  onBackToCampaign,
  onChangeBooking,
  receipt,
}: BookingReceiptProps) {
  const fallback = receipt.bookingMode === 'fallback';

  return (
    <SurfaceCard eyebrow="Booking confirmation" title="Appointment reserved">
      <div className="vm-receipt-status">
        <StatusBadge tone="success">Booked</StatusBadge>
        <StatusBadge tone="warning">Vaccination not yet confirmed</StatusBadge>
      </div>

      {fallback ? (
        <Notice title="Demo booking fallback active" tone="warning">
          This seeded slot was supplied by the deterministic demo adapter. No real
          booking service was contacted.
        </Notice>
      ) : null}

      <dl className="vm-definition-list vm-definition-list--receipt">
        <div>
          <dt>Date</dt>
          <dd>{receipt.dateLabel}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{receipt.timeLabel}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{receipt.locationLabel}</dd>
        </div>
        <div>
          <dt>Reference</dt>
          <dd>{receipt.reference}</dd>
        </div>
      </dl>

      <p className="vm-safety-note">
        Booking and completion are separate events. Only an authorised operator can
        record the distinct completion checkpoint.
      </p>

      {onChangeBooking || onBackToCampaign ? (
        <div className="vm-actions">
          {onBackToCampaign ? (
            <ActionButton onClick={onBackToCampaign}>Back to campaign</ActionButton>
          ) : null}
          {onChangeBooking ? (
            <ActionButton onClick={onChangeBooking} variant="secondary">
              Change booking
            </ActionButton>
          ) : null}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
