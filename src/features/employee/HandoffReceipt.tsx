import { ActionButton, Notice, StatusBadge, SurfaceCard } from '../../components';
import type { HandoffReceiptModel } from './types';

export interface HandoffReceiptProps {
  receipt: HandoffReceiptModel;
  onReturn: () => void;
  onCancel?: () => void;
}

export function HandoffReceipt({
  onCancel,
  onReturn,
  receipt,
}: HandoffReceiptProps) {
  return (
    <SurfaceCard eyebrow="Human-information route" title="A human should answer this">
      <Notice title="This competition demo is not monitored" tone="warning">
        <p>
          This is not medical advice and must not be used for urgent symptoms. No
          message was sent, and nobody is monitoring this synthetic request.
        </p>
        <p>
          If you may be experiencing a life-threatening emergency in Singapore,
          call <a href="tel:995">995</a> now. See the{' '}
          <a
            href="https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services"
            rel="noreferrer"
            target="_blank"
          >
            official SCDF emergency guidance
          </a>. For non-emergency personal medical questions, contact a qualified
          healthcare professional or clinic directly.
        </p>
      </Notice>

      <div className="vm-receipt-status">
        <StatusBadge tone="synthetic">Synthetic demo</StatusBadge>
        <StatusBadge tone={receipt.status === 'Cancelled' ? 'neutral' : 'info'}>
          {receipt.status}
        </StatusBadge>
      </div>

      <dl className="vm-definition-list vm-definition-list--receipt">
        <div>
          <dt>Proposed future owner</dt>
          <dd>{receipt.ownerRole}</dd>
        </div>
        <div>
          <dt>Expected response in a future pilot</dt>
          <dd>{receipt.expectedResponseWindow}</dd>
        </div>
        <div>
          <dt>Synthetic reference</dt>
          <dd>{receipt.reference}</dd>
        </div>
      </dl>

      <p className="vm-safety-note">
        The fictional question is intentionally not repeated here and no automated
        medical or suitability answer was generated.
      </p>

      <div className="vm-actions">
        <ActionButton onClick={onReturn}>Return to campaign</ActionButton>
        {onCancel && receipt.status !== 'Cancelled' ? (
          <ActionButton onClick={onCancel} variant="secondary">
            Cancel synthetic request
          </ActionButton>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
