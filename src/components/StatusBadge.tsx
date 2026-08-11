import type { PropsWithChildren } from 'react';

export type StatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'synthetic';

export interface StatusBadgeProps {
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({
  children,
  tone = 'neutral',
  className = '',
}: PropsWithChildren<StatusBadgeProps>) {
  return (
    <span className={`vm-badge vm-badge--${tone} ${className}`.trim()}>
      {children}
    </span>
  );
}
