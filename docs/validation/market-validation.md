# VaxMoment market validation brief

**Checked:** 11 August 2026
**Decision supported:** whether to seek a sponsored workplace-influenza discovery and pilot
**Current verdict:** validate first. The problem space and ecosystem fit are credible; the specific stalled-workflow problem, buyer demand, data access, and product effect are not yet validated.

## Claim status key

| Status | Meaning |
|---|---|
| Verified | The narrow statement is supported by a linked source. |
| Demo-generated | Created by the competition prototype; not observed performance. |
| Assumed | A planning input without confirming evidence. |
| To Validate | A falsifiable hypothesis with a named validation step. |

## What is verified, and what it does not prove

| Claim | Status | Evidence and boundary |
|---|---|---|
| In 2024, 28.2% of Singapore residents aged 18–74 self-reported an influenza vaccination in the prior 12 months. | Verified, population survey | The [National Population Health Survey 2024](https://www.hpb.gov.sg/docs/default-source/pdf/nphs-2024-survey-report.pdf) reports 28.2% overall and 52.6% among ages 65–74. This is a national resident estimate, not a workplace-campaign baseline. |
| MOH separately reported 42% influenza uptake among residents aged 65+ in 2024. | Verified, different measure/population | MOH's [27 February 2025 parliamentary answer](https://www.moh.gov.sg/newsroom/take-up-and-subsidy-rates-for-vaccines-listed-in-national-adult-immunisation-schedule/) reports an increase from 18% in 2020 to 42% in 2024. Do not merge this figure with the NPHS 52.6% estimate: the age band and measurement basis differ. |
| Singapore residents already have digital and clinic routes to vaccination. | Verified | HealthHub states that vaccination appointments can be booked through HealthHub, and Healthier SG enrollees should book nationally recommended vaccination with their enrolled clinic ([HealthHub booking FAQ](https://support.healthhub.sg/hc/en-us/articles/52607825421465-How-do-I-book-a-vaccination-appointment-What-adult-vaccines-are-available-at-polyclinics)). The [Healthier SG page](https://www.healthhub.sg/programmes/hsg) also describes direct booking of recommended screening and vaccination appointments with the enrolled clinic. VaxMoment therefore cannot claim that booking access does not exist. |
| Parkway Shenton has a plausible operating surface for employer vaccination campaigns. | Verified, capability only | Parkway Shenton describes corporate health, designated workplace doctors with vaccination experience, on-site services, employee wellness, and bookings through phone, app, website, or email ([Corporate Health Services](https://www.parkwayshenton.com.sg/corporate-services/corporate-health-services)). This does not show an unmet workflow need, endorsement, data availability, or willingness to buy VaxMoment. |
| Parkway Shenton sits within an integrated IHH Singapore network that includes managed care and employee benefits. | Verified, organisational context | [IHH Healthcare Singapore](https://www.ihhhealthcare.com/sg) identifies Parkway Shenton and iXchange, its managed-care and employee-benefits arm, within its Singapore network. This strengthens ecosystem relevance, not customer validation. |
| IHH publicly supports structured innovation and real-world piloting. | Verified, broad context | IHH describes an Innovation Sandbox and supported pilots in its [innovation overview](https://www.ihhhealthcare.com/transforming-care/innovation). This makes a staged validation proposal legible within the ecosystem, but it does not mean VaxMoment has access to the programme or will be selected. |
| A specific planning prompt can change workplace influenza vaccination behaviour. | Verified external precedent, limited generalisability | In a US-firm field RCT, a date-and-time implementation-intention prompt increased the full-sample vaccination rate by 4.2 percentage points over a 33.1% control rate; in a PPO subsample, the regression-adjusted effect on vaccination at any location was about 5.5 percentage points ([Milkman et al., PNAS, 2011](https://pubmed.ncbi.nlm.nih.gov/21670283/)). This is not evidence that barrier classification, a Singapore workforce, or VaxMoment will produce the same effect. |
| More messaging or personalisation is not reliably better. | Verified external counter-evidence | A 196,486-patient US health-system RCT found no substantive vaccination-rate improvement from portal messages tailored by age/diabetes and behavioural framing ([Szilagyi et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC8858355/)). A later 262,085-patient RCT found neither portal nor text reminders raised overall influenza vaccination rates ([JAMA Network Open trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC10949147/)). These results reject a generic “personalised reminders work” claim. |
| Vaccination barriers span more than confidence. | Verified framework | WHO's Behavioural and Social Drivers framework groups drivers into thinking and feeling, social processes, motivation, and practical issues; WHO notes that practical issues can be the cause of low uptake ([WHO demand guidance](https://www.who.int/teams/immunization-vaccines-and-biologicals/essential-programme-on-immunization/demand); [BeSD influenza guide](https://iris.who.int/bitstream/handle/10665/382234/9789240106369-eng.pdf?sequence=1)). VaxMoment's current categories are a product simplification, not a validated clinical or behavioural instrument. |

## Interpretation

The honest opportunity is not “Singapore lacks vaccination information or booking.” Those channels exist. The proposed gap is narrower: after an employer campaign invite, a provider may lack a privacy-conscious way to learn why an employee stalled, route that person to one non-clinical next action, preserve clinical questions for humans, and measure authoritative completion without exposing individual health information to the employer.

That gap is **assumed** until an operator demonstrates it in the current workflow. The research supports testing tailored barrier-to-action orchestration; it does not validate the product, the workplace setting, the buyer, or an expected uplift.

## Competitive alternatives matrix

| Alternative | What it already does well | Why a buyer may prefer it | Proposed VaxMoment wedge | Evidence still needed |
|---|---|---|---|---|
| Do nothing / rely on voluntary action | Zero new cost or integration | Campaign may be “good enough”; no procurement or privacy change | Make stalled states observable and actionable | Prove the problem is costly enough to act on |
| Employer email, intranet, SMS, calendar invite | Familiar, cheap, scalable | Already owned by HR/comms | Route a self-described barrier to one next action instead of repeating the same reminder | Compare against existing workflow, not against silence |
| HealthHub / Healthier SG / enrolled clinic | Trusted national and clinical channels; booking already available | Clinical ownership, subsidies, existing resident relationship | Complement rather than replace: hand off to the correct existing channel | Confirm deep-link, referral, attribution, and completion-data rules |
| Parkway Shenton's current corporate workflow | Existing clinics, on-site care, vaccination experience, booking and support | Incumbent workflow and customer relationship | Provider-side campaign orchestration and aggregate learning across barrier, booking, handoff, and completion states | Observe operator workflow and quantify unresolved cases/support burden |
| Other corporate-health providers | Existing corporate relationships, clinics, apps, vaccination offers | Switching provider may be easier than adding software | Vendor-neutral orchestration layer, if providers actually lack one | Competitive interviews; [Fullerton](https://www.fullertonhealth.com/sg/beyond-benefits-building-a-health-first-company-culture/) and [Raffles Medical](https://www.rafflesmedicalgroup.com/corporate-employee-health-benefits/embracing-difficult-but-necessary-changes-moving-towards-preventive-health/) publicly describe corporate influenza-vaccination routes |
| Generic reminder or personalisation platform | Low marginal messaging cost and established campaign tooling | Simpler than a new workflow product | Barrier-specific action, explicit clinical handoff, completion provenance, aggregate-only employer boundary | Demonstrate incremental value; large trials show reminder/personalisation effects can be small or null |
| Manual concierge follow-up | Flexible and human | Safer for clinical nuance; no model risk | Standardise only repetitive non-clinical routing while escalating uncertainty | Measure handling time, case mix, and whether software reduces or adds work |

The market category is therefore **not a vaccine chatbot**. The proposed wedge is provider-operated conversion orchestration between campaign invitation and verified completion. If interviews show that current provider tooling already closes this loop, VaxMoment loses its right to exist unless it is materially cheaper, safer, or easier to deploy.

## Organiser ecosystem fit

| Fit signal | Assessment | Boundary |
|---|---|---|
| IHH / Parkway prevention and out-of-hospital services | Strong thematic fit | Public pages show organisational capabilities, not sponsorship or demand for this product. |
| Corporate-health buyer and employer-distribution context | Plausible | Parkway publicly serves employers; the exact buyer, budget, workflow owner, and procurement path remain unknown. |
| IHH innovation and pilot orientation | Plausible | IHH publicly describes an Innovation Sandbox and real-world pilots; VaxMoment has no confirmed access. |
| Microsoft ecosystem | Architecturally plausible | Microsoft documents [Dataverse role-based security](https://learn.microsoft.com/en-us/power-platform/admin/database-security), the [Graph Bookings API for shared bookings](https://learn.microsoft.com/en-us/graph/api/resources/booking-api-overview?view=graph-rest-1.0), and [Copilot Studio governance controls](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-faq). Tenant, licensing, data policy, permissions, and product fit are unverified. |
| Non-technical-track prototype | Fit based on supplied competition brief | The organiser-provided brief in project materials permits prototype/mockup/no-code demonstration. No current public rules URL was found in this research pass; re-check the official submission portal before submission. |

## Proposed user and buyer, not yet validated

- **Employee user:** a person invited to a workplace influenza campaign who has not yet completed the next action.
- **Operator user:** a corporate-health campaign operator handling bookings, exceptions, and human handoffs.
- **Proposed buyer:** the budget owner for corporate-health campaign operations at Parkway Shenton or a comparable provider.
- **Employer stakeholder:** sponsors or distributes the campaign and receives only approved aggregates.
- **Clinical owner:** an accountable human service that handles personal medical questions and suitability decisions.

This is a proposed B2B2C configuration. There is no evidence that Parkway Shenton, IHH Healthcare, Microsoft, or any employer has approved, endorsed, purchased, piloted, or integrated VaxMoment.

## Existing workflow to verify in interviews

The current workflow is not yet observed. Treat this sequence as an interview hypothesis:

1. Employer and provider define population, channel, campaign window, locations, capacity, and governance.
2. Employees receive a campaign communication and choose whether to act.
3. Booking proceeds through an existing provider or national channel.
4. People with practical, informational, cost/access, or personal clinical concerns use existing support or drop out.
5. The provider resolves bookings and clinical handoffs.
6. Completion is reconciled if a lawful, authoritative source exists.
7. The employer receives an approved aggregate campaign summary.

For each step, capture owner, system of record, volume, median handling time, error/exception rate, service level, lawful data flow, and current workaround.

## Load-bearing assumptions and experiments

| # | Assumption | Load-bearing? | Cheapest test | Kill or redesign signal |
|---|---|---|---|---|
| 1 | Operators can identify a meaningful stalled-workflow problem they can act on. | Yes | Two observed workflow interviews using real screens and de-identified counts | No observable stall state or no permissible operator action |
| 2 | A lawful authoritative completion signal can be obtained for both comparison arms. | Yes | Data-contract workshop using ten synthetic records | No timely signal without excessive health-data exposure |
| 3 | A buyer owns budget for a fixed-scope pilot. | Yes | Five buyer interviews with a priced structure; price field may remain open only for interview 1 | No owner accepts the problem, procurement path, or any credible price anchor |
| 4 | Employees will use the barrier route without unacceptable privacy concern. | Yes | Five to eight moderated prototype sessions with two privacy-copy variants | Persistent distrust, material health details entered, or high abandonment |
| 5 | Barrier-specific routing outperforms the existing workflow. | Yes | Pre-registered controlled pilot with authoritative completion | Effect below frozen minimum worthwhile difference or guardrail breach |
| 6 | The deterministic baseline needs an AI classifier. | No for pilot | Golden-set comparison: deterministic choices vs bounded free-text classifier | Model fails to improve task success while adding risk/cost |
| 7 | Microsoft services fit the tenant and operating model. | No for discovery; yes for Microsoft deployment | Admin discovery and one synthetic end-to-end spike | Required services unavailable, disallowed, or uneconomic |

## Go / no-go gate

Proceed to pilot contracting only when all are true:

- a named buyer owns a budget and accepts a fixed-scope pilot in principle;
- the current workflow and failure point have been observed;
- an authoritative completion source, lawful purpose, access boundary, correction process, retention owner, and deletion path are documented;
- employee sessions pass pre-set trust, disclosure, safety, and abandonment thresholds;
- the clinical handoff has an accountable owner and response expectation;
- the Microsoft tenant, licensing, security, and integration fit has been checked if Microsoft services are in scope; and
- the pilot effect, burden, missing-data, and stop thresholds are frozen before enrolment.

Until then, VaxMoment is submission-ready as an evidence-labelled prototype, not customer-validated or pilot-ready.

## Research gaps as of 11 August 2026

1. No direct Parkway/IHH operator, buyer, employer, employee, clinical, privacy, or Microsoft-admin interview is logged.
2. No current-state workflow observation, volume, support-time, or campaign conversion baseline is available.
3. No price, budget line, willingness-to-pay response, procurement path, or signed pilot intent exists.
4. No authoritative completion-data contract or privacy/legal approval exists.
5. No Singapore workplace trial validates VaxMoment's barrier categories or expected effect.
6. No official public Hack4Health 2026 submission/rubric URL was located in this research pass; the supplied organiser brief must be re-checked at submission time.
