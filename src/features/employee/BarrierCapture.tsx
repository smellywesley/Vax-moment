import { useId, useRef, useState, type FormEvent } from 'react';
import { ActionButton, LiveRegion, Notice, SurfaceCard } from '../../components';
import { BARRIER_OPTIONS } from './barrierOptions';
import { isBarrierCategory } from './types';
import type {
  BarrierCategory,
  BarrierClassification,
  BarrierSubmission,
} from './types';

const MAX_TRANSIENT_TEXT_LENGTH = 2000;

export interface BarrierCaptureProps {
  onSubmit: (
    submission: BarrierSubmission,
  ) => BarrierClassification | Promise<BarrierClassification>;
  onConfirmed: (classification: BarrierClassification) => void;
  onSkip: (selectedCategory?: BarrierCategory) => void;
  disabled?: boolean;
  initialCategory?: BarrierCategory;
}

export function BarrierCapture({
  disabled = false,
  initialCategory,
  onConfirmed,
  onSkip,
  onSubmit,
}: BarrierCaptureProps) {
  const hintId = useId();
  const errorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    BarrierCategory | undefined
  >(initialCategory);
  const [transientText, setTransientText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = transientText.trim();

    if (!selectedCategory && !trimmedText) {
      setError('Choose a fictional barrier or enter optional fictional text.');
      setStatus('A barrier choice is needed before continuing.');
      textareaRef.current?.focus();
      return;
    }

    if (transientText.length > MAX_TRANSIENT_TEXT_LENGTH) {
      setError(`Keep fictional text to ${MAX_TRANSIENT_TEXT_LENGTH} characters or fewer.`);
      setStatus('The optional fictional text is too long.');
      textareaRef.current?.focus();
      return;
    }

    setError('');
    setIsSubmitting(true);
    setStatus('Classifying the fictional barrier.');

    try {
      const classification = await onSubmit({
        selectedCategory,
        transientText: trimmedText || undefined,
      });
      if (!isBarrierCategory(classification.category)) {
        throw new Error('Classification returned a category outside the allowlist.');
      }
      setTransientText('');
      setStatus(
        classification.mode === 'deterministic-fallback'
          ? 'Classification complete. Deterministic fallback is active.'
          : 'Classification complete. Confirm the category before continuing.',
      );
      onConfirmed(classification);
    } catch {
      setError('The category could not be prepared. Try again or skip the text field.');
      setStatus('Classification failed. Your fictional text remains available to retry.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSkip() {
    setTransientText('');
    setError('');
    setStatus('Optional fictional text skipped.');
    onSkip(selectedCategory);
  }

  return (
    <SurfaceCard
      eyebrow="Employee · Step 1"
      title="What would make the next step easier?"
    >
      <p className="vm-lead">
        Choose a fictional barrier. This only shapes a non-clinical next action.
      </p>
      <Notice title="Competition demo privacy boundary" tone="warning">
        <p>
          <strong>Do not enter real health or identifying information.</strong> Optional
          text is used only to simulate a category, is not shown on receipts, and is
          cleared after confirmation.
        </p>
      </Notice>

      <form
        className="vm-form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <fieldset className="vm-choice-fieldset" disabled={disabled || isSubmitting}>
          <legend>Choose a fictional example</legend>
          <div className="vm-choice-grid">
            {BARRIER_OPTIONS.map((option) => (
              <label
                className="vm-choice"
                htmlFor={`barrier-${option.category}`}
                key={option.category}
              >
                <input
                  checked={selectedCategory === option.category}
                  id={`barrier-${option.category}`}
                  name="barrier-category"
                  onChange={() => {
                    setSelectedCategory(option.category);
                    setError('');
                  }}
                  type="radio"
                  value={option.category}
                />
                <span>
                  <strong>{option.shortLabel}</strong>
                  <small>{option.prompt}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="vm-field">
          <label htmlFor="fictional-barrier-text">
            Optional fictional text
            <span className="vm-field__optional">Optional</span>
          </label>
          <textarea
            aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
            aria-invalid={Boolean(error)}
            disabled={disabled || isSubmitting}
            id="fictional-barrier-text"
            maxLength={MAX_TRANSIENT_TEXT_LENGTH}
            onChange={(event) => {
              setTransientText(event.currentTarget.value);
              setError('');
            }}
            placeholder="Example: The clinic hours overlap with my shift"
            ref={textareaRef}
            rows={4}
            value={transientText}
          />
          <div className="vm-field__meta" id={hintId}>
            <span>Simulated classification only · not medical advice</span>
            <span aria-label={`${transientText.length} of ${MAX_TRANSIENT_TEXT_LENGTH} characters`}>
              {transientText.length}/{MAX_TRANSIENT_TEXT_LENGTH}
            </span>
          </div>
          <p className="vm-safety-note">
            This prototype cannot assess urgent symptoms. For a life-threatening
            emergency in Singapore, call <a href="tel:995">995</a>.{' '}
            <a
              href="https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services"
              rel="noreferrer"
              target="_blank"
            >
              SCDF emergency guidance
            </a>
          </p>
          {error ? (
            <p className="vm-field__error" id={errorId} role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="vm-actions">
          <ActionButton disabled={disabled || isSubmitting} type="submit">
            {isSubmitting ? 'Preparing category…' : 'Confirm fictional barrier'}
          </ActionButton>
          <ActionButton
            disabled={disabled || isSubmitting}
            onClick={handleSkip}
            variant="secondary"
          >
            Skip optional text
          </ActionButton>
        </div>
      </form>
      <LiveRegion message={status} />
    </SurfaceCard>
  );
}
