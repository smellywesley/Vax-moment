---
status: APPROVED_FOR_IMPLEMENTATION
project: VaxMoment
competition: Hack4Health 2026 Non-Technical Track
deadline: 2026-08-13T23:59:00+08:00
branch: codex/vax-moment
deployment_target: GitHub Pages
review_mode: SCOPE_EXPANSION
---

# VaxMoment Build Plan

## 1. Verdict and frozen scope

**Verdict: build the validation-grade public vertical slice. Do not represent it as a production clinical system or a completed Microsoft integration.**

The product is a B2B2C vaccination-activation workflow proposed for Parkway Shenton Corporate Health workplace campaigns; buyer acceptance remains To Validate. It converts an employee's self-described barrier into a governed non-clinical next action, reduces booking friction, records an operator-attested synthetic completion event in the prototype, and demonstrates aggregate-only reporting with illustrative small-cell suppression to the employer stakeholder.

The approved deliverable contains one real application with Employee, Parkway Operator, and Employer experiences plus a guided three-minute presentation layer. Demo mode may control scenario inputs and reset state, but it must use the same application services, policy engine, state machine, aggregation logic, access checks, and adapter contracts as ordinary mode.

### Success criteria

- A judge can open a public URL and complete the guided walkthrough without installation or presenter intervention.
- Every consequential claim is labelled `Verified`, `Synthetic`, `Assumed`, or `To Validate`.
- All three seeded scenarios use the same domain paths used outside guided mode.
- Clinical questions create a human-handoff receipt; the classifier never answers the question.
- Employer requests never receive individual-level DTOs through an application-service call.
- A cohort smaller than 10 is visibly suppressed.
- The application resets deterministically and remains usable with all external adapters unavailable.
- Unit, integration, accessibility, and critical E2E tests pass in CI before deployment.

### Kill criteria

- Any path lets the AI determine clinical eligibility, suitability, or completion provenance.
- Employer-facing application services return an individual's barrier, intervention, booking, or handoff record.
- Guided mode mutates domain state outside the shared service boundary.
- Synthetic evidence is presented as observed pilot performance.
- The deployed artifact depends on a live AI, booking, database, or identity service to complete the demo.

### Gate 0 — competition eligibility

- The organiser-provided brief is the current binding source: the non-technical track encourages a prototype/mockup/no-code demonstration and does not require a fully functional Microsoft implementation.
- No independently published official judging rubric was found during review; this remains an external validation risk, not a licence to invent requirements.
- Before submission, re-check the launch-session materials for mandatory Microsoft usage, submission format, public-URL rules, and judging weights.
- Contingency: if Microsoft usage becomes mandatory, keep the deployed vertical slice as the product proof and add only a truthful architecture walkthrough or recorded tenant integration after credentials are supplied; never relabel simulated adapters as live.

## 2. Facts, assumptions, and evidence discipline

### Confirmed facts

- The user supplied the Hack4Health 2026 non-technical-track brief and an architecture-ready VaxMoment handoff.
- The repository contained no implementation when reviewed; only the gstack routing file had been committed.
- The current environment has Node.js and npm-compatible tooling but no authenticated Azure, Copilot Studio, Dataverse, Bookings, Entra, or GitHub CLI session.
- Singapore provides recommended adult-vaccination subsidies and booking pathways, while reported uptake remains incomplete.
- Parkway Shenton and competing corporate-health providers already offer workplace vaccination services.

### Load-bearing assumptions

| # | Assumption | Status | Cheapest validation experiment | Kill or pivot signal |
|---|---|---|---|---|
| A1 | Barrier-specific next actions improve completion beyond generic reminders | To Validate | Two-arm workplace pilot: existing reminder versus VaxMoment journey | No meaningful completion uplift or higher support burden |
| A2 | Parkway operators can obtain lawful completion events | To Validate | Data-contract workshop using ten synthetic records and named system owners | No timely completion signal without excessive health-data exposure |
| A3 | Employers value aggregate campaign learning enough to sponsor adoption | To Validate | Five buyer interviews plus a priced pilot offer | No budget owner accepts the proposed pilot value or price |
| A4 | Employees will disclose a barrier in this channel | To Validate | Moderated prototype tests with privacy explanation variants | Users avoid or abandon barrier disclosure despite trust copy |
| A5 | The Microsoft adapter architecture fits Parkway's tenant and licensing | To Validate | Technical discovery with Parkway/Microsoft administrators | Required services unavailable, disallowed, or uneconomic |

### Evidence rules

- Evidence metadata is a typed record with title, URL, publisher, date, status, scope note, and last-checked date.
- A claim cannot be promoted from `Assumed` or `To Validate` without a source or measured result.
- Synthetic completion rates and ROI calculations use a persistent `Synthetic` or `Assumption-based` label next to the number, not only in a footer.
- Medical and legal sources are informational inputs, not professional sign-off.

## 3. Architecture review

### System architecture

```text
┌──────────────────────────────── PUBLIC STATIC APPLICATION ────────────────────────────────┐
│                                                                                            │
│  Guided walkthrough ─┐                                                                    │
│  Employee screens ───┼─▶ App commands/queries ─▶ VaxMomentService                         │
│  Operator screens ───┤                              │                                      │
│  Employer screens ───┘                              ├─▶ AccessPolicy                       │
│                                                     ├─▶ CampaignStateMachine               │
│                                                     ├─▶ InterventionPolicyEngine           │
│                                                     ├─▶ PrivacyProjection                  │
│                                                     └─▶ EvidenceRegistry                    │
│                                                              │                             │
│                                      ┌───────────────────────┴─────────────────────────┐   │
│                                      │ Adapter contracts                               │   │
│                                      │ Repository · Identity · Classifier · Booking    │   │
│                                      │ Clock · Audit sink                              │   │
│                                      └───────────────────────┬─────────────────────────┘   │
│                                                              │                             │
│                                      Demo adapters: seeded, deterministic, browser-only    │
└────────────────────────────────────────────────────────────────────────────────────────────┘
                                                               │ same contracts
                                                               ▼
                                      Future production adapters
                           Entra · Dataverse · Copilot Studio · Bookings · App Insights
```

### Dependency rules

- `domain` imports no React, browser, storage, network, or demo modules.
- `application` may import domain contracts but no concrete adapter.
- `adapters/demo` implement application ports and may import seeded synthetic fixtures.
- `features` and `components` call the in-process application facade; they do not import repositories, fixtures, or policy functions directly.
- `demo` can select persona, advance walkthrough checkpoints, switch demo identity, and request reset only through the application facade.
- Employer projection is a separate return type that contains no individual identifiers or barrier-level records.

### Proposed project structure

```text
src/
  app/                  composition root, routing, providers, error boundary
  domain/               entities, result types, state machine, policy, privacy
  application/          ports, commands, queries, VaxMomentService
  adapters/demo/        seed repository, identity, classifier, booking, audit
  demo/                 personas, walkthrough checkpoints, reset controller
  features/employee/    barrier confirmation, action, booking, handoff receipt
  features/operator/    campaign control room, handoff queue, completion control
  features/employer/    aggregate outcomes and privacy-suppression explanation
  components/           shared accessible UI primitives
  evidence/             typed claim registry and sources
  test/                 builders, render helpers, accessibility helpers
tests/e2e/               guided walkthrough, privacy, reset, fallback
docs/                    validation, architecture, demo, pilot and review artifacts
```

### Scaling and failure posture

- Static assets scale through the CDN; browser memory and rendering become the first constraints as synthetic records grow.
- Seed fixtures are capped at 250 employees and analytics operate in linear time; the prototype is not a load-test proxy for Dataverse.
- No background jobs or live cross-service transactions exist in the competition runtime.
- External-service outage cannot block the demo because demo adapters are the runtime default.
- The production boundary requires server-side authentication, authorization, projection, audit storage, and retention controls before real data is introduced; production discovery may evolve adapter contracts where vendor semantics require it.

### Rollback posture

- Revert the bad commit, rebuild the static artifact, and redeploy GitHub Pages.
- Tag the last known-good demo commit and document rebuilding/redeploying that exact commit; do not depend on indefinite Actions-artifact retention.
- Schema-version browser state; incompatible state is reset only after showing a recovery notice.

## 4. Data flows and state machines

### Barrier-to-action data flow with shadow paths

```text
FREE TEXT ─▶ NORMALIZE ─▶ CLASSIFY ─▶ USER CONFIRMS ─▶ POLICY ─▶ NEXT ACTION
    │            │            │              │              │          │
    ├ nil        ├ too long   ├ timeout      ├ rejected     ├ no rule  ├ unavailable
    ├ empty      ├ unsafe UI  ├ refusal      ├ changed      ├ conflict ├ stale view
    └ wrong type └ unicode    └ bad category └ abandoned    └ invalid  └ duplicate

nil/empty       → no classification; prompt remains optional and actionable
too long        → bounded input with accessible validation message
timeout/refusal → visible deterministic fallback and Synthetic label
bad category    → reject adapter output; use allowlisted deterministic result
rejected        → user selects another barrier or asks for human information
no rule         → safe generic human-information route; never invent clinical advice
stale/duplicate → idempotent command or explicit conflict message
```

### Booking data flow

```text
NEXT ACTION ─▶ SLOT QUERY ─▶ SLOT SELECTION ─▶ BOOK COMMAND ─▶ BOOKED EVENT
                    │              │                │               │
                    ├ none         ├ stale slot     ├ duplicate     ├ persistence error
                    ├ unavailable  ├ wrong campaign ├ unauthorized  └ receipt unavailable
                    └ malformed    └ expired        └ adapter error
```

- Empty slot results show alternative booking channels and operator contact.
- A selected slot includes a version token; stale selections do not overwrite newer state.
- The synthetic adapter returns an existing locally saved booking on repeat commands. A real Bookings adapter still requires a durable pre-reservation attempt/outbox record and provider idempotency contract; this is `To Validate` and not implemented in the static prototype.
- A synthetic booking receipt is visibly marked and appears in the synthetic event timeline.

### Completion and employer projection data flow

```text
OPERATOR COMPLETION ─▶ AUTHORIZE ─▶ VALIDATE EVENT ─▶ APPEND EVENT
                                                        │
                                                        ▼
EMPLOYER QUERY ─▶ AUTHORIZE ROLE ─▶ AGGREGATE ─▶ SUPPRESS <10 ─▶ AGGREGATE DTO
                        │               │             │                 │
                        └ deny          ├ empty       └ explain         └ no identifiers
                                        └ conflict
```

- Completion is a separate event and cannot be inferred from booking.
- Employer queries never return the internal employee collection and never filter a raw individual table in the UI.
- Empty campaigns return a useful empty state; cohorts below 10 return suppression metadata without counts that enable differencing.

### Campaign state machine

```text
INVITED ─▶ ENGAGED ─▶ BARRIER_CONFIRMED ─▶ ACTION_OFFERED ─▶ BOOKING_OFFERED ─▶ BOOKED ─▶ COMPLETED
   │          │               │                 │                      │
   │          ├──────────────▶ DECLINED         └──────────────▶ UNREACHABLE
   │          └──────────────▶ OPTED_OUT
   │                          └─────────────────▶ HUMAN_HANDOFF_PENDING
   │
   └────────────────────────────────────────────▶ CAMPAIGN_CLOSED

BOOKED ─▶ CANCELLED ─▶ BOOKING_OFFERED
HUMAN_HANDOFF_PENDING ─▶ HUMAN_HANDOFF_RESOLVED ─▶ ACTION_OFFERED
HUMAN_HANDOFF_PENDING ─▶ UNABLE_TO_CONTACT
BOOKED ─▶ COMPLETION_UNKNOWN
COMPLETION_UNKNOWN ─▶ COMPLETED       (operator-attested synthetic event in demo)

Forbidden examples:
INVITED ─X▶ COMPLETED
BOOKED ─X▶ BARRIER_CONFIRMED
EMPLOYER ─X▶ any individual mutation
AI CLASSIFIER ─X▶ clinical eligibility or completion transition
```

- Transitions are allowlisted and return typed conflicts rather than silently coercing state.
- `HUMAN_HANDOFF_PENDING` cannot resolve without a separately attributable human-resolution event; the public demo receipt states that no real message was sent or monitored.
- `COMPLETION_UNKNOWN` is not treated as non-completion, refusal, or employee hesitancy.
- Production completion provenance requires source type/reference, recorded-by identity, event/received timestamps, verification status, version, and correction/supersession linkage.
- Reset replaces one validated, versioned snapshot containing both domain state and its audit events using a single-key write.
- Failed commands do not emit success events; snapshot replacement avoids pretending browser storage provides multi-record transactions.

## 5. Error and rescue map

| Codepath | Failure | Result code | Rescue | User impact |
|---|---|---|---|---|
| Classify barrier | Timeout/refusal/empty/malformed | `CLASSIFIER_UNAVAILABLE`, `INVALID_CLASSIFICATION` | Allowlisted deterministic fallback plus audit event | Visible fallback and Synthetic label |
| Query slots | Timeout/empty/malformed | `BOOKING_UNAVAILABLE`, `NO_SLOTS`, `INVALID_SLOT_DATA` | Seeded slots or alternate channel | Visible status and retry/alternative action |
| Load repository | Missing/corrupt/schema mismatch | `SEED_NOT_FOUND`, `CORRUPT_STATE` | Preserve diagnostic metadata and offer reset | Named recovery notice |
| Execute transition | Invalid/duplicate/stale version | `INVALID_TRANSITION`, `CONFLICT` | Reject and preserve prior state | Current state plus next valid action |
| Query restricted data | Wrong role/scope | `FORBIDDEN` | Deny and audit without record details | Access-denied state |
| Aggregate cohort | Below threshold | `SUPPRESSED` | Return suppression-safe projection | Privacy explanation, no sensitive count |
| Reset scenario | Partial write/version mismatch | `RESET_FAILED` | Restore last consistent snapshot | Retry without corrupting walkthrough |
| Load evidence | Missing/stale metadata | `EVIDENCE_UNAVAILABLE` | Keep claim at `To Validate` | Evidence-unavailable notice |
| Render application | Unexpected defect | error boundary | Capture sanitized context and offer reset/home | Recoverable error screen |

No catch-all converts an unknown failure into success. Logs include correlation, scenario, command, and result codes but exclude free-text health concerns.

## 6. Security and threat model

### Approved static-prototype boundary

- Decision D7/3A was pre-approved under the user's “use the recommendation without asking” instruction.
- Synthetic fixtures in a public browser bundle are inspectable; the prototype must state this plainly.
- Application-level access tests demonstrate intended role policies but are not represented as production confidentiality controls.
- The Employer feature receives only an aggregate DTO from `VaxMomentService`; no component imports employee fixtures or repository ports.
- Production requires server-side projection, tenant-scoped authorization, immutable audit storage, retention/deletion controls, and a privacy/legal review.

### Findings and mitigations

| Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Employer route or manipulated role reads individual DTO | Medium | High | Closed role union, centralized authorization, aggregate-only query contract, negative tests |
| Small-cohort differencing reveals an individual | Medium | High | Fixed non-filterable prototype views, threshold 10, suppression explanation; production needs complementary suppression and anti-differencing controls |
| Free text contains script/HTML | Medium | Medium | Treat as text only, length limit, React escaping, never use raw HTML |
| Prompt injection changes classifier role | Low in demo; Medium in production | High | Classifier returns allowlisted category only; validate schema; no tools or clinical authority |
| Sensitive text enters logs or analytics | Medium | High | Log category/result codes only; exclude raw barrier text and names |
| Demo role switching is mistaken for production RBAC | Medium | High credibility impact | Persistent `Demo identity` indicator and evidence disclosure |
| Seed/reset command corrupts state | Low | Medium | Single-key versioned snapshot replacement, last-known-good snapshot, deterministic reset test |
| Dependency compromise | Low | High | Minimal packages, lockfile, dependency audit, pinned Actions, no secrets in client |
| Link or external source is malicious/stale | Low | Medium | Curated evidence registry, safe external-link attributes, last-checked metadata |

### Data classification

- Competition runtime: synthetic identifiers and synthetic health-related scenarios only.
- Never collect real names, contact information, medical answers, or vaccination records in the public demo.
- Free-text input displays “Do not enter real personal or medical information,” remains transient, is never written to storage or logs, and is discarded after the employee confirms an allowlisted category.
- Production classification: individual barrier, booking, handoff, and completion records are sensitive personal data and require purpose limitation, access control, retention, deletion, and breach procedures.
- The prototype uses the phrase `aggregate-only demonstration with small-cell suppression`; it does not claim anonymity, de-identification, PDPA compliance, or production privacy safety.

### Approved intervention registry

| Barrier category | Permitted product wording | Deterministic next action | Escalation trigger | Evidence status | Prototype approver |
|---|---|---|---|---|---|
| `ready` | “Choose a convenient appointment.” | Show available workplace/clinic slots | User asks a clinical question | Synthetic workflow | Product owner |
| `convenience` | “Let’s find an option that fits your schedule.” | Prioritise nearby/on-site and suitable-time slots | No suitable slot or accessibility need | Evidence-informed, outcome To Validate | Product owner |
| `cost_or_access` | “See the programme options and what to confirm with the clinic.” | Show campaign-provided access/subsidy information and human contact | Eligibility, subsidy, or suitability question | Source-linked; individual applicability To Validate | Product owner + qualified reviewer before pilot |
| `information` | “Review trusted information or ask a healthcare professional.” | Show curated evidence and human-information route | Any personal medical/suitability question | Source-linked | Qualified reviewer before pilot |
| `clinical_question` | “A healthcare professional should answer this.” | Create an unsubmitted synthetic receipt for a proposed human handoff; provide no generated answer | Always | Product safety rule · To Validate | Qualified reviewer before pilot |
| `decline_or_opt_out` | “Your choice is recorded. You can return while the campaign is open.” | Record opt-out without pressure | User requests human contact | Product rule | Product owner |

- The prototype may use explicit barrier buttons as the deterministic baseline.
- Optional free text is classified only into the allowlist and is visibly labelled `Simulated classification`; it is not presented as a live model call.
- Future Copilot classification must beat the deterministic baseline on a reviewed golden set before production use.

## 7. Interaction edge cases and UX states

| Interaction | Loading | Empty | Error | Success | Partial/recovery |
|---|---|---|---|---|---|
| Barrier submission | Classifying status | Optional-input guidance | Validation/fallback banner | Confirmed barrier card | User changes classification |
| Intervention | Preparing next action | Safe human-info route | Policy conflict message | One primary action | Alternative route available |
| Booking | Skeleton slots | No-slots alternatives | Visible fallback/retry | Receipt and calendar summary | Stale slot re-query |
| Clinical handoff | Preparing handoff receipt | Not applicable | Retry without losing intent | Unsubmitted proposed-owner receipt | Not submitted |
| Operator dashboard | Loading campaign | Launch guidance | Recover/reset | Funnel and handoff queue | Suppressed or incomplete signals |
| Employer dashboard | Loading aggregates | No-results explanation | Safe error without individual data | Aggregate outcomes | Suppression explanation |
| Guided demo | Preparing scenario | No valid checkpoint | Resume/reset | Checkpoint progress | Exit to real UI at any time |
| Reset | Resetting | Not applicable | Preserve prior snapshot | Known-state receipt | Retry available |

### UX hierarchy

1. A persistent banner states `Safe demonstration environment · No real bookings or health records` and shows the current demo identity.
2. Before optional context, show `Do not enter personal, identifying, or medical information`; a skip route remains fully actionable.
3. Lead with the next decision, not a dashboard wall.
4. Show evidence and governance adjacent to consequential claims, with a legend separating evidence status from workflow status.
5. Use one primary action per employee step.
6. Keep the global demo disclosure concise; show fallback and evidence status only where they affect a decision.
7. Show human ownership after escalation; the receipt states that no real message was sent or monitored and does not echo the entered text.
8. Booking and completion remain visually distinct: `Appointment reserved · Vaccination not yet confirmed` until the operator records the separate completion checkpoint.

### Human-handoff safety

- Adjacent input and receipt copy states that the public demo is not monitored, is not medical advice, and must not be used for urgent symptoms.
- The prototype does not invent local emergency contacts; any jurisdiction-specific urgent-care wording requires qualified clinical/legal approval.
- A handoff receipt includes `Not submitted`, owner role, a demo reference, expected response window for a future pilot, return/cancel action, and `No message was sent`.
- Ambiguous, unknown, malformed, low-confidence, or potentially clinical input always routes to human information and produces no automated suitability content.
- The clinical golden set includes prior severe reaction, allergy, pregnancy, immunocompromise, acute illness, medicine interaction, contraindication, adverse event, misspelling, multilingual phrasing, and indirect wording; one unsafe automated route blocks release.

### Canonical three-minute walkthrough

The canonical tour uses one convenience-barrier persona and at most seven checkpoints, targets 165 seconds, and reserves 15 seconds for recovery. Clinical escalation and privacy suppression are concise proof points rather than separate full journeys.

| Time | Checkpoint | One takeaway |
|---|---|---|
| 0:00–0:40 | Promise and fictional barrier | Parkway loses employees between reminder and completion; the privacy promise precedes optional disclosure. |
| 0:40–1:00 | Confirm category | Simulated classification categorises intent; it does not make a clinical decision. |
| 1:00–1:20 | Book seeded slot | Appointment booked is not vaccination completed. |
| 1:20–1:45 | Parkway checkpoint | The operator records a distinct synthetic completion event. |
| 1:45–2:10 | Employer reveal | Aggregate outcome appears while a small cohort is suppressed. |
| 2:10–2:45 | Safety, resilience, evidence | Prepared handoff receipt, one visible fallback, and one evidence status. |
| 2:45–3:00 | Close | The prototype proves the workflow; buyer demand, uplift, and data access remain to validate. |

Each checkpoint has one headline, one takeaway, and one primary action. Judges can exit to the ordinary product at any point. The guided experience is a persistent navigation/coach panel with Back, Next, Exit, and Restart—not a chain of inaccessible tooltip overlays.

### Accessibility

- Keyboard-complete navigation, visible focus, semantic landmarks and headings.
- Minimum WCAG AA contrast, 44×44 CSS-pixel touch targets, and no color-only meaning.
- Status changes use an `aria-live` region without repeatedly interrupting screen readers.
- Reduced-motion support; the guided walkthrough works with animation disabled.
- Charts include text summaries and table equivalents.
- Guided progress is announced as `Step N of 7: <task>`; route/role changes move focus to the new page heading without stealing focus for ordinary status updates.
- Browser Back, refresh, Exit, and Restart restore or explain walkthrough state; sticky controls never obscure the focused element.
- Release gates cover 320 CSS pixels, 390×844, landscape mobile, 200% and 400% zoom, reduced motion, and a manual NVDA/Chrome or VoiceOver/Safari pass.
- Automated accessibility checks have zero serious or critical violations across every canonical checkpoint and core state.
- Operator view leads with one actionable statement; Employer view leads with no more than three aggregates and one plain-language takeaway.

## 8. Code quality and implementation rules

- TypeScript strict mode; no `any` in domain/application modules.
- Discriminated unions for roles, evidence status, result codes, and domain state.
- Exhaustive transition and policy matching with a compile-time `never` check.
- Pure policy, aggregation, and transition functions; adapters own side effects.
- No global mutable singleton; the composition root creates the demo runtime.
- No direct `localStorage` access outside the repository adapter.
- No direct fixture import outside `adapters/demo` and test builders.
- No hardcoded evidence prose spread across components; claims come from the evidence registry.
- No method with more than five behavioral branches without decomposition.
- Avoid Redux, a server framework, a vector database, agent orchestration, or custom authentication for this prototype.

## 9. Test review

### Coverage map

```text
UNIT
  policy matrix · state transitions · privacy projection · evidence labels
  result mapping · input validation · reset determinism · ROI calculations

INTEGRATION
  service + demo repository · classifier fallback · booking fallback
  role authorization · completion event · synthetic event timeline · scenario reset

COMPONENT/A11Y
  employee confirmation · handoff receipt · suppression state · evidence drawer
  keyboard/focus · landmarks · accessible names · no color-only status

E2E
  three seeded scenarios · ≤165-second guided path · exit guided mode
  role switching · privacy denial · fallback visibility · reset and replay
```

### P0 tests

- Every allowed state transition succeeds and every forbidden transition returns `INVALID_TRANSITION`.
- AI output outside the barrier allowlist is rejected and cannot affect eligibility or completion.
- Employer queries cannot return employee IDs, barrier text/categories, booking IDs, or handoff records.
- Cohorts of 1, 9, and dependent cells are suppressed; 10 is the first displayable cohort.
- Booking and completion are separate; booking never increments completion.
- Guided mode produces the same audit events as manual ordinary-mode actions.
- Reset returns an identical canonical state regardless of prior scenario actions.
- Network-disabled E2E walkthrough completes with visible fallback labels.
- Clinical question text produces a handoff receipt and no generated medical answer.
- A unique free-text sentinel is absent from browser storage, URLs, logs, audit events, console output, and network payloads after categorisation, navigation, and reset.
- Every potentially clinical golden-set case routes to human information; zero cases receive automated clinical content or implied suitability.
- Production adapter interfaces compile independently from demo fixtures.

### Hostile and chaos tests

- Manipulate route and demo-role query parameters to request another role's data.
- Submit empty, whitespace, 2,001-character, Unicode, and HTML-like barrier inputs.
- Return malformed classifier categories, empty slot arrays, duplicate events, and stale version tokens.
- Interrupt reset midway and verify the previous consistent snapshot remains usable.
- Run the loaded application through the entire demo after network loss and with disabled animations; offline reload is not promised without a service worker.

### Quality gates

- `npm run lint`
- `npm run typecheck`
- `npm test -- --run`
- `npm run build`
- `npm run test:e2e`
- Dependency audit with production severity threshold high.

## 10. Performance review

- Target first contentful render under 1.5 seconds on a typical judging laptop after static assets are cached.
- Target interaction response under 100 ms for policy, state, and aggregation operations at 250 synthetic employees.
- Lazy-load secondary Operator/Employer charts and P2 features.
- Keep the production JavaScript bundle target below 350 KB gzip unless measured UX justifies an exception.
- Avoid chart libraries if accessible CSS/SVG primitives meet the requirement.
- Compute employer projections once per versioned state and memoize by campaign/version.
- No network waterfall is required for the guided walkthrough.

## 11. Observability and debuggability

- Each command receives a correlation ID and produces a sanitized audit event containing scenario, actor role, command, prior state, next state, result code, fallback flag, and timestamp.
- Raw free text, names, contact details, and clinical-question content never enter logs.
- A compact secondary evidence panel may show adapter mode, seed version, fallback activations, and last command result after the canonical walkthrough is stable; it is not a P0 control room.
- Metrics exposed in the prototype are derived from the current synthetic event stream and labelled accordingly.
- The browser record is called a `synthetic event timeline`, never an immutable or clinical audit trail.
- Production runbook placeholders cover classifier outage, booking outage, completion-feed delay, authorization denial spike, and suppression anomaly.

## 12. Deployment and rollback

### Deployment sequence

```text
Review plan ─▶ Implement ─▶ Lint/typecheck/unit ─▶ Build ─▶ E2E offline/online
     ─▶ Security/design review ─▶ Commit ─▶ Push branch ─▶ GitHub Pages deploy
     ─▶ Public smoke test ─▶ Tag known-good demo commit
```

### GitHub Pages requirements

- Vite base path is `/Vax-moment/` and routing uses hash-based navigation to avoid server rewrite requirements.
- A GitHub Actions workflow builds from a locked Node version with `npm ci` and deploys only after all required checks pass.
- Workflow permissions are least-privilege: contents read and Pages/id-token write only for deployment.
- No secrets are embedded in source, bundle, workflow, or Pages configuration.
- A checked-in fallback dataset makes the deployed application independent of external APIs.

### Rollback flow

```text
Smoke test fails?
   ├─ No ─▶ mark deployment verified
   └─ Yes
       ├─ artifact/config-only issue ─▶ redeploy last successful artifact
       └─ code issue ─▶ revert offending commit ─▶ full gates ─▶ redeploy
```

### Post-deploy verification

- Public URL returns HTTP success and application assets load from the repository base path.
- Guided demo completes all checkpoints in a clean browser session.
- A loaded session remains functional after network loss; offline cold reload is explicitly unsupported unless a service worker is later added and tested.
- Employer small-cohort scenario is suppressed.
- Clinical escalation produces the expected human-handoff receipt.
- Evidence links and classifications render correctly.
- Mobile viewport, keyboard navigation, and reset/replay are manually smoke-tested.

## 13. Long-term trajectory

Reversibility: **4/5**. Domain and application modules are portable; static runtime choices are disposable adapters. The largest future change is moving access control, projections, persistence, and audit storage to a trusted server boundary.

### Phase 2 — sponsored pilot

- Replace demo identity with Entra and enforce tenant/role claims server-side.
- Replace seed repository with Dataverse after schema, licensing, retention, and access validation.
- Integrate Bookings through a failure-tested adapter.
- Define completion-source ownership, lawful basis, reconciliation, and latency SLA.
- Pre-register primary uptake and operational metrics before enrolling users.

### Phase 3 — governed scale

- Add multilingual content reviewed by qualified humans.
- Version interventions and evidence, with approval history.
- Add production observability, support runbooks, incident response, deletion/export, and formal privacy review.
- Consider Copilot Studio classification only after a deterministic baseline and golden-set evaluation exist.

## 14. Product validation and business model

### Wedge

One employer influenza campaign, one Parkway operator team, and one employee journey from barrier disclosure to booked appointment and an operator-attested synthetic completion checkpoint. The wedge is campaign conversion orchestration, not general vaccine education.

### Buyer value

- Parkway: fewer stalled campaigns, clearer operational handoffs, and evidence for improving future campaigns.
- Employer: higher workforce programme participation with aggregate-only reporting.
- Employee: less search and scheduling friction plus a visible human path for clinical questions.

### Pilot offer

- Fixed-fee, time-bounded campaign pilot priced against programme operations and unused appointment capacity, not against hypothetical healthcare savings.
- Define pricing only after confirming the buyer, campaign size, current workflow cost, and completion-data access.
- No ROI claim enters the pitch as fact until measured in a real pilot.

### Pilot evaluation

- Prototype metric: operator-attested synthetic completion among all synthetic invited employees; it is not an outcome claim.
- Pilot primary metric: authoritative completion among all invited employees, unless an externally supplied clinician-authorized eligibility denominator is frozen before enrolment.
- Secondary metrics: booking conversion, time to next action, handoff completion, opt-out, and support burden.
- Guardrails: privacy incidents, incorrect clinical responses, employer access violations, and employee trust/abandonment.
- Pre-register population, allocation, primary endpoint, outcome source, observation window, missing-data handling, exclusion rules, and analysis; compare against the existing workflow or contemporaneous control with identical outcome ascertainment.
- Report absolute rates, difference, uncertainty, missingness, support burden, and adverse safety/privacy events; no causal uplift or ROI claim comes from personas or an uncontrolled before/after view.

## 15. Prohibited claims

The application, documentation, pitch, and demo narration must not state or imply any of the following without the named future evidence:

- That VaxMoment provides a clinically safe, clinically appropriate, or medically recommended next action.
- That AI identifies eligibility, contraindications, suitability, adverse reactions, the correct vaccine, or vaccination completion.
- That clinical questions are triaged, monitored, sent, or answered by a clinician in the competition runtime.
- That a seeded, self-reported, or operator-entered event is `Verified completion`.
- That a person is eligible unless an authorized external process supplied that fact.
- That VaxMoment improves uptake, reduces hesitancy, improves health, reduces absenteeism, or saves money before a valid pilot supports the claim.
- That the static prototype is anonymous, de-identified, re-identification-proof, PDPA-compliant, production secure, or protected by a production privacy firewall.
- That the synthetic event timeline is immutable or a clinical audit trail.
- That the employer is technically unable to inspect synthetic bundle data; the claim is limited to demonstrated application behavior and fixed aggregate queries.
- That Microsoft, Parkway, Bookings, Entra, Dataverse, or Copilot integrations are live, approved, or endorsed.

## 16. What already exists

- The supplied handoff provides the product boundary, Microsoft target architecture, initial entities, API direction, privacy principle, demo narrative, and business-model hypothesis.
- The repository has only `CLAUDE.md` and planning documents; there is no product code to reuse.
- Existing public vaccination booking, subsidy, workplace-delivery, and aggregate-reporting services are ecosystem inputs and competitors, not code dependencies.

## 17. NOT in scope

- Real personal or health data.
- Production authentication, authorization, tenancy, persistence, audit retention, or compliance certification.
- A live Copilot Studio, Dataverse, Bookings, Entra, or Azure integration without credentials and verified tests.
- Clinical recommendations, eligibility, diagnosis, adverse-event guidance, or medical suitability decisions by AI.
- Autonomous outbound messaging or agent actions.
- Native mobile applications, microservices, queues, vector databases, or custom model training.
- P2 multilingual and ROI work until the English P0/P1 E2E suite is stable.

## 18. Dream-state delta

This plan reaches a credible, public, inspectable competition prototype. It does not close the three commercial gaps that matter most: a named buyer willing to sponsor the pilot, lawful access to completion data, and measured evidence that the intervention changes uptake. Those remain the first post-competition validation targets.

## 19. Implementation tasks

- [ ] **T1 (P1, human ~1.5h / Codex ~20m)** — Ship a walking skeleton immediately: strict React/TypeScript/Vite, hash routing, accessible tokens, CI, Pages workflow, and one public placeholder route.
  - Surfaced by: deployment sequencing review.
  - Verify: lint, typecheck, build, smoke test, and public base-path asset loading before feature depth.
- [ ] **T2 (P1, human ~1.5h / Codex ~20m)** — Freeze the intervention/evidence registry, prohibited claims, point-of-use safety copy, and three synthetic scenarios before implementing workflow copy.
  - Surfaced by: outside architecture and healthcare-safety reviews.
  - Verify: every category maps to permitted wording, action, escalation, evidence status, and approver; source links resolve.
- [ ] **T3 (P1, human ~2.5h / Codex ~35m)** — Implement the minimal domain core: typed results, state machine including ordinary terminal outcomes, intervention policy, access policy, fixed privacy projection, single-snapshot repository, and synthetic event timeline.
  - Surfaced by: architecture, security, data-integrity, and state reviews.
  - Verify: exhaustive unit matrix for forbidden transitions, completion provenance, suppression boundaries, and no employer individual DTO.
- [ ] **T4 (P1, human ~2.5h / Codex ~35m)** — Build one convenience-barrier employee journey end to end through the application facade: fictional input, category confirmation, next action, seeded booking, and `Booked—not completed` receipt.
  - Surfaced by: scope-reduction and narrative reviews.
  - Verify: public vertical-slice E2E, transient-text sentinel test, visible simulated-classifier and booking labels.
- [ ] **T5 (P1, human ~2.5h / Codex ~35m)** — Add the single Parkway completion checkpoint and Employer aggregate reveal using the same event stream and fixed aggregate query.
  - Surfaced by: buyer/wedge, privacy, and completion-integrity reviews.
  - Verify: operator-attested synthetic completion updates aggregates; booking alone does not; suppressed cohort reveals no reconstructable individual field.
- [ ] **T6 (P1, human ~2h / Codex ~30m)** — Add ready and clinical-handoff scenarios, one-action reset, visible fallback behavior, and the non-monitored synthetic handoff receipt.
  - Surfaced by: approved D4 and healthcare-safety review.
  - Verify: clinical golden set has zero unsafe automated routes; reset is canonical; loaded-session network loss completes.
- [ ] **T7 (P1, human ~2.5h / Codex ~35m)** — Add the seven-checkpoint guided coach, role switching, exit/restart/resume, evidence status disclosure, responsive behavior, and accessibility gates.
  - Surfaced by: UX/accessibility review.
  - Verify: ≤165-second unfamiliar-user walkthrough, keyboard/screen-reader pass, 320px/400% reflow, and no serious/critical automated accessibility violations.
- [ ] **T8 (P2, human ~1.5h / Codex ~20m)** — Finish market-validation, pilot, demo, architecture, and submission documentation with one Parkway buyer narrative and all assumptions exposed.
  - Surfaced by: product/market and competition review.
  - Verify: no prohibited clinical, privacy, Microsoft, completion, uptake, causality, or ROI claim appears in product or docs.
- [ ] **T9 (P1, human ~2h / Codex ~30m)** — Run engineering, healthcare-safety, security, accessibility, design, and adversarial reviews continuously and at final diff; resolve every P1 finding before final commit/push.
  - Surfaced by: required review chain.
  - Verify: all quality gates, E2E, deployed smoke tests, and review report are clear; known-good commit is tagged or recorded.

## 20. Failure modes registry

| Codepath | Failure mode | Rescued? | Test? | User sees? | Logged? |
|---|---|---:|---:|---|---:|
| Classification | Unavailable, refusal, malformed result | Yes | Yes | Visible fallback | Yes |
| Booking | Unavailable, empty, stale or duplicate | Yes | Yes | Retry/alternative/fallback | Yes |
| State mutation | Invalid or conflicting transition | Yes | Yes | Current state and recovery | Yes |
| Authorization | Wrong role/resource | Yes | Yes | Access denied | Yes |
| Employer projection | Small or differencing-prone cohort | Yes | Yes | Suppression explanation | Yes |
| Completion | Booking mistaken for completion | Prevented | Yes | Separate status | Yes |
| Reset | Partial/corrupt reset | Yes | Yes | Previous consistent state and retry | Yes |
| Evidence | Missing/stale metadata | Yes | Yes | `To Validate` status | Yes |
| Rendering | Unexpected component defect | Yes | Yes | Error boundary and reset/home | Sanitized |
| Deployment | Base-path or asset failure | Yes | Yes | Last known-good deployment | CI log |

No row is silent, untested, and unrescued.

## 21. Skills and tooling selection

| Skill or workflow | Verdict | Reason |
|---|---|---|
| Coding agents | Now | The scope, contracts, acceptance criteria, and prohibited claims are frozen enough for parallel implementation. |
| Research agent | Now, bounded | Re-check official competition materials and maintain primary-source evidence; do not expand into generic market research. |
| Product strategy | Now, substantially complete | It selected Parkway as buyer and conversion orchestration as the wedge; revisit only on contradictory buyer evidence. |
| UX/UI design and accessibility | Now | The canonical tour and trust boundary are core judging and safety requirements. |
| Testing/QA | Now | State, privacy, transient-input, accessibility, and guided-demo behavior require executable gates alongside implementation. |
| Security audit | Now and pre-deploy | Public health-related input, employer separation, dependency integrity, and workflow permissions need continuous review. |
| Healthcare safety review | Now and before any pilot | Clinical ambiguity, handoff wording, completion provenance, and prohibited claims are load-bearing. |
| Market research | Now, decision-specific | Validate judging requirements, buyer workflow, competitor parity, and the pilot hypothesis with dated sources. |
| Presentation/demo workflow | Now | The non-technical track is judged through a three-minute narrative and supporting artifacts. |
| Document writing | Now | Market validation, pilot design, architecture, demo script, and handoff documents must be independently executable. |
| Deployment/DevOps | Now | A public walking skeleton and rollback path are required early, not after feature completion. |
| Financial modelling | Later | Pricing and ROI lack buyer and operational inputs; an assumption-only calculator is not competition-critical. |
| Data analysis | Later | Required for a real pilot; the synthetic personas cannot support outcome inference. |
| API integration | Later | Microsoft tenant discovery and credentials are absent; current work stops at truthful business-semantic ports. |
| Legal/compliance support | Later, before real data | Qualified Singapore privacy/clinical review is mandatory before any pilot but cannot be replaced by this prototype review. |
| Multi-agent product runtime | Never for this scope | The product needs deterministic policy plus at most one bounded classifier, not autonomous agents. |
| Custom authentication, vector database, microservices | Never for this scope | They add cost and failure surface without improving the competition hypothesis. |

## 22. Stale diagram audit

| Diagram | Location | Status |
|---|---|---|
| System architecture | Section 3 | Current after adopting the in-process application facade and replaceable business-semantic ports. |
| Barrier-to-action flow | Section 4 | Current after transient input and visible simulated classification rules. |
| Booking flow | Section 4 | Current; booking remains separate from completion. |
| Completion/employer projection | Section 4 | Current after operator-attested synthetic completion and fixed aggregate query decisions. |
| Campaign state machine | Section 4 | Current after adding declined, opted-out, unreachable, campaign-closed, unknown completion, and unresolved handoff outcomes. |
| Error flow | CEO plan and Section 5 | Current after adopting visible typed fallback behavior. |
| Deployment sequence | Section 12 | Current after moving the public walking skeleton to T1. |
| Rollback flow | Section 12 | Current after replacing artifact-retention assumptions with a known-good commit rebuild. |

No implementation diagrams existed before this plan, so no stale code diagram requires removal.

## 23. CEO review completion summary

| Review area | Result |
|---|---|
| Mode | Scope Expansion, narrowed by adversarial review to a competition-critical vertical slice |
| Scope proposals | 1 proposed, 1 accepted, 0 deferred during expansion ceremony |
| Architecture | 4 material issues resolved: static security honesty, in-process facade, single-snapshot persistence, production contract evolution |
| Errors | 9 typed failure paths mapped, 0 silent critical gaps |
| Security | 6 material threats mapped; static confidentiality and small-cell limitations made explicit |
| Data and interaction | Nil, empty, malformed, conflict, stale, duplicate, recovery, and terminal outcomes specified |
| Code quality | Strict dependency direction, typed results, pure domain logic, and explicit anti-overengineering rules |
| Tests | Unit, integration, component/a11y, E2E, hostile, clinical golden-set, and transient-input sentinel gates specified |
| Performance | Static bundle, render, operation, record-count, and dependency targets specified |
| Observability | Sanitized correlation/result events and synthetic timeline; no raw health text |
| Deployment | Walking skeleton first, Pages base path, least-privilege workflow, public smoke test, and rollback specified |
| Future | Reversibility 4/5; Microsoft and real-data controls remain future adapters and server boundaries |
| UX/design | Seven-checkpoint ≤165-second narrative, trust copy, responsive and accessibility gates specified |
| Outside architecture voice | 14 findings accepted and integrated; no remaining cross-review tension |
| Healthcare safety | 5 P0 and 5 P1 findings converted into release and pilot gates |
| UX/accessibility | 2 blockers and 8 major findings converted into acceptance criteria |
| Unresolved decisions | 0; official rubric publication remains an external fact to re-check, not a product decision |

Readiness after review: **7/10 for competition implementation, 3/10 for a real-world pilot.** Risk: **6/10**, dominated by unvalidated buyer demand, completion-data access, and judging requirements rather than code feasibility.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|---|---|---|---:|---|---|
| CEO Review | `/plan-ceo-review` | Scope and strategy | 1 | CLEAR | 1 expansion accepted; plan narrowed and all critical findings incorporated |
| Outside Voice | automatic fallback | Independent challenge | 1 | CLEAR | 14 findings integrated; external Codex export was blocked and safely replaced by an internal fresh-context reviewer |
| Eng Review | parallel architecture review | Architecture and tests | 1 | CLEAR (PLAN) | Static boundary, sequencing, persistence, state, and deployment issues resolved |
| Healthcare Review | parallel safety review | Clinical and health-data safety | 1 | CLEAR FOR SYNTHETIC DEMO | P0 controls incorporated; real-user pilot remains blocked on human review and data governance |
| Design Review | parallel accessibility review | UI, trust, and demo quality | 1 | CLEAR (PLAN) | Two blockers and eight major issues converted into build gates |

**CROSS-MODEL:** No unresolved tension; CEO, architecture, healthcare, and UX reviewers converged on a narrower synthetic demo with stronger honesty boundaries.

**VERDICT:** CEO + ENG + HEALTHCARE PLAN + DESIGN PLAN CLEARED — ready to implement the synthetic competition vertical slice; real employee use remains prohibited.

NO UNRESOLVED DECISIONS
