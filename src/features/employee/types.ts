export type BarrierCategory =
  | 'ready'
  | 'convenience'
  | 'cost_or_access'
  | 'information'
  | 'clinical_question'
  | 'decline_or_opt_out';

export type EvidenceStatus =
  | 'Synthetic workflow'
  | 'Evidence-informed · outcome To Validate'
  | 'Source-linked · individual applicability To Validate'
  | 'Source-linked'
  | 'Product safety rule · To Validate'
  | 'Product rule';

export interface BarrierOption {
  category: BarrierCategory;
  shortLabel: string;
  prompt: string;
  confirmation: string;
  nextAction: string;
  evidenceStatus: EvidenceStatus;
}

const barrierCategoryValues: readonly BarrierCategory[] = [
  'ready',
  'convenience',
  'cost_or_access',
  'information',
  'clinical_question',
  'decline_or_opt_out',
];

export function isBarrierCategory(value: unknown): value is BarrierCategory {
  return barrierCategoryValues.some((category) => category === value);
}

export interface BarrierSubmission {
  selectedCategory?: BarrierCategory;
  /** Transient only. Callers must not persist or log this value. */
  transientText?: string;
}

export interface BarrierClassification {
  category: BarrierCategory;
  mode: 'preset' | 'simulated-classification' | 'deterministic-fallback';
  fallbackMessage?: string;
}

export interface EmployeeAction {
  label: string;
  onAction: () => void;
  disabled?: boolean;
}

export interface BookingReceiptModel {
  reference: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  bookingMode?: 'seeded' | 'fallback';
}

export interface HandoffReceiptModel {
  reference: string;
  status: 'Synthetic receipt — not submitted' | 'Cancelled';
  ownerRole: string;
  expectedResponseWindow: string;
}
