# Microsoft adapter boundary

**Status:** proposed production architecture; not implemented or approved  
**Version date:** 10 August 2026

The public competition runtime uses deterministic browser adapters and synthetic data. It has no live Entra, Dataverse, Copilot Studio, Microsoft Bookings, Microsoft Graph, or Application Insights connection. Mentioning a Microsoft product below describes a replaceable candidate boundary, not endorsement, tenant availability, licensing, configuration, or production readiness.

## Architecture principle

Product logic speaks in VaxMoment business semantics. Vendor details remain behind ports so the competition artifact and a future Microsoft implementation exercise the same command/query intent without allowing Microsoft SDK types to leak into domain or feature code.

```text
Employee / Operator / Employer / Guided demo
                    |
                    v
           VaxMoment application facade
                    |
     +--------------+-------------------------------+
     |              |              |                |
 IdentityPort  CampaignStore  ClassifierPort   BookingPort
     |              |              |                |
 demo identity  seed snapshot  deterministic     seeded slots
     |              |           allowlist            |
     v              v              v                v
 future Entra   future Dataverse  future Copilot  future Graph
 adapter        adapter           Studio adapter   Bookings adapter
                    |
                    +-----------------> AuditPort -> future App Insights
```

Employer projection is a separate server-side concern in production:

```text
Employer query -> authenticate -> authorize tenant/role -> fixed aggregate query
               -> suppress small/complementary cells -> aggregate DTO only
```

The public static app can demonstrate the contract but cannot provide a production privacy firewall because its synthetic bundle is inspectable.

## Candidate adapter contracts

| Port | Business input | Business output | Demo implementation | Future Microsoft candidate | Required production checks |
|---|---|---|---|---|---|
| Identity | requested demo role | closed role and tenant context | explicit synthetic identity switch | Microsoft Entra ID | tenant model, conditional access, token validation, account lifecycle, privileged admin access |
| Campaign repository | versioned campaign command/query | typed snapshot or conflict | single browser snapshot | Microsoft Dataverse | table design, tenant ownership, row/field security, retention, deletion/export, backup, correction history |
| Classifier | bounded transient text | one allowlisted barrier category or typed failure | deterministic classifier/fallback | Copilot Studio | licensing, region, data policy, prompt/version control, structured validation, golden-set superiority, injection testing |
| Booking | campaign/service query and versioned slot command | slots, booking receipt, typed unavailable/conflict result | seeded slots and synthetic receipt | Microsoft Graph Bookings API | shared-booking fit, delegated/application permissions, consent, rate limits, idempotency, timezone, cancellation, outage handling |
| Audit/telemetry | sanitized event code and correlation metadata | accepted or typed sink failure | in-memory synthetic timeline | Application Insights | PII scrubbing, retention, sampling, access, alerts, correlation, regional and contractual requirements |

Microsoft documents [Dataverse role-based security](https://learn.microsoft.com/en-us/power-platform/admin/database-security) (updated 2 June 2026), the [Bookings API for shared bookings](https://learn.microsoft.com/en-us/graph/api/resources/booking-api-overview?view=graph-rest-1.0), and [Copilot Studio governance controls](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-faq) (updated 29 April 2026). These sources confirm product capabilities only; they do not validate VaxMoment's tenant fit.

## Required failure contracts

Every adapter returns a typed result; unknown failures never become success.

| Adapter failure | Application behavior | User-visible state | Audit rule |
|---|---|---|---|
| Identity missing/expired/unauthorized | deny command/query | sign-in or access-denied guidance | correlation, role/tenant result code; no health text |
| Dataverse unavailable/conflict | preserve previous state; retry only idempotent operation | named unavailable/conflict message | command, version, result code |
| Copilot timeout/refusal/malformed category | reject output and invoke allowlisted deterministic fallback | persistent “Fallback active · Synthetic” label | category/result code only; never raw text |
| Bookings unavailable/no slots/stale slot | no booking event; re-query or show alternative channel | unavailable, empty, or stale-selection recovery | slot/campaign identifiers and result; no medical text |
| Telemetry sink unavailable | business action must follow the approved fail-open/fail-closed policy by event severity | no false success claim | local operational alert without sensitive payload |

## Authority boundaries

- The classifier can return only an allowlisted barrier category for user confirmation.
- The classifier cannot decide eligibility, suitability, vaccine choice, contraindications, adverse-event guidance, or completion.
- Booking cannot imply completion.
- Completion requires a separately attributable source and event.
- Employer requests cannot receive individual barrier, intervention, booking, handoff, or completion DTOs.
- Clinical questions require an accountable human service; autonomous answers and outbound actions are out of scope.

## Production discovery checklist

1. Confirm tenant ownership, environments, licenses, geography, data policies, and permitted connectors with Parkway and Microsoft administrators.
2. Freeze the minimum data model and PII map with operational, privacy, security, and clinical owners.
3. Define completion provenance: source, legal authority, latency, corrections, reconciliation, and unknown states.
4. Threat-model each identity and app registration; grant the least permission and test denial paths.
5. Prove employer projection and suppression at the trusted server boundary, including complementary suppression and query controls.
6. Add a durable pre-reservation attempt/outbox record with provider idempotency key and reference, then test ambiguous success, reload/retry, compensation, timezone behavior, stale slots, rate limiting, partial failure, and outage UX.
7. Benchmark a future Copilot classifier against the deterministic baseline on a reviewed golden set; require zero clinical-answer routes.
8. Define sanitized logs, retention, alerts, incident response, deletion/export, support, rollback, and audit ownership.
9. Obtain qualified privacy, security, clinical, and legal review before any real participant or data.

## Rollout and rollback

Introduce one adapter at a time behind the existing port, beginning in an isolated non-production environment with synthetic records. Run contract, denial, outage, correction, and privacy-projection tests before promotion. Keep deterministic demo adapters available for competition replay, but never silently substitute them in a real pilot. A production rollback returns traffic to the last tested adapter version and preserves authoritative data/correction history; it must not fabricate a successful booking, handoff, or completion.
