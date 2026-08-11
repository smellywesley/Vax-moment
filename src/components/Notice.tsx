import type { PropsWithChildren, ReactNode } from 'react';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

export interface NoticeProps {
  title: string;
  tone?: NoticeTone;
  actions?: ReactNode;
  live?: 'off' | 'polite' | 'assertive';
  className?: string;
}

export function Notice({
  actions,
  children,
  className = '',
  live = 'off',
  title,
  tone = 'info',
}: PropsWithChildren<NoticeProps>) {
  return (
    <section
      aria-live={live}
      className={`vm-notice vm-notice--${tone} ${className}`.trim()}
    >
      <div>
        <h3 className="vm-notice__title">{title}</h3>
        <div className="vm-notice__body">{children}</div>
      </div>
      {actions ? <div className="vm-notice__actions">{actions}</div> : null}
    </section>
  );
}
