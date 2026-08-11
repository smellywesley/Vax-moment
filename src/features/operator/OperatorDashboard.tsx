import "./operator-dashboard.css";

export type OperatorCompletionState =
  | "Booked—not completed"
  | "Completion unknown"
  | "Operator-attested synthetic completion";

export interface OperatorCampaignSummary {
  readonly campaignName: string;
  readonly organisationLabel: string;
  readonly statusLabel: string;
  readonly invited: number;
  readonly booked: number;
  readonly operatorAttestedCompletions: number;
}

export interface OperatorCompletionCheckpoint {
  readonly scenarioLabel: string;
  readonly currentState: OperatorCompletionState;
  readonly sourceLabel: string;
  readonly canRecordCompletion: boolean;
  readonly blockedReason?: string;
}

export interface OperatorHandoffItem {
  readonly id: string;
  readonly scenarioLabel: string;
  readonly requestedAtLabel: string;
  readonly status: "Not submitted" | "Resolved by human" | "Unable to contact";
  readonly ownerLabel: string;
}

export interface OperatorTimelineItem {
  readonly id: string;
  readonly title: string;
  readonly timestampLabel: string;
  readonly detail: string;
  readonly status: "Synthetic" | "To Validate";
}

export interface OperatorDashboardProps {
  readonly campaign: OperatorCampaignSummary;
  readonly completionCheckpoint: OperatorCompletionCheckpoint;
  readonly handoffs: readonly OperatorHandoffItem[];
  readonly timeline: readonly OperatorTimelineItem[];
  readonly onRecordCompletion: () => void;
  readonly isRecordingCompletion?: boolean;
  readonly completionResult?: string;
}

function statusClass(status: string): string {
  return `operator-status operator-status--${status
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")}`;
}

export function OperatorDashboard({
  campaign,
  completionCheckpoint,
  handoffs,
  timeline,
  onRecordCompletion,
  isRecordingCompletion = false,
  completionResult,
}: OperatorDashboardProps) {
  const completionDisabled =
    !completionCheckpoint.canRecordCompletion || isRecordingCompletion;
  const completionStateLabel =
    completionCheckpoint.currentState === "Operator-attested synthetic completion"
      ? "Operator-attested completion"
      : completionCheckpoint.currentState;

  return (
    <section className="operator-view" aria-labelledby="operator-heading">
      <header className="operator-hero">
        <div>
          <p className="operator-eyebrow">Parkway operator view</p>
          <h1 id="operator-heading">Campaign control room</h1>
          <p>
            A focused workflow for completion attestation and human handoff
            follow-through.
          </p>
        </div>
      </header>

      <section className="operator-panel" aria-labelledby="campaign-summary-heading">
        <div className="operator-section-heading">
          <div>
            <p className="operator-eyebrow">{campaign.organisationLabel}</p>
            <h2 id="campaign-summary-heading">{campaign.campaignName}</h2>
          </div>
          <span className={statusClass(campaign.statusLabel)}>
            {campaign.statusLabel}
          </span>
        </div>

        <dl className="operator-metrics" aria-label="Campaign summary">
          <div>
            <dt>Invited</dt>
            <dd>{campaign.invited}</dd>
          </div>
          <div>
            <dt>Booked</dt>
            <dd>{campaign.booked}</dd>
          </div>
          <div>
            <dt>Operator-attested</dt>
            <dd>{campaign.operatorAttestedCompletions}</dd>
          </div>
        </dl>
        <p className="operator-disclosure">
          Figures come from illustrative demo events. They are not observed
          uptake, verified vaccination records, or evidence of impact.
        </p>
      </section>

      <div className="operator-grid">
        <section
          className="operator-panel operator-checkpoint"
          aria-labelledby="completion-checkpoint-heading"
        >
          <p className="operator-step">Completion checkpoint</p>
          <h2 id="completion-checkpoint-heading">
            {completionCheckpoint.scenarioLabel}
          </h2>
          <dl className="operator-checkpoint-list">
            <div>
              <dt>Current state</dt>
              <dd>{completionStateLabel}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{completionCheckpoint.sourceLabel}</dd>
            </div>
          </dl>

          {completionCheckpoint.blockedReason ? (
            <p className="operator-notice" role="status">
              {completionCheckpoint.blockedReason}
            </p>
          ) : null}

          <button
            className="operator-primary-action"
            type="button"
            disabled={completionDisabled}
            onClick={onRecordCompletion}
          >
            {isRecordingCompletion
              ? "Recording checkpoint…"
              : "Record completion checkpoint"}
          </button>
          <p className="operator-action-note">
            Booking is not completion. This action appends a separate demo
            event; it does not verify a clinical record.
          </p>
          {completionResult ? (
            <p className="operator-result" role="status" aria-live="polite">
              {completionResult}
            </p>
          ) : null}
        </section>

        <section className="operator-panel" aria-labelledby="handoff-heading">
          <div className="operator-section-heading">
            <div>
              <p className="operator-step">Human follow-through</p>
              <h2 id="handoff-heading">Handoff summary</h2>
            </div>
            <span className="operator-count" aria-label={`${handoffs.length} handoffs`}>
              {handoffs.length}
            </span>
          </div>

          {handoffs.length === 0 ? (
            <p className="operator-empty">No handoffs in this story.</p>
          ) : (
            <ul className="operator-handoff-list">
              {handoffs.map((handoff) => (
                <li key={handoff.id}>
                  <div>
                    <strong>{handoff.scenarioLabel}</strong>
                    <span>{handoff.requestedAtLabel}</span>
                    <span>Owner: {handoff.ownerLabel}</span>
                  </div>
                  <span className={statusClass(handoff.status)}>
                    {handoff.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="operator-disclosure">
            Demo handoff receipts are not sent to or monitored by a clinician.
          </p>
        </section>
      </div>

      <section className="operator-panel" aria-labelledby="timeline-heading">
        <div className="operator-section-heading">
          <div>
            <p className="operator-step">Inspectable state changes</p>
            <h2 id="timeline-heading">Event timeline</h2>
          </div>
        </div>

        {timeline.length === 0 ? (
          <p className="operator-empty">No events yet.</p>
        ) : (
          <ol className="operator-timeline">
            {timeline.map((item) => (
              <li key={item.id}>
                <span className="operator-timeline-marker" aria-hidden="true" />
                <div>
                  <div className="operator-timeline-title">
                    <strong>{item.title}</strong>
                    <span className={statusClass(item.status)}>
                      {item.status === "Synthetic" ? "Demo" : item.status}
                    </span>
                  </div>
                  <p>{item.detail}</p>
                  <time>{item.timestampLabel}</time>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="operator-disclosure">
          This browser timeline is neither immutable nor a clinical audit trail.
        </p>
      </section>
    </section>
  );
}
