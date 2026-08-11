import { ActionButton, Notice, StatusBadge, SurfaceCard } from '../../components';
import { getBarrierOption } from './barrierOptions';
import type { BarrierClassification } from './types';

export interface CategoryConfirmationProps {
  classification: BarrierClassification;
  disabled?: boolean;
  onChange: () => void;
  onContinue: () => void;
}

export function CategoryConfirmation({
  classification,
  disabled = false,
  onChange,
  onContinue,
}: CategoryConfirmationProps) {
  const option = getBarrierOption(classification.category);
  const isFallback = classification.mode === 'deterministic-fallback';

  return (
    <SurfaceCard eyebrow="Employee · Step 2" title="Confirm the category">
      {isFallback ? (
        <Notice live="polite" title="Fallback active" tone="warning">
          <p>
            {classification.fallbackMessage ??
              'The simulated classifier was unavailable, so an allowlisted deterministic category was used.'}
          </p>
          <p>
            <StatusBadge tone="synthetic">Synthetic fallback</StatusBadge>
          </p>
        </Notice>
      ) : null}

      <div className="vm-confirmation">
        <p className="vm-confirmation__label">Prepared category</p>
        <h3>{option.shortLabel}</h3>
        <p>{option.confirmation}</p>
        <dl className="vm-definition-list">
          <div>
            <dt>Classification</dt>
            <dd>
              {classification.mode === 'preset'
                ? 'Explicit fictional preset'
                : 'Simulated classification'}
            </dd>
          </div>
          <div>
            <dt>What it does</dt>
            <dd>Categorises intent for a governed workflow.</dd>
          </div>
          <div>
            <dt>What it does not do</dt>
            <dd>It does not decide eligibility, suitability, or completion.</dd>
          </div>
        </dl>
      </div>

      <div className="vm-actions">
        <ActionButton disabled={disabled} onClick={onContinue}>
          {disabled ? 'Preparing governed action…' : 'Yes, use this category'}
        </ActionButton>
        <ActionButton disabled={disabled} onClick={onChange} variant="secondary">
          Change category
        </ActionButton>
      </div>
    </SurfaceCard>
  );
}
