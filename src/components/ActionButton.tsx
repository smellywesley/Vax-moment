import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export type ActionButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

export interface ActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  fullWidth?: boolean;
}

export function ActionButton({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  ...props
}: PropsWithChildren<ActionButtonProps>) {
  const classes = [
    'vm-button',
    `vm-button--${variant}`,
    fullWidth ? 'vm-button--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
