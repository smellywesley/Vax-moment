import { StatusBadge } from './StatusBadge';

export interface DemoIdentity {
  label: string;
  role: 'Employee' | 'Parkway operator' | 'Employer';
}

export interface DemoFallbackStatus {
  active: boolean;
  message?: string;
}

export interface DemoBannerProps {
  identity: DemoIdentity;
  fallback?: DemoFallbackStatus;
  scenarioLabel?: string;
}

export function DemoBanner({
  fallback = { active: false },
  identity,
  scenarioLabel,
}: DemoBannerProps) {
  return (
    <aside aria-label="Competition demo status" className="vm-demo-banner">
      <div className="vm-demo-banner__primary">
        <StatusBadge tone="synthetic">Synthetic</StatusBadge>
        <strong>Competition demo · Synthetic people and outcomes</strong>
        <span className="vm-demo-banner__theme">
          Hack4Health 2026 · AI for vaccination adoption
        </span>
      </div>
      <dl className="vm-demo-banner__details">
        <div>
          <dt>View</dt>
          <dd>
            {identity.label} · {identity.role}
          </dd>
        </div>
        {scenarioLabel ? (
          <div>
            <dt>Story</dt>
            <dd>{scenarioLabel}</dd>
          </div>
        ) : null}
        <div>
          <dt>System</dt>
          <dd>
            <StatusBadge tone={fallback.active ? 'warning' : 'info'}>
              {fallback.active ? 'Fallback active' : 'Offline-safe demo'}
            </StatusBadge>
            {fallback.active && fallback.message ? (
              <span className="vm-demo-banner__fallback-detail">
                {fallback.message}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
