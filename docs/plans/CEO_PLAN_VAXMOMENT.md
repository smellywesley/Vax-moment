---
status: PROMOTED
project: VaxMoment
generated: 2026-08-09
branch: codex/vax-moment
mode: SCOPE_EXPANSION
approach: DEPLOYED_EVIDENCE_BACKED_VERTICAL_SLICE
competition: Hack4Health 2026 Non-Technical Track
---

# CEO Plan: VaxMoment Competition Vertical Slice

## Vision

VaxMoment is not a generic vaccine chatbot or reminder campaign. It is a governed vaccination-activation system that turns a known employee barrier into one non-clinical next action, reduces booking friction, records an operator-attested synthetic completion signal in the prototype, and demonstrates aggregate-only employer reporting with illustrative small-cell suppression.

The competition prototype must prove the complete operating loop in three minutes while remaining honest about what is synthetic, assumed, or still awaiting pilot validation.

## 10x Check

The 10x version is an executive-ready pilot control room rather than a collection of mock screens. An employee can move from uncertainty to an appropriate next step in under a minute; a Parkway operator can see where a campaign is losing people; an employer can understand aggregate outcomes without learning any individual's health concern; and a judge can inspect the evidence, governance boundary, and state transitions behind every consequential claim.

## Platonic Ideal

The employee feels understood but never diagnosed by software. Clinical questions stop at a visible human-handoff boundary. Booking feels immediate. Operators see actionable campaign friction instead of vanity metrics. Employers see useful population-level progress without a path back to individual records. The product remains fully demonstrable during an outage, and the transition to Microsoft Copilot Studio, Dataverse, Bookings, Entra, and Azure is explicit rather than implied.

## Frozen Product Boundary

- Buyer: Parkway Shenton Corporate Health or an employer vaccination-program owner.
- Operator: Parkway campaign manager.
- End user: employee invited to a workplace vaccination campaign.
- Employer view: aggregate-only with small-cell suppression; no individual barriers or health information.
- AI role: classify free-text barriers or language intent only; never determine eligibility, clinical suitability, or completion.
- Policy role: deterministic, inspectable intervention selection and workflow transitions.
- Evidence standard: every consequential statement is labelled `Verified`, `Synthetic`, `Assumed`, or `To Validate`.
- Deployment: public, judge-accessible environment; localhost is not an accepted completion state.

## Scope Decisions

| # | Proposal | Decision | Priority | Reasoning |
|---|---|---|---|---|
| D3 | Deployed evidence-backed vertical slice | ACCEPTED | P0 | Best match for the non-technical track without pretending unavailable Microsoft integrations are live. |
| D4 | Judge-ready demonstration mode over the real product | ACCEPTED | P0-P2 | Improves judge comprehension and outage resilience without duplicating business logic. |

## Accepted Scope

### P0 — required

- One public application containing Employee, Parkway Operator, and Employer experiences.
- A single shared policy engine, campaign state machine, aggregation layer, API contract, and access-control path.
- Three deterministic personas: ready to book, convenience barrier, and clinical escalation; the clinical campaign fixture also demonstrates a privacy-suppressed small cohort.
- Guided three-minute walkthrough with optional `Next` controls and immediate exit to the ordinary application.
- Demo-only role switching without logout friction; production authorization boundaries remain explicit and unchanged.
- Deterministic seeded booking responses, intervention outputs, completion events, and analytics.
- One-action scenario reset to a known state.
- Public deployment and smoke-tested fallback behavior.

### P1 — high value

- Evidence drawer exposing source, assumption status, and evidence classification.
- Observable clinical boundary and human-handoff receipt with named ownership.
- Deliberate privacy-suppression demonstration in the employer experience.
- Audit timeline sufficient to reconstruct the seeded scenario.

### P2 — deferred until after the competition-critical path is stable

- Multilingual employee journey.
- Assumption-based ROI simulator with every editable parameter visible and no hypothetical result presented as measured evidence.

## Non-Negotiable Architecture Constraint

> The demo may control the scenario, but it must never bypass the system.

Demo mode must invoke the same API boundary, policy engine, state machine, aggregation rules, and access-control checks as the ordinary product. It may choose and reset scenario data, but it may not duplicate or short-circuit business logic.

## Market Validation Status

| Claim | Status | Current evidence |
|---|---|---|
| Adult vaccination uptake remains below policy goals | Verified | Singapore MOH uptake reporting and subsidy policy. |
| Convenience and default pathways can outperform generic reminders | Verified/Context-dependent | Published intervention evidence; effect sizes vary by population and implementation. |
| Parkway has a plausible corporate-health distribution channel | Verified | Parkway corporate and workplace-health service offerings. |
| Barrier-specific orchestration will materially improve uptake | To Validate | Requires a real pilot or controlled experiment. |
| Parkway or employers will pay for VaxMoment | To Validate | No buyer commitment or willingness-to-pay evidence supplied. |
| Authoritative completion data can be integrated | To Validate | No production data contract, provenance model, or integration access supplied. |
| Live Microsoft ecosystem integration is currently implementable | Not verified | No tenant, Copilot Studio, Dataverse, Bookings, Entra, or Azure credentials detected. |

## Kill and Success Criteria

- Competition success: judges can complete the guided walkthrough, inspect the underlying application, and distinguish verified evidence from assumptions without presenter explanation.
- Technical success: all seeded scenarios traverse the same governed code paths, reset deterministically, and pass automated policy/privacy tests.
- Pilot success criterion: define a primary completion-rate uplift threshold and operational metric with Parkway before a real pilot; the prototype must not invent the result.
- Kill/pivot criterion: if employers will not sponsor access, completion cannot be verified without unacceptable health-data exposure, or barrier-specific intervention fails to outperform the existing workflow, reposition away from an employer-controlled activation platform.

## NOT in Scope

- Claims of clinical diagnosis, eligibility determination, or medical advice by AI.
- Claims that Microsoft integrations are live without working credentials and verified end-to-end tests.
- Real employee health data.
- Production-grade multi-tenant security on a static competition deployment.
- Autonomous outreach or clinical decision-making.
- Hypothetical ROI presented as measured savings.

## Dream State Delta

The approved prototype can demonstrate the product logic and pilot operating model, but it will not by itself prove willingness to pay, real-world completion uplift, integration access, or production compliance. The 12-month ideal requires a Parkway-sponsored pilot, a lawful completion-data contract, production identity and authorization, Microsoft integrations, evaluation against a pre-registered baseline, and qualified legal/privacy review.

## Open Review Gates

- Error and recovery behavior for every scenario path.
- Threat model, privacy enforcement, test plan, observability, rollout, and UX states.
- Independent outside-voice review.
- Required engineering and design reviews before implementation.

## Approved Runtime Architecture

Decision D5/1A: deploy a static public vertical slice with replaceable infrastructure adapters.

```text
Guided Demo ─┐
Employee UI ─┼──▶ Shared API client ──▶ Application services
Operator UI ─┤                              │
Employer UI ─┘                              ├── Policy engine
                                             ├── State machine
                                             ├── Privacy aggregation
                                             └── Access-control checks
                                                       │
                              ┌────────────────────────┴──────────────────────┐
                              │ Competition adapters                         │
                              │ Seeded repository · demo identity · fallback │
                              │ booking · deterministic barrier classifier   │
                              └───────────────────────────────────────────────┘
                                                       │
                                      Future production adapter boundary
                                  Entra · Dataverse · Bookings · Copilot
```

### Runtime rules

- All user experiences and guided-demo controls call the same application-service boundary.
- Demo mode may select/reset scenarios and switch a demo identity, but it cannot write domain state directly.
- The policy engine, state machine, privacy aggregation, and authorization rules are framework-independent TypeScript modules.
- Competition adapters operate only on synthetic seeded records and are labelled as simulated infrastructure.
- Browser-side authorization demonstrates intended policy behavior but is never described as production-grade security.
- Production adapters preserve the same contracts for Entra identity, Dataverse persistence, Bookings slots, and Copilot-assisted barrier classification.
- Public delivery targets GitHub Pages with deterministic assets and no runtime dependency on an external AI or booking service.
- Rollback is a Git revert and redeploy of the last known-good static artifact.

## Error and Rescue Policy

Decision D6/2A: use visible, typed degradation; no silent fallback is permitted.

```text
Adapter request
     │
     ├── Valid response ──▶ validate ──▶ use response
     │
     ├── Timeout/refusal/malformed response
     │          └──▶ typed failure ──▶ deterministic fallback
     │                                      │
     │                                      ├── audit event
     │                                      ├── visible fallback status
     │                                      └── Synthetic evidence label
     │
     └── Invalid state/authorization ──▶ block action ──▶ recovery guidance
```

### Error and rescue registry

| Method or codepath | Failure | Typed result | Rescue action | User sees |
|---|---|---|---|---|
| Barrier classifier adapter | Timeout, refusal, empty or malformed category | `CLASSIFIER_UNAVAILABLE` or `INVALID_CLASSIFICATION` | Use deterministic seeded classification, record audit event | Visible fallback badge and `Synthetic` label |
| Booking adapter | Timeout, unavailable or malformed slots | `BOOKING_UNAVAILABLE` or `INVALID_SLOT_DATA` | Use seeded slots, record audit event | Visible fallback badge; retry option remains available |
| Repository load | Missing seed | `SEED_NOT_FOUND` | Block scenario and offer reset | Named scenario error with reset action |
| Repository load | Corrupt browser state or schema mismatch | `CORRUPT_STATE` | Discard only synthetic session state after confirmation, reseed known version | Recovery notice and successful reset receipt |
| State transition | Invalid or duplicate transition | `INVALID_TRANSITION` or `CONFLICT` | Reject mutation and retain prior state | Action not completed; current valid state remains visible |
| Access-control check | Wrong role or resource scope | `FORBIDDEN` | Deny output/mutation and write security audit event | Access denied without restricted record details |
| Privacy aggregation | Cohort below suppression threshold | `SUPPRESSED` domain outcome | Return suppression-safe projection, not an exception | Small-cohort privacy explanation |
| Scenario reset | Reset interrupted or version mismatch | `RESET_FAILED` | Preserve last consistent snapshot and permit retry | Reset failed; walkthrough remains in previous state |
| Evidence lookup | Missing or stale reference metadata | `EVIDENCE_UNAVAILABLE` | Preserve claim label as `To Validate`; never upgrade confidence | Evidence unavailable message |

### Failure rules

- Domain and adapter boundaries return discriminated typed results; unexpected programming defects are allowed to reach the application error boundary with diagnostic context.
- Every rescued error must retry safely, degrade visibly, or stop with a recovery action.
- Logs contain scenario IDs and correlation IDs, never free-text health concerns.
- Fallback activation is included in the synthetic event timeline and cannot be hidden by guided-demo mode.
- No catch-all branch may convert an unknown failure into apparent success.
