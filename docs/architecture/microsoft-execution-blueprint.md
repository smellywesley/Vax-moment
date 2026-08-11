# VaxMoment Microsoft execution blueprint

**Status:** proposed production mapping — **not implemented, deployed, imported, tenant-tested, licensed, or Parkway-approved**
**Version date:** 11 August 2026

This blueprint maps the inspectable public demo to a possible Microsoft implementation. It is a design input, not proof that the proposed products fit Parkway's tenant, policies, clinical operations, privacy obligations, licensing, region, data contracts, or workflow. The supporting files under `power-platform/` are source artifacts, not an exported Power Platform solution.

## Truthful demo-to-production map

| Capability | Public demo today | Proposed Microsoft boundary | Missing proof before production |
|---|---|---|---|
| Employee/operator/employer identity | Explicit synthetic role switch in browser | Microsoft Entra authentication plus environment/app/Dataverse roles | Identity/guest model, licenses, Conditional Access, lifecycle, effective-privilege tests, tenant approval |
| Barrier capture | Buttons plus optional transient text | Copilot Studio topic/card; bounded classifier returns schema-valid allowlisted category | Model/region/capacity, transcript retention, DLP, golden-set result, injection testing, human confirmation UX |
| Barrier confirmation | React screen and in-memory state machine | Adaptive Card v1.5 plus `ConfirmBarrier` solution-aware flow/custom API | Host rendering, confirmation-token service, concurrency, authorization, accessibility |
| Next action | Versioned deterministic intervention registry | Versioned Dataverse configuration selected by deterministic policy | Content owners, clinical/legal review, change control, localization |
| Availability | Seeded synthetic slots | `SearchAvailability` flow behind a booking port, possibly Microsoft Graph Bookings | Shared-booking fit, permissions, service/staff config, timezone/rate-limit/outage tests |
| Booking | Browser-only seeded reservation/receipt | Durable attempt/outbox plus `CreateBooking`, provider idempotency/reconciliation, Dataverse receipt | Provider semantics, ambiguous-success test, cancellation/reschedule, notifications, data handling, license/consent |
| Clinical handoff | Synthetic “not submitted/not monitored” receipt | `CreateClinicalHandoff` to a named, staffed human service after explicit consent | Service owner, contact channel, SLA, hours/escalation, data fields, monitoring, failure and resolution evidence |
| Completion | Operator-attested synthetic unverified event | Restricted `RecordCompletion` custom API/flow with approved provenance and correction history | Authoritative source, lawful access, latency, reconciliation, operator authority, pilot protocol |
| Employer report | Illustrative aggregate calculated from inspectable synthetic bundle | Trusted server-side fixed aggregate API with scope and small/complementary-cell suppression | Threshold/rules, privacy review, query controls, denial/export tests; no individual-table privileges |
| Persistence | Versioned browser snapshot | Dataverse with team/user ownership, field security, custom APIs, audit, retention | Data contract, PII map, BU/team model, backup/restore, deletion/export/correction testing |
| Audit/monitoring | In-memory synthetic timeline | Sanitized Dataverse audit/custom events plus approved monitoring/alert sink | Log PII controls, read/export coverage, retention, alert/runbook/on-call owner, cost |
| Deployment | Static GitHub Pages/Vercel artifact | Power Platform Dev/Test/Prod ALM with solution, connection references, environment variables, managed promotion/rollback | Authorized environments, pipeline identity, solution package, tests, import history, change approvals |

The static demo remains useful for deterministic judging and contract discussion. It is not a privacy firewall or integration proof because its synthetic bundle and state are client-visible.

## Proposed component boundary

```text
Employee Teams/Copilot channel             Operator app                 Employer report
             |                                  |                              |
             v                                  v                              v
     Copilot Studio agent              role-scoped app/API             fixed aggregate API
  (bounded router, no advice)                  |                         (no individual DTO)
             |                                 |                              |
       Adaptive Cards v1.5                     |                              |
             |                                 |                              |
             +---------- solution-aware flows/custom APIs --------------------+
                 | ConfirmBarrier        | RecordCompletion        | aggregate query
                 | SearchAvailability    |                         |
                 | CreateBooking         |                         |
                 | CreateClinicalHandoff |                         |
                 v                       v                         v
              Dataverse transaction and authorization boundary
                 | journeys / confirmations / attempts / receipts / events
                 | immutable completion provenance / sanitized audit
                 |
                 +---- approved connector ---- Microsoft Graph Bookings candidate
                 |
                 +---- approved connector ---- named clinical handoff service

Authentication: Microsoft Entra ID
Authorization: environment access + app sharing + Dataverse effective privileges + server checks
Governance: data policies/DLP + connection identities + ALM + audit/monitoring
```

This should begin as one environment-scoped solution and one logical application boundary, not microservices or a multi-agent swarm. Separate non-human identities only where permissions/blast radius materially differ. The aggregate privacy boundary and completion provenance deserve dedicated server-side contracts; they do not justify distributed infrastructure by themselves.

## Core run: barrier to safe next step

1. Entra authenticates the user; the server resolves approved role, tenant/campaign scope, and own journey. UI role labels never authorize data access by themselves.
2. Employee chooses a button or provides bounded optional text. Raw text is passed transiently to the classifier and excluded from persistence/logging under the final approved retention design.
3. Classifier returns the JSON Schema shape only. External validation rejects extra fields, unknown categories, `clinical_question` with a non-handoff route, and any parse failure.
4. Employee receives `barrier-confirmation.json`. A server-issued, short-lived token binds actor, card instance, category, record version, and expiry.
5. `ConfirmBarrier` consumes the token once, authorizes self-access, uses optimistic concurrency, records the allowlisted category, and selects a versioned deterministic intervention.
6. `clinical_question` stops generative content and offers the clinical handoff card. No clinical-answer string exists in the classifier schema or handoff contract.
7. `ready`/`convenience` may call read-only `SearchAvailability`. The user sees exact timezone/location/service, then `booking-confirmation.json`.
8. `CreateBooking` durably records an attempt before the external call, uses an idempotency key, reconciles ambiguous responses, and returns `BOOKED_NOT_COMPLETED` only after confirmed provider success.
9. `CreateClinicalHandoff` executes only after explicit disclosure/confirmation and only when an accountable service is configured. Until then, production fails closed; demo receipts remain clearly “not submitted.”
10. A separately authorized operator/source may call `RecordCompletion`. It appends provenance; booking cannot invoke or imply it.

## Data and authorization decisions

The proposed data model and roles are in [`power-platform/dataverse/table-role-mapping.md`](../../power-platform/dataverse/table-role-mapping.md). The binding decisions are:

- one Journey per opaque participant/campaign with optimistic version;
- category only, no optional raw text;
- durable BookingAttempt separate from Booking;
- ClinicalHandoff minimal and restricted, with no question text in this design;
- immutable/superseding CompletionEvent;
- employer access only through a fixed aggregate projection;
- sanitized audit using codes/correlation identifiers, not prompts or health text.

Dataverse security roles are cumulative, and flow connectors can run using identities different from the person at the UI. Production authorization therefore requires effective-privilege and connection-identity tests, not merely a role matrix review.

## AI and agent boundary

The system does not need an autonomous planning agent. It needs one bounded conversational router, deterministic flows, strict output validation, and explicit human confirmation. A no-model path through category buttons remains a first-class baseline and outage recovery.

Acceptance gates for any model:

- beats or materially complements the deterministic/button baseline on a reviewed multilingual golden set;
- 100% schema-valid or rejected/fallback output;
- zero clinical answers, eligibility/suitability decisions, autonomous bookings, completion writes, or employer disclosures;
- reviewed prompt/model/schema versions and reproducible sanitized trace metadata;
- known inference/capacity cost per request and at 10/100/1,000 users;
- tested refusal, timeout, malformed output, prompt injection, and provider outage behavior.

The starter golden set in `power-platform/evaluation/golden-set.json` is a fixture, not an executed evaluation or clinical validation.

## Failure and recovery design

| Failure | Required state | User experience | Operator/audit behavior |
|---|---|---|---|
| Identity/role missing | No read/write | Sign-in/access-denied message | Sanitized denial code; no raw input |
| Classification timeout/malformed output | No category persisted | Category buttons/deterministic fallback; label fallback | `CLASSIFIER_UNAVAILABLE` or `INVALID_CLASSIFICATION` |
| Clinical wording detected | No generated answer | Human-handoff explanation/card | Category/route code only |
| Old/replayed confirmation card | No mutation | Ask user to review a fresh card | `STALE_CONFIRMATION`/`DUPLICATE_SUBMISSION` |
| Stale journey/slot | No silent overwrite/reservation | Refresh and reconfirm | `CONFLICT`/`SLOT_STALE` |
| Booking provider timeout | Attempt remains pending/reconciliation | “Could not confirm whether booking completed”; no success receipt | Query by idempotency/provider reference; alert aged attempts |
| Handoff service absent/down | No claim of monitored request | Approved alternate contact; clear failure | Fail closed; alert owner if configured |
| Completion source invalid | No completion event | Operator provenance error | `SOURCE_NOT_APPROVED`; preserve history |
| Aggregate query below threshold | Suppressed output | Explain privacy suppression | Log aggregate query code/dimensions, no individual data |
| Telemetry sink failure | Follow approved severity policy | Do not change business result wording | Local operational alert without sensitive payload |

## Deployment sequence and cut line

1. **Discovery only:** tenant/licensing/region, data contract, identity, Bookings fit, handoff service, completion source, aggregate privacy rule.
2. **Synthetic Dev spike:** create solution skeleton, tables/roles, bounded classifier, cards, and five flows using synthetic records and stubbed integrations.
3. **Security/eval gate:** complete DLP/Entra checklist, authorization denial suite, golden set, injection/outage/replay/concurrency tests, privacy review.
4. **Integration Test:** add one approved adapter at a time; verify exact permissions, idempotency, reconciliation, timezone, rate limits, support, audit, cost, backup/restore, and rollback.
5. **Pilot readiness:** managed solution in Test, independent clinical/privacy/security/legal review, named operations and support, pre-registered success/kill thresholds.
6. **Production promotion:** same tested managed artifact through approved pipeline; bind target connections/environment variables; verify version, monitoring, denial paths, and rollback.

**Cut line:** if an authoritative completion source, employer privacy firewall, or staffed clinical handoff cannot be approved, do not launch the B2B2C pilot. A polished agent or Adaptive Card does not compensate for those missing foundations.

## Demo versus production claims

Allowed now:

- “The repository includes Microsoft-compatible design artifacts and Adaptive Card v1.5 JSON.”
- “The proposed architecture maps to Copilot Studio, solution-aware flows, Dataverse, Entra, Teams, and a possible Graph Bookings adapter.”
- “JSON/schema checks were run locally,” if accompanied by the exact results/date.

Not allowed now:

- “Built on,” “integrated with,” “connected to,” “deployed on,” or “approved for” Microsoft/Parkway systems.
- “The agent is clinically safe,” “compliant,” “secure,” “production-ready,” or “will improve uptake.”
- “A booking/handoff/completion was created” outside the labelled synthetic demo.

## Official Microsoft sources

Accessed 11 August 2026. These links document product capabilities and constraints; they do not validate this design or tenant fit.

| Topic | Official source | Decision informed |
|---|---|---|
| Copilot Studio Adaptive Cards | <https://learn.microsoft.com/en-us/microsoft-copilot-studio/adaptive-cards-overview> | Copilot Studio supports up to 1.6, while Teams/live chat are limited to 1.5; this pack targets 1.5 and uses `Action.Submit` |
| Adaptive Card submit behavior | <https://learn.microsoft.com/en-us/adaptive-cards/schema-explorer/action-submit> | Inputs are gathered and returned to the host; host behavior still requires testing |
| Teams cards from flows | <https://learn.microsoft.com/en-us/power-automate/create-adaptive-cards> | Interactive Teams scenarios require an appropriate “wait for response” action and host testing |
| Agent flows overview | <https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview> | Agent flows are deterministic workflows but have capacity/environment requirements |
| Call agent flow from agent | <https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-use-flow> | Agent tool flow needs the agent-call trigger, response action, publication, and tool configuration |
| Copilot integration planning | <https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/integrations> | Integration input/output, latency, and longer-running behavior need explicit design |
| Dataverse security | <https://learn.microsoft.com/en-us/power-platform/admin/wp-security> | Entra auth, environment/app controls, roles, connector connections, and Dataverse data security are distinct layers |
| Dataverse role privileges | <https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges> | Ownership/access depth and cumulative table privileges require explicit least-privilege design |
| Dataverse auditing | <https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing> | Change/user-access audit capability exists, with retention/storage and coverage caveats |
| Power Platform data policies | <https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention> | Connector/action governance can affect authoring and runtime; enforcement and connector class need testing |
| Advanced connector policies | <https://learn.microsoft.com/en-us/power-platform/admin/advanced-connector-policies> | A strict connector/action allowlist may support default-deny governance, subject to tenant availability/design |
| Power Platform identity guidance | <https://learn.microsoft.com/en-us/power-platform/guidance/adoption/conditional-access> | Least privilege, MFA/Conditional Access, PIM, and layered access planning |
| Microsoft Bookings API overview | <https://learn.microsoft.com/en-us/graph/booking-concept-overview> | Graph exposes Bookings capabilities; it does not prove VaxMoment service-model or permission fit |
| Environment variables | <https://learn.microsoft.com/en-us/power-apps/maker/data-platform/environmentvariables> | Environment-specific values belong in ALM-aware configuration, not hardcoded artifacts |
| Import solutions | <https://learn.microsoft.com/en-us/power-apps/maker/data-platform/import-update-export-solutions> | Real imports use trusted exported solution packages; this source pack is deliberately not one |
| Power Platform pipelines | <https://learn.microsoft.com/en-us/power-platform/alm/run-pipeline> | Proposed managed promotion path across approved environments |
| Backup and restore | <https://learn.microsoft.com/en-us/power-platform/admin/backup-restore-environments> | Dataverse environment recovery has explicit scope/region/target constraints that need a tested plan |

## Related artifacts

- [`power-platform/README.md`](../../power-platform/README.md)
- [`power-platform/copilot-studio/agent-instructions.md`](../../power-platform/copilot-studio/agent-instructions.md)
- [`power-platform/flows/contracts.md`](../../power-platform/flows/contracts.md)
- [`power-platform/dataverse/table-role-mapping.md`](../../power-platform/dataverse/table-role-mapping.md)
- [`power-platform/governance/dlp-entra-governance-checklist.md`](../../power-platform/governance/dlp-entra-governance-checklist.md)
- [`microsoft-adapter-boundary.md`](./microsoft-adapter-boundary.md)
