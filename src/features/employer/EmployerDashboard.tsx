import "./employer-dashboard.css";

export interface EmployerMetric {
  readonly id: "invited" | "booked" | "operator-attested-completions";
  readonly label: string;
  readonly value: number;
  readonly context: string;
}

export interface EmployerAggregateProjection {
  readonly campaignName: string;
  readonly metrics: readonly [EmployerMetric, EmployerMetric, EmployerMetric];
  readonly suppressed: boolean;
  readonly suppressionThreshold: number;
  readonly suppressionReason: string;
  readonly asOfLabel: string;
  readonly evidenceStatus: "Synthetic" | "To Validate";
}

export interface EmployerDashboardProps {
  readonly projection: EmployerAggregateProjection;
}

export function EmployerDashboard({ projection }: EmployerDashboardProps) {
  return (
    <section className="employer-view" aria-labelledby="employer-heading">
      <header className="employer-hero">
        <div>
          <p className="employer-eyebrow">Employer view</p>
          <h1 id="employer-heading">Campaign outcomes</h1>
          <p>
            Aggregate-only demonstration with illustrative small-cell suppression. This screen does not receive
            employee records, barrier details, bookings, or handoff records.
          </p>
        </div>
        <span className="employer-status">
          {projection.evidenceStatus === "Synthetic" ? "Demo" : projection.evidenceStatus}
        </span>
      </header>

      <section className="employer-panel" aria-labelledby="employer-campaign-heading">
        <div className="employer-panel-heading">
          <div>
            <p className="employer-eyebrow">Campaign</p>
            <h2 id="employer-campaign-heading">{projection.campaignName}</h2>
          </div>
          <span className="employer-as-of">{projection.asOfLabel}</span>
        </div>

        {projection.suppressed ? (
          <div className="employer-suppression" role="status">
            <strong>Small cohort suppressed</strong>
            <p>{projection.suppressionReason}</p>
            <p>
              Values are hidden when the cohort is smaller than {projection.suppressionThreshold}.
              The prototype does not reveal the underlying count or permit filters that could
              reconstruct it.
            </p>
          </div>
        ) : null}

        <dl className="employer-metrics" aria-label="Aggregate campaign metrics">
          {projection.metrics.map((metric) => (
            <div key={metric.id}>
              <dt>{metric.label}</dt>
              <dd aria-label={projection.suppressed ? `${metric.label}: suppressed` : undefined}>
                <span className="employer-metric-value">
                  {projection.suppressed ? "Suppressed" : metric.value}
                </span>
                <span className="employer-metric-context">
                  {projection.suppressed ? "Hidden by small-cell rule" : metric.context}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <aside className="employer-boundary" aria-labelledby="employer-boundary-heading">
          <h2 id="employer-boundary-heading">What this demonstrates</h2>
          <ul>
            <li>The application passes this view a fixed aggregate projection.</li>
            <li>Small cohorts are visibly suppressed at a threshold of {projection.suppressionThreshold}.</li>
            <li>Illustrative numbers are not evidence of uptake, causality, or return on investment.</li>
          </ul>
          <p>
            Because this is a public static demo, bundled example data can be inspected
            with developer tools. Production confidentiality requires server-side authorization,
            projection, retention, and anti-differencing controls.
          </p>
        </aside>
      </section>
    </section>
  );
}
