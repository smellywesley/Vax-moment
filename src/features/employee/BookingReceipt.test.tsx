import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BookingReceipt } from './BookingReceipt';

describe('BookingReceipt', () => {
  it('never presents a booking as vaccination completion', () => {
    render(
      <BookingReceipt
        receipt={{
          bookingMode: 'fallback',
          dateLabel: '14 August 2026',
          locationLabel: 'Fictional workplace clinic',
          reference: 'SYN-BOOK-001',
          timeLabel: '10:30 AM',
        }}
      />,
    );

    expect(screen.getByText('Booked')).toBeTruthy();
    expect(screen.getByText('Vaccination not yet confirmed')).toBeTruthy();
    expect(screen.getByText('Booking fallback active')).toBeTruthy();
  });
});
