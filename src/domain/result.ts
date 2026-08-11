export type ResultCode =
  | 'OK'
  | 'INVALID_INPUT'
  | 'CLASSIFIER_UNAVAILABLE'
  | 'INVALID_CLASSIFICATION'
  | 'BOOKING_UNAVAILABLE'
  | 'BOOKING_COMPENSATION_FAILED'
  | 'NO_SLOTS'
  | 'INVALID_SLOT_DATA'
  | 'SEED_NOT_FOUND'
  | 'CORRUPT_STATE'
  | 'INVALID_TRANSITION'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'SUPPRESSED'
  | 'RESET_FAILED'
  | 'NOT_FOUND'

export interface AppError {
  readonly code: Exclude<ResultCode, 'OK'>
  readonly message: string
  readonly recovery?: string
}

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AppError }

export const ok = <T>(value: T): Result<T> => ({ ok: true, value })

export const err = <T = never>(
  code: AppError['code'],
  message: string,
  recovery?: string,
): Result<T> => ({
  ok: false,
  error: recovery === undefined ? { code, message } : { code, message, recovery },
})
