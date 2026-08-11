# Proposed Dataverse table and role mapping

**Status:** design only — no Dataverse environment, table, column, relationship, role, field-security profile, or record exists; nothing is imported, deployed, tenant-tested, or Parkway-approved.

Logical names use the placeholder publisher prefix `vm_`. Replace it with the approved publisher prefix before creating a real solution. Table/column choices remain subject to a Parkway data-contract workshop, privacy impact assessment, records policy, security design, and clinical/operational approval.

## Data boundary

- Store only identifiers and workflow facts needed for the approved purpose.
- Do not store optional raw barrier text, model prompts/responses, clinical question text, inferred diagnoses, suitability decisions, or employer-visible individual health/workflow facts.
- The employer projection must be exposed by a fixed server-side aggregate custom API/flow. Direct Dataverse access to individual tables is prohibited for employer users.
- `Booking` and `CompletionEvent` are separate tables and events. No booking column implies vaccination completion.
- `CompletionEvent` is append-only; corrections supersede events and preserve provenance.

## Proposed tables

| Display / logical name | Ownership | Key fields | Relationships | Sensitivity and controls | Retention / open decision |
|---|---|---|---|---|---|
| Campaign / `vm_campaign` | Organization | `vm_campaignid` (GUID), `vm_code` (alternate key), name, start/end UTC, status, organisation reference | 1:N Journey; 1:N approved service config | Operational metadata; audit changes | Campaign retention `[OPEN]` |
| Participant Journey / `vm_journey` | Team or user | `vm_journeyid`, opaque participant subject ID, campaign ID, state, version, timestamps | N:1 Campaign; 1:N BarrierConfirmation, BookingAttempt, Booking, ClinicalHandoff, CompletionEvent | Sensitive individual workflow data; no employer access; alternate key `(campaign, subject)`; optimistic concurrency | Purpose/retention/deletion/export `[OPEN]` |
| Barrier Confirmation / `vm_barrierconfirmation` | Same team as Journey | ID, journey ID, allowlisted category, confirmation time, actor subject ID, classifier mode/result code, schema version | N:1 Journey | Sensitive category; **no raw text/confidence/model prose**; field security; audit create/correction | Shortest approved period `[OPEN]` |
| Intervention Definition / `vm_interventiondefinition` | Organization | code/version alternate key, category, action code, approved wording, evidence status, approver, effective dates | Referenced by Journey/action record | Configuration, solution-managed; qualified approval needed for clinical/general-information wording | Keep versions while referenced |
| Booking Attempt / `vm_bookingattempt` | Same team as Journey | ID, journey ID, idempotency key (alternate key), slot/version token, status, provider correlation/reference, timestamps | N:1 Journey; 0..1:1 Booking | Sensitive operational record; never store provider error payload/customer profile; protects ambiguous outcomes | Reconciliation + retention `[OPEN]` |
| Booking / `vm_booking` | Same team as Journey | ID, journey ID, provider reference (alternate key), slot/service/location codes, starts UTC, timezone, booked UTC, status | N:1 Journey; 1:1 successful BookingAttempt | Individual appointment data; no employer access; field security for provider reference | Cancellation/correction/retention `[OPEN]` |
| Clinical Handoff / `vm_clinicalhandoff` | Clinical owner team | ID, journey ID, idempotency key, routing service code, contact-method code, owner label, response-window version, status, provider reference, created/resolved times | N:1 Journey | Highly restricted; **no clinical question text in this design**; field security; employee read via safe projection only | Handoff service/retention `[OPEN]` |
| Completion Event / `vm_completionevent` | Restricted data-steward team | ID, journey ID, source type/reference, event UTC, received UTC, verification status, version, superseded event ID | N:1 Journey; self-reference for correction | Highest integrity requirement; append-only custom API; unique source/reference/version; no employer direct access | Authoritative source and statutory retention `[OPEN]` |
| Audit Event / `vm_auditevent` | Organization; service-created | ID, correlation ID, actor subject/role code, action/result code, target opaque ID, timestamp, fallback flag | Optional opaque references only | No raw inputs, clinical text, names, emails, provider payloads, or tokens; restrict read | Security/privacy-approved log retention `[OPEN]` |
| Employer Aggregate Snapshot / `vm_employeraggregate` | Organization or omit | Campaign/cohort/time bucket, invited/booked/completed counts, suppression flags, generated time, rule version | N:1 Campaign | Optional cache only; no individual ID/category/handoff; fixed query and complementary suppression | Prefer computed projection; cache rationale `[OPEN]` |
| Service Configuration / `vm_serviceconfiguration` | Organization | environment-safe codes, owner label, response wording, Bookings business/service IDs, enabled flag, effective dates | Referenced by flows | No secrets. Put environment-specific IDs in environment variables; secrets in approved connection/secret store | Configuration history retained |

## Required constraints and server enforcement

1. Alternate keys: campaign code; journey `(campaign, opaque subject)`; booking-attempt idempotency key; booking provider reference; completion `(source type, source reference, version)`.
2. Journey writes use optimistic concurrency. State transitions run through custom APIs/flows, never unrestricted client updates.
3. Server validates category allowlist and schema version. `clinical_question` can only yield a handoff action.
4. Completion create/update is restricted to the completion custom API. Delete is denied except an approved records process; corrections append and link `supersedesEventId`.
5. Employer aggregate requests accept only approved campaign/cohort/time-bucket dimensions, enforce tenant/campaign scope, minimum-cell and complementary suppression, and return aggregate DTOs only.
6. Cascade delete behavior is not chosen. Resolve legal retention and correction requirements before enabling any cascade.
7. Field security protects participant subject ID, provider references, source references, contact-routing fields, and all fields deemed health-related by qualified reviewers.

## Proposed roles

| Role | Intended identity | Table access | Explicit denials/boundary |
|---|---|---|---|
| VaxMoment Employee Self-Service | Authenticated participant | Safe custom APIs for own journey; user-level read only where required | No direct list/export; no other participant; no completion write; no Audit/aggregate tables |
| VaxMoment Campaign Operator | Authorized Parkway operator team | BU/team-scoped Journey, Booking, safe Handoff status; create via approved flows | No clinical detail; no employer export; no CompletionEvent write unless separately assigned |
| VaxMoment Clinical Handoff Worker | Named accountable clinical-service team | Team-scoped ClinicalHandoff and minimal contact-routing projection | No employer data; no classifier prompt/raw text; no campaign-wide export by default |
| VaxMoment Completion Steward | Restricted authorized source/operator team | Create/correct CompletionEvent through custom API; read required journey identifiers | No deletion/overwrite; no barrier text; no employer reporting role by inheritance |
| VaxMoment Employer Reporter | Employer reporting identity | Execute fixed aggregate API or read approved aggregate snapshot only | **No privileges** on Journey, BarrierConfirmation, BookingAttempt, Booking, ClinicalHandoff, CompletionEvent, AuditEvent |
| VaxMoment Privacy/Data Steward | Named governance team | Approved subject-access, correction, retention, deletion/export functions | No environment maker/admin by default; actions audited |
| VaxMoment Audit Reader | Security/compliance | Read sanitized AuditEvent and platform audit logs | No business-record mutation; export governed |
| VaxMoment Flow Application User | Non-human application user per integration boundary | Minimum custom APIs/tables per individual flow | Separate identities where blast radius differs; no interactive sign-in; no System Administrator |
| VaxMoment Solution Maker | Dev-only maker group | Customization in Dev | No Production data access; not auto-assigned to broad users |
| System Administrator | Break-glass/platform admins only | Platform-required | PIM/time-bound; monitored; never the routine flow identity |

Dataverse roles are cumulative. A user with an accidental second role may regain forbidden access, so acceptance tests must enumerate effective privileges, team membership, business unit scope, sharing, hierarchy security, and app/flow connection identity—not review role names alone.

## Role-to-operation matrix

| Operation | Employee | Operator | Clinical worker | Completion steward | Employer | Flow app |
|---|---:|---:|---:|---:|---:|---:|
| Confirm own barrier | custom API | no | no | no | no | scoped execute/write |
| Search own availability | custom API | optional assisted workflow | no | no | no | read/config + connector |
| Create own booking | custom API | optional assisted workflow | no | no | no | scoped execute/write |
| Create own handoff | custom API | optional assisted workflow | receive/status only | no | no | scoped execute/write |
| Record completion | no | only with Completion Steward role | no | custom API | no | dedicated scoped identity |
| Read individual journey | safe own projection | scoped | minimal linked projection | minimal linked projection | **no** | per-flow minimum |
| Read aggregate employer metrics | no | operational dashboard only | no | no | fixed suppressed API | aggregate service only |
| Read audit | no | own operation receipts only | own work receipts only | own operation receipts only | no | write only |

## Validation evidence required

- Privilege export/screenshots for every custom role and field-security profile.
- Automated positive/negative API tests for all role/record combinations, including cumulative roles and team sharing.
- Proof employer identity cannot query individual tables via app, connector, API, views, search, export, or indirect relationship.
- PII map, record retention/deletion/export test, backup/restore test, and correction/reconciliation test.
- Dataverse audit configuration and sanitized custom audit sample.

Microsoft references: [Dataverse security overview](https://learn.microsoft.com/en-us/power-platform/admin/wp-security), [security roles and privileges](https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges), and [Dataverse auditing](https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing). Capability documentation is not evidence that this proposed model is sufficient or approved.
