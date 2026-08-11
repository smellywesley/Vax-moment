import type { PropsWithChildren, ReactNode } from 'react';

export interface SurfaceCardProps {
  title?: string;
  eyebrow?: string;
  footer?: ReactNode;
  className?: string;
  titleId?: string;
}

export function SurfaceCard({
  children,
  className = '',
  eyebrow,
  footer,
  title,
  titleId,
}: PropsWithChildren<SurfaceCardProps>) {
  return (
    <section className={`vm-card ${className}`.trim()}>
      {eyebrow ? <p className="vm-eyebrow">{eyebrow}</p> : null}
      {title ? (
        <h2 className="vm-card__title" id={titleId} tabIndex={titleId ? -1 : undefined}>
          {title}
        </h2>
      ) : null}
      <div className="vm-card__content">{children}</div>
      {footer ? <footer className="vm-card__footer">{footer}</footer> : null}
    </section>
  );
}
