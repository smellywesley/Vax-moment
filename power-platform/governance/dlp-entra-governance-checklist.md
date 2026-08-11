# DLP, Entra, and Power Platform governance checklist

**Status:** every item is unverified unless an owner, date, and evidence link is added. Nothing here is configured, deployed, imported, tenant-tested, or Parkway-approved.

Use `[ ]` until evidence exists in the authorized tenant. A policy screenshot or export proves configuration, not that the design is legally/clinically sufficient.

## Ownership and environment

- [ ] Name the Parkway business owner, clinical owner, privacy owner, security owner, platform owner, support owner, and data steward. Evidence: `[OPEN]`
- [ ] Approve purpose, users, jurisdictions, data classes, lawful basis/consent model, records schedule, DSAR/export/deletion/correction path, and incident obligations. Evidence: `[OPEN]`
- [ ] Create separate Dev/Test/Prod environments in the approved geography; bind each to an Entra security group and inventory all admins/makers. Evidence: `[OPEN]`
- [ ] Confirm required Power Platform, Dataverse, Copilot Studio, Teams, Graph/Bookings, and premium connector licenses/capacity. Evidence: `[OPEN]`
- [ ] Decide whether Managed Environments are required and record environment routing/creation policy. Evidence: `[OPEN]`
- [ ] Prohibit real personal/health data in Dev, public demos, source control, test fixtures, and maker prompts. Evidence: `[OPEN]`

## Data policies / DLP

- [ ] Inventory every connector/action used by each flow and agent; record owner, auth method, data classes, direction, region, outage behavior, and necessity. Evidence: `[OPEN]`
- [ ] Apply a tenant/environment data policy before creation; use default-deny/advanced connector allowlisting if available and approved. Evidence: `[OPEN]`
- [ ] Put Dataverse, the approved Teams actions, and approved Microsoft Graph/custom connector actions in compatible business groups; block consumer/social/file-transfer/generative connectors not explicitly required. Evidence: `[OPEN]`
- [ ] Restrict connector actions, endpoints, and custom connectors—not just connector names. Confirm virtual/MCP connector governance separately because policy behavior differs. Evidence: `[OPEN]`
- [ ] Set the default group so newly introduced connectors do not become an unreviewed exfiltration path. Evidence: `[OPEN]`
- [ ] Test design-time and runtime policy enforcement, including a previously valid flow after policy change and the documented enforcement-latency window. Evidence: `[OPEN]`
- [ ] Review Copilot Studio knowledge sources, public website grounding, web search, generative answers, HTTP tools, email/chat tools, and file upload; disable everything outside the allowlist. Evidence: `[OPEN]`
- [ ] Confirm optional raw barrier text is transient and excluded from flow run history, transcripts, analytics, Dataverse, Application Insights, connector payload logs, and error messages. Evidence: `[OPEN]`

## Microsoft Entra identity and access

- [ ] Decide employee identity/tenant model (member, guest/B2B, external identity, or other) after a tenant-fit and channel test. Evidence: `[OPEN]`
- [ ] Define Entra groups for environment access, makers, operators, clinical workers, completion stewards, employer reporters, auditors, and admins; map them to Dataverse teams/roles. Evidence: `[OPEN]`
- [ ] Require MFA and approved Conditional Access; test target channels, embedded-flow authentication, guests/external identities, service identities, compliant device/location rules, and emergency access. Evidence: `[OPEN]`
- [ ] Use least privilege and Privileged Identity Management for administrative roles; maintain two monitored break-glass accounts under Parkway policy. Evidence: `[OPEN]`
- [ ] Disable stale accounts and interactive sign-in for application identities; define joiner/mover/leaver and access-review cadence. Evidence: `[OPEN]`
- [ ] Use separate application users/service principals for materially different integrations/blast radii. Store no client secret in solution, source, card, prompt, environment variable, or log. Evidence: `[OPEN]`
- [ ] For every Graph/Bookings permission, record delegated vs application choice, exact permission, admin consent owner, token audience, credential type/rotation, and negative test. Evidence: `[OPEN]`
- [ ] Verify the identity used by every flow connection and connector action. A user's UI role does not constrain an overprivileged owner/service connection automatically. Evidence: `[OPEN]`

## Dataverse authorization and privacy firewall

- [ ] Approve table ownership, business units/teams, security roles, field-security profiles, sharing policy, hierarchy-security decision, and cumulative-role review. Evidence: `[OPEN]`
- [ ] Deny employer identities all individual tables and expose only a fixed aggregate API with campaign scope, allowlisted dimensions, minimum-cell suppression, complementary suppression, and query-budget controls. Evidence: `[OPEN]`
- [ ] Test cross-employee, cross-campaign, cross-employer, cross-BU, export, search, relationship navigation, API, flow, and connector denial paths. Evidence: `[OPEN]`
- [ ] Enable and size Dataverse auditing for approved tables/columns/role changes; separately cover reads/exports as required because ordinary record-change auditing is not a complete read audit. Evidence: `[OPEN]`
- [ ] Approve retention and prove deletion/export/correction without corrupting completion provenance or audit obligations. Evidence: `[OPEN]`
- [ ] Document backup/restore region, cadence, owner, and tested recovery/rollback. Evidence: `[OPEN]`

## Copilot Studio and agent safety

- [ ] Install only the bounded instructions and five reviewed tool contracts; do not expose `RecordCompletion` to the employee agent. Evidence: `[OPEN]`
- [ ] Enforce the JSON Schema outside the model and reject additional fields/unknown categories/wrong routes. Evidence: `[OPEN]`
- [ ] Run the golden set plus prompt-injection, multilingual, typo, ambiguity, refusal, timeout, malformed JSON, and old-card tests; require zero clinical-answer routes. Evidence: `[OPEN]`
- [ ] Define prompt/version owner, change control, rollback, model/region choice, capacity/cost budget, and fallback behavior. Evidence: `[OPEN]`
- [ ] Confirm transcript, analytics, generative AI, and human-review retention settings against the approved data inventory. Evidence: `[OPEN]`
- [ ] Demonstrate reconstruction of model/prompt/schema/tool/result versions using sanitized metadata without raw sensitive text. Evidence: `[OPEN]`

## Adaptive Cards and confirmations

- [ ] Render all cards in Copilot Studio test chat and each production host. Teams target version is 1.5; do not rely on 1.6-only behavior. Evidence: `[OPEN]`
- [ ] Replace every `{{token}}`; validate type, length, encoding, timezone, accessibility labels, keyboard/screen-reader behavior, narrow/mobile layout, dark mode, and fallback text. Evidence: `[OPEN]`
- [ ] Use interactive card nodes or Teams actions that wait for a response; test that `Action.Submit` is accepted in the chosen hosting pattern. Evidence: `[OPEN]`
- [ ] Bind every mutation to a short-lived, single-use server confirmation token. Reject replay, duplicate submit, wrong actor, altered values, expired card, and stale record version. Evidence: `[OPEN]`
- [ ] Configure replacement/update messages after Teams submission so users do not mistake a consumed card for an active action. Evidence: `[OPEN]`

## Integrations and operations

- [ ] Complete Bookings fit test: shared business/service/staff model, permissions, timezone/DST, capacity, cancellation/reschedule, customer data behavior, rate limits, notification behavior, and outage UX. Evidence: `[OPEN]`
- [ ] Create durable booking attempt/outbox plus idempotency and reconciliation; test timeout after provider success and compensation failure. Evidence: `[OPEN]`
- [ ] Name and staff the clinical-handoff service, destination, response expectation, escalation, hours, contact fields, failure response, and resolution event. Until approved, execution fails closed. Evidence: `[OPEN]`
- [ ] Approve completion source, authority, latency, missing state, duplicate rules, corrections, reconciliation, and same-method pilot ascertainment. Booking/operator demo attestation is not automatically authoritative. Evidence: `[OPEN]`
- [ ] Define sanitized logs, metrics, alerts, runbooks, support hours, on-call owner, incident severity, kill switch, per-user/action rate limits, and cost alerts. Evidence: `[OPEN]`

## ALM and go-live

- [ ] Build inside an approved unmanaged Dev solution with publisher/prefix, connection references, environment variables, and source control. Evidence: `[OPEN]`
- [ ] Use managed artifacts for Test/Prod and an approved pipeline/service identity; no direct production maker edits. Evidence: `[OPEN]`
- [ ] Scan dependencies/solution checker/security findings; review sensitive flow definitions and role diffs by hand. Evidence: `[OPEN]`
- [ ] Complete unit/contract/integration/E2E/authorization/safety/eval/performance/outage/rollback tests in Test with synthetic data. Evidence: `[OPEN]`
- [ ] Record a change approval, privacy/security/clinical/legal sign-off, go/no-go owner, rollback point, and post-deploy verification. Evidence: `[OPEN]`
- [ ] Export/import the real solution and attach import history/version evidence. This repository pack alone never satisfies this item. Evidence: `[OPEN]`

## Official Microsoft references

- Data policies: <https://learn.microsoft.com/en-us/power-platform/admin/wp-data-loss-prevention>
- Manage data policies: <https://learn.microsoft.com/en-us/power-platform/admin/prevent-data-loss>
- Advanced connector policies: <https://learn.microsoft.com/en-us/power-platform/admin/advanced-connector-policies>
- Power Platform identity/access guidance: <https://learn.microsoft.com/en-us/power-platform/guidance/adoption/conditional-access>
- Dataverse security: <https://learn.microsoft.com/en-us/power-platform/admin/wp-security>
- Security roles/privileges: <https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges>
- Dataverse auditing: <https://learn.microsoft.com/en-us/power-platform/admin/manage-dataverse-auditing>
- Environment backup/restore: <https://learn.microsoft.com/en-us/power-platform/admin/backup-restore-environments>
- Environment variables: <https://learn.microsoft.com/en-us/power-apps/maker/data-platform/environmentvariables>
- Solution imports: <https://learn.microsoft.com/en-us/power-apps/maker/data-platform/import-update-export-solutions>
- Power Platform pipelines: <https://learn.microsoft.com/en-us/power-platform/alm/run-pipeline>
- Copilot Studio Adaptive Cards: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/adaptive-cards-overview>
- Call an agent flow: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-use-flow>
