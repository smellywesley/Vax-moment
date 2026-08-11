# VaxMoment Microsoft supporting artifact pack

**Status:** design/source artifacts only — **not deployed, not imported, not tenant-tested, and not Parkway-approved**
**Version date:** 11 August 2026
**Artifact type:** Microsoft-compatible implementation inputs, not a Power Platform solution export

This directory translates the public VaxMoment demonstration boundary into reviewable inputs for a future Microsoft implementation. It contains no solution `.zip`, connection reference, environment identifier, secret, app registration, Dataverse metadata export, live flow, published Copilot Studio agent, or evidence of Microsoft/Parkway approval.

Do not use the words **deployed**, **integrated**, **connected**, **approved**, or **production-ready** for this pack. A real export must be created from an authorized development environment after tenant, licensing, privacy, security, clinical, and operational decisions are made.

## Contents

| Artifact | Purpose | Current status |
|---|---|---|
| `copilot-studio/agent-instructions.md` | Bounded agent instructions and tool/autonomy rules | Proposed; not entered in Copilot Studio |
| `schemas/barrier-classification.schema.json` | Draft-07 schema for successful allowlisted classification output | Locally syntax/schema-validated; not wired to a model |
| `adaptive-cards/*.json` | Adaptive Card v1.5 source for barrier, booking, and clinical-handoff confirmations | JSON validated; not host-rendered or published |
| `flows/contracts.md` | Typed contracts for five proposed agent flows | Design only; no flows exist |
| `dataverse/table-role-mapping.md` | Proposed tables, ownership, sensitive fields, and least-privilege roles | Design only; no tables or roles exist |
| `governance/dlp-entra-governance-checklist.md` | DLP, Entra, audit, ALM, privacy, and go-live gates | Uncompleted checklist |
| `evaluation/golden-set.json` | Safety-routing cases; every clinical case expects a human handoff and no clinical answer | Fixture only; no model result recorded |
| `../docs/architecture/microsoft-execution-blueprint.md` | Demo-to-production mapping and Microsoft source links | Proposed architecture; not approved |

## Prerequisites for a future implementation

An authorized Parkway/Microsoft owner must confirm all of the following before creating anything with real data:

1. A non-production Power Platform environment with Dataverse, an environment security group, an approved region, and named owner.
2. Copilot Studio and Power Automate/agent-flow capacity and licensing appropriate to the chosen channels and connectors.
3. Microsoft Teams availability if Teams is a target host; Teams limits Adaptive Cards to schema version 1.5.
4. A solution publisher and prefix, Dev/Test/Prod environment strategy, managed-solution policy, connection-reference strategy, and environment variables.
5. Approved identity model for employees, operators, clinicians, employers, and non-human identities; Entra tenant/guest assumptions are still open.
6. Approved Dataverse data inventory, lawful purpose/basis, PII classification, retention/deletion/export rules, business-unit/team ownership, and field security design.
7. Approved connector allowlist/data policy. Do not assume Microsoft Graph, Teams, or any custom connector is permitted merely because it exists.
8. A Bookings business/service/staff configuration and approved Graph permission model if Bookings is selected after a fit test.
9. A named, staffed clinical handoff service and response commitment. Until then, no production handoff may claim that a message is monitored.
10. A qualified privacy, security, legal, clinical, and Parkway operational review.

## Exact implementation/import steps

There is **nothing importable yet**. Do not select **Import solution** with this directory or rename/archive it as a solution package.

To turn the design into a legitimate development solution:

1. Obtain the approvals and prerequisites above and record the environment ID, region, owners, licenses, and DLP decision.
2. In the authorized development environment, create an **unmanaged** solution with the approved publisher/prefix.
3. Create the Dataverse tables, relationships, alternate keys, field security profiles, and roles from `dataverse/table-role-mapping.md`; resolve every `[OPEN]` before adding real records.
4. Create five solution-aware flows named `ConfirmBarrier`, `SearchAvailability`, `CreateBooking`, `CreateClinicalHandoff`, and `RecordCompletion`. Use **When an agent calls the flow** and **Respond to the agent** where the flow is an agent tool. Implement the contracts in `flows/contracts.md`, including denial, conflict, timeout, idempotency, and ambiguous-success branches.
5. Create a Copilot Studio agent in the same development environment. Paste and adapt `copilot-studio/agent-instructions.md`; add only the approved flows as tools. Disable unapproved knowledge and connectors.
6. Add the v1.5 cards from `adaptive-cards/` to interactive card nodes or approved Teams “wait for a response” actions. Replace every `{{token}}` with a typed Copilot Studio/flow variable. Never publish a literal unresolved token.
7. Enforce `schemas/barrier-classification.schema.json` after the model call. Treat parse failure, additional fields, wrong route, or unknown category as `INVALID_CLASSIFICATION`; do not repair arbitrary clinical prose into an answer.
8. Run `evaluation/golden-set.json`, authorization-denial tests, prompt-injection tests, duplicate-submit tests, stale-version tests, connector-outage tests, and card rendering/submission tests in both Copilot Studio and Teams.
9. Complete `governance/dlp-entra-governance-checklist.md`. Evidence links, owners, dates, and test results are required; checkmarks without evidence are not acceptance.
10. Export the development solution using the normal Power Platform ALM process. Inspect solution contents and dependencies. Import the **managed** build into Test, bind target connection references/environment variables, and rerun all tests.
11. Only after Parkway change approval, import the same tested managed build to Production through the approved pipeline, verify monitoring/rollback, and record the deployed solution version. Until that succeeds, keep the status above unchanged.

Microsoft's solution import documentation describes imports as trusted `.zip`/`.cab` packages exported from an environment; this repository deliberately does not fabricate one: <https://learn.microsoft.com/en-us/power-apps/maker/data-platform/import-update-export-solutions>.

## Local validation

From the repository root, syntax-check all JSON files:

```powershell
Get-ChildItem -Recurse power-platform -Filter *.json | ForEach-Object {
  Get-Content -Raw -LiteralPath $_.FullName | ConvertFrom-Json | Out-Null
}
```

The classification schema is draft-07 so the repository's existing Ajv 6 dependency can validate it without changing `package.json`. The golden-set `expectedOutput` objects can be checked against the schema with a temporary Node command; see the validation handoff in the task report. Adaptive Card host behavior must still be tested in Microsoft tooling because JSON syntax validation is not a Teams/Copilot Studio rendering guarantee.

## Non-negotiable safety boundary

- The classifier returns one category and route for user confirmation; it never answers a clinical question.
- `clinical_question` always routes to `clinical_handoff`.
- Booking is never completion.
- Completion needs a separately attributable authorized source.
- Employers receive only a fixed, server-side aggregate projection; no individual barrier, booking, handoff, or completion records.
- Raw optional barrier text is transient and must not be persisted or logged.
