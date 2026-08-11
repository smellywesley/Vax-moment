# Proposed agent-flow contracts

**Status:** contracts only — no Power Automate or Copilot Studio flow has been created, imported, connected, tested in a tenant, or Parkway-approved.

## Common envelope and rules

All inputs and outputs use JSON-compatible primitive values because Copilot Studio/agent-flow support must be verified in the target tenant. IDs are opaque strings; ISO timestamps use RFC 3339; `expectedVersion` values are non-negative integers. Every tool returns exactly one of:

```text
Success<T> = { ok: true, correlationId: string, value: T }
Failure    = { ok: false, correlationId: string, error: {
  code: ErrorCode, userMessage: string, retryable: boolean,
  reconciliationRequired: boolean
} }
```

Common errors: `INVALID_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `STALE_CONFIRMATION`, `DUPLICATE_SUBMISSION`, `DEPENDENCY_UNAVAILABLE`, `TIMEOUT`, `AMBIGUOUS_RESULT`, `POLICY_BLOCKED`, `INTERNAL_ERROR`. A failure must never write a success event. Raw barrier/clinical text is never returned, stored, or logged.

A **fresh confirmation** means a single-use server-issued `confirmationToken` bound to actor ID, action, target IDs, displayed values, expected record version, card instance, and short expiry. The server validates it; a Boolean supplied by the agent is not proof of consent.

## `ConfirmBarrier`

**Purpose:** record the employee's explicit category selection after the confirmation card.

**Inputs**

| Name | Type | Required | Constraint |
|---|---|---:|---|
| `employeeId` | string | yes | Must resolve to the authenticated employee's own active journey |
| `category` | enum | yes | `ready`, `convenience`, `cost_or_access`, `information`, `clinical_question`, `decline_or_opt_out` |
| `expectedVersion` | integer | yes | Optimistic-concurrency version shown on card |
| `confirmationToken` | string | yes | Fresh, single use, bound to selected category |
| `cardInstanceId` | string | yes | Reject old/duplicate card |
| `correlationId` | string | yes | Non-PII trace identifier |

**Output value:** `{ journeyId: string, category: enum, state: "BARRIER_CONFIRMED" | "OPTED_OUT", newVersion: integer, nextActionCode: "SHOW_SLOTS" | "SHOW_CAMPAIGN_ACCESS" | "SHOW_TRUSTED_INFORMATION" | "CREATE_CLINICAL_HANDOFF" | "STOP" }`.

**Confirmation:** always required. Suggested/model category cannot be persisted without the employee's card submission.

**Specific failures:** `INVALID_CATEGORY`, `STALE_CONFIRMATION`, `CONFLICT`, `FORBIDDEN`. `clinical_question` must return `CREATE_CLINICAL_HANDOFF`; it must not return content answering the question.

**Transaction/audit:** update one journey with optimistic concurrency and append an allowlisted audit event in one transaction. Do not persist raw text or classifier confidence.

## `SearchAvailability`

**Purpose:** retrieve currently available, policy-eligible appointment options. It does not reserve.

**Inputs**

| Name | Type | Required | Constraint |
|---|---|---:|---|
| `employeeId` | string | yes | Authenticated employee's journey |
| `campaignId` | string | yes | Must match journey |
| `serviceCode` | string | yes | Approved configuration value, not model-generated |
| `fromUtc` / `toUtc` | RFC 3339 string | yes | Bounded approved search window |
| `timeZoneId` | string | yes | Approved Windows/IANA mapping; echo in presentation |
| `locationPreferenceCode` | string | no | Allowlisted code only |
| `correlationId` | string | yes | Non-PII trace identifier |

**Output value:** `{ mode: "live", queriedAtUtc: string, expiresAtUtc: string, slots: Array<{ slotId: string, startsAtUtc: string, timeZoneId: string, locationCode: string, locationLabel: string, serviceCode: string, versionToken: string }> }`.

**Confirmation:** no mutation confirmation; it is read-only. A previously confirmed `ready` or `convenience` path and valid self-access are required.

**Specific failures:** `NO_SLOTS`, `INVALID_SEARCH_WINDOW`, `BOOKINGS_UNAVAILABLE`, `RATE_LIMITED`, `POLICY_BLOCKED`. No-slot or outage responses provide an approved alternative channel, not fabricated slots in production.

**Dependency behavior:** obey Graph rate limits; use bounded retry for safe reads; sanitize dependency errors; do not log customer/contact fields returned by a provider.

## `CreateBooking`

**Purpose:** create exactly one appointment request for the selected slot.

**Inputs**

| Name | Type | Required | Constraint |
|---|---|---:|---|
| `employeeId` / `campaignId` | string | yes | Self journey and matching campaign |
| `slotId` | string | yes | Previously returned slot |
| `slotVersionToken` | string | yes | Detect stale availability |
| `expectedJourneyVersion` | integer | yes | Optimistic concurrency |
| `idempotencyKey` | string | yes | Stable for this attempt; unique per intended booking |
| `confirmationToken` | string | yes | Fresh and bound to exact displayed slot/time/location/service/timezone |
| `cardInstanceId` | string | yes | Reject duplicate/old submission |
| `correlationId` | string | yes | Non-PII trace identifier |

**Output value:** `{ bookingAttemptId: string, providerReference: string, status: "BOOKED_NOT_COMPLETED", startsAtUtc: string, timeZoneId: string, locationLabel: string, serviceCode: string, bookedAtUtc: string, newJourneyVersion: integer }`.

**Confirmation:** always required immediately before mutation. The card must show exact slot, timezone, location, service, and “booking is not completion.”

**Specific failures:** `SLOT_STALE`, `SLOT_UNAVAILABLE`, `DUPLICATE_SUBMISSION`, `CONFLICT`, `BOOKINGS_UNAVAILABLE`, `AMBIGUOUS_RESULT`, `COMPENSATION_FAILED`. If the provider response is lost, mark the attempt `RECONCILIATION_REQUIRED`; query by provider/idempotency reference before retrying. Never show success from a timeout alone.

**Transaction/audit:** durably write `BookingAttempt` before external mutation, then record provider result and journey transition. A booking cannot create a `CompletionEvent`.

## `CreateClinicalHandoff`

**Purpose:** create a minimal request for a named human service; it never creates a clinical answer.

**Inputs**

| Name | Type | Required | Constraint |
|---|---|---:|---|
| `employeeId` / `campaignId` | string | yes | Self journey and matching campaign |
| `routingServiceCode` | string | yes | Approved configuration; agent cannot invent destination |
| `contactMethodCode` | enum | yes | Approved values such as `registered_phone` or `registered_email`; no address/value in agent payload |
| `expectedJourneyVersion` | integer | yes | Optimistic concurrency |
| `idempotencyKey` | string | yes | Stable for one intended request |
| `confirmationToken` | string | yes | Fresh and bound to owner, response wording, contact method, and disclosure |
| `cardInstanceId` | string | yes | Reject duplicate/old submission |
| `correlationId` | string | yes | Non-PII trace identifier |

**Output value:** `{ handoffId: string, reference: string, status: "PENDING", ownerLabel: string, responseWindowLabel: string, messageAccepted: boolean, createdAtUtc: string, newJourneyVersion: integer }`.

**Confirmation:** always required. The UI must name owner, response expectation, shared fields, and non-emergency limitation. No free-text clinical detail is collected by this contract.

**Specific failures:** `HANDOFF_SERVICE_NOT_CONFIGURED`, `CONTACT_METHOD_UNAVAILABLE`, `DEPENDENCY_UNAVAILABLE`, `AMBIGUOUS_RESULT`, `CONFLICT`. Until an accountable monitored service is approved, production execution must fail with `HANDOFF_SERVICE_NOT_CONFIGURED`; a synthetic demo receipt must stay visibly synthetic and not submitted.

**Safety:** output contains no medical advice. A route is not resolution; resolution must be a separately attributable human-service event.

## `RecordCompletion`

**Purpose:** append a distinct, attributable completion event from an approved source. This tool is not available to the employee agent.

**Inputs**

| Name | Type | Required | Constraint |
|---|---|---:|---|
| `journeyId` | string | yes | Operator-authorized scope |
| `sourceType` | enum | yes | Approved source allowlist; `operator_attestation` is not authoritative unless protocol says so |
| `sourceReference` | string | yes | Traceable external/operational reference |
| `eventAtUtc` | RFC 3339 string | yes | Occurrence time from source |
| `verificationStatus` | enum | yes | Approved provenance state; no silent upgrade |
| `expectedJourneyVersion` | integer | yes | Optimistic concurrency |
| `confirmationToken` | string | yes | Fresh operator confirmation bound to displayed person/campaign/source/status |
| `correlationId` | string | yes | Non-PII trace identifier |

**Output value:** `{ completionEventId: string, state: "COMPLETED", sourceType: string, sourceReference: string, verificationStatus: string, eventAtUtc: string, receivedAtUtc: string, version: integer, supersedesEventId?: string, newJourneyVersion: integer }`.

**Confirmation:** fresh confirmation by an authorized operator/data steward. The employee agent and employer surface have no access. Bulk completion import requires a separately approved, reconciled ingestion design—not repeated agent calls.

**Specific failures:** `SOURCE_NOT_APPROVED`, `PROVENANCE_INCOMPLETE`, `DUPLICATE_SOURCE_REFERENCE`, `CONFLICT`, `FORBIDDEN`, `CORRECTION_REQUIRED`. Corrections append/supersede; do not overwrite provenance history.

**Transaction/audit:** create immutable completion event, update journey projection, and append audit record atomically. Booking status is never accepted as proof of completion.

## Flow-level acceptance tests

- Contract shape tests for every success/failure code.
- Employee cannot target another employee; employer cannot call any individual flow; employee cannot call `RecordCompletion`.
- Missing/expired/replayed confirmation token blocks every mutation.
- Concurrent stale version returns `CONFLICT` with no partial write.
- Duplicate idempotency key returns the original result or reconciliation state, not a second external action.
- Dependency timeout and ambiguous success never render a success receipt.
- No raw barrier or clinical text appears in input history, Dataverse writes, logs, outputs, or notifications.
