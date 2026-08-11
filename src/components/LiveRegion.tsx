export interface LiveRegionProps {
  message: string;
  assertive?: boolean;
  visuallyHidden?: boolean;
}

export function LiveRegion({
  assertive = false,
  message,
  visuallyHidden = true,
}: LiveRegionProps) {
  return (
    <div
      aria-atomic="true"
      aria-live={assertive ? 'assertive' : 'polite'}
      className={visuallyHidden ? 'vm-visually-hidden' : 'vm-live-region'}
      role={assertive ? 'alert' : 'status'}
    >
      {message}
    </div>
  );
}
