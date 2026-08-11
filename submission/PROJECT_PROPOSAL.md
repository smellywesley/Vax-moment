# VaxMoment project proposal

**Team:** VaxMoment

**Contact:** [github.com/smellywesley/Vax-moment](https://github.com/smellywesley/Vax-moment)

**One-line pitch:** VaxMoment helps a corporate-health provider turn an employee's self-described vaccination barrier into one safe next action, while clinical questions stay with humans and employers see only approved aggregates.

**Track:** Hack4Health 2026, Non-Technical Track
**Stage:** public product demonstration; customer validation and production integration have not begun
**Public demo:** [vax-moment.vercel.app](https://vax-moment.vercel.app/) · [GitHub Pages mirror](https://smellywesley.github.io/Vax-moment/)

## 1. Problem

Singapore already has vaccination information, subsidies, clinics, and booking routes. The unresolved hypothesis is narrower: in a workplace campaign, some employees stall between invitation and verified completion, while the provider may not have a privacy-conscious way to learn the actionable barrier, route the next step, and measure the result.

The public-health context is real. In 2024, 28.2% of Singapore residents aged 18–74 self-reported influenza vaccination in the prior 12 months ([NPHS 2024](https://www.hpb.gov.sg/docs/default-source/pdf/nphs-2024-survey-report.pdf)). MOH separately reported 42% uptake among residents aged 65+ ([MOH parliamentary answer](https://www.moh.gov.sg/newsroom/take-up-and-subsidy-rates-for-vaccines-listed-in-national-adult-immunisation-schedule/)). Neither figure is a workplace-campaign baseline, and neither proves VaxMoment's proposed cause of non-completion.

## 2. Users and buyer

| Stakeholder | Job to be done | Value proposed | Status |
|---|---|---|---|
| Employee invited to a workplace flu campaign | Resolve a practical or informational barrier without disclosing unnecessary health details | One clear non-clinical next action or accountable human handoff | To Validate |
| Corporate-health campaign operator | See and resolve permitted stalled states | Governed queues, handoffs, booking state, and completion provenance | To Validate |
| Employer programme sponsor | Understand campaign progress without seeing individual barriers or health records | Fixed aggregate report with suppression controls | To Validate |
| Proposed buyer: corporate-health campaign budget owner | Improve campaign operations and measurable completion | Fixed-scope sponsored pilot, then campaign/platform fee if validated | To Validate |

Parkway Shenton is the proposed provider context because it publicly offers corporate health, on-site care, vaccination experience, employee wellness, and multi-channel booking ([Parkway Shenton Corporate Health Services](https://www.parkwayshenton.com.sg/corporate-services/corporate-health-services)). It is part of IHH Healthcare Singapore's network, which also includes managed-care and employee-benefits capabilities ([IHH Singapore](https://www.ihhhealthcare.com/sg)). This is ecosystem relevance, not endorsement or customer evidence.

## 3. Unique wedge

VaxMoment is not another reminder, vaccine-information chatbot, booking marketplace, or clinical decision tool. Its narrow wedge is the governed layer between **campaign invitation** and **authoritative completion**:

1. ask for a minimal, self-described barrier;
2. map it to one allowlisted, non-clinical next action;
3. use existing booking or provider channels rather than replace them;
4. stop personal clinical questions at a human handoff;
5. keep booking separate from completion; and
6. expose only a fixed aggregate projection to the employer.

This wedge must beat the existing email + booking + manual-support workflow. If operator interviews show that the current workflow already closes this loop efficiently, the product should be redesigned or stopped.

## 4. Evidence and its limits

- WHO's BeSD framework separates thinking and feeling, social processes, motivation, and practical issues; it warns that practical barriers can drive low uptake ([WHO guidance](https://www.who.int/teams/immunization-vaccines-and-biologicals/essential-programme-on-immunization/demand)). VaxMoment's categories are a simplified product taxonomy, not a validated assessment.
- A US workplace RCT found a date-and-time planning prompt improved vaccination by 4.2 percentage points in the full sample; an adjusted any-location outcome in a PPO subsample was about +5.5 points ([Milkman et al., PNAS](https://pubmed.ncbi.nlm.nih.gov/21670283/)). This does not generalise automatically to Singapore or to barrier-specific routing.
- Large US trials found tailored portal messages or portal/text reminders could produce no substantive improvement ([196,486-patient trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC8858355/); [262,085-patient trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC10949147/)). The product therefore makes no “personalisation increases uptake” claim.
- HealthHub and Healthier SG already provide vaccination booking routes ([HealthHub](https://support.healthhub.sg/hc/en-us/articles/52607825421465-How-do-I-book-a-vaccination-appointment-What-adult-vaccines-are-available-at-polyclinics)). The product must complement trusted channels, not pretend they are absent.

**Current evidence verdict:** plausible intervention logic; zero VaxMoment outcome, customer, or willingness-to-pay evidence.

## 5. Solution demonstrated

The public prototype shows three connected experiences over one governed workflow:

- **Employee:** chooses a barrier, sees the privacy boundary, receives one non-clinical action, books a seeded slot, or receives a visible human-handoff receipt.
- **Operator:** sees permitted campaign states and appends a distinct operator-attested demo completion event.
- **Employer:** receives only illustrative aggregates; cohorts below the demo threshold are suppressed.

All people, events, bookings, completions, and aggregates are synthetic. No live message is sent and no real system is connected.

## 6. AI role

AI has one proposed, bounded job: classify optional transient free text into an allowlisted barrier category for the employee to confirm. It cannot decide eligibility, suitability, vaccine choice, contraindications, diagnosis, treatment, clinical advice, or completion.

The deterministic choice flow is the baseline. A model earns production use only if it improves task success on a reviewed golden set without creating clinical-answer routes, privacy leakage, unacceptable errors, or uneconomic cost. Malformed, uncertain, or clinical content fails closed to a deterministic path or accountable human. An autonomous agent is unnecessary.

## 7. Organiser and Microsoft ecosystem fit

IHH publicly describes an innovation sandbox and real-world pilots ([IHH innovation](https://www.ihhhealthcare.com/transforming-care/innovation)); Parkway's corporate and preventive-care surface provides a credible operating context. The project translates that fit into a staged validation proposal, not a claim of access or sponsorship.

For a future Microsoft implementation, product logic remains vendor-neutral behind adapters:

| Need | Microsoft candidate | Why it fits | What remains unverified |
|---|---|---|---|
| Identity and tenant context | Microsoft Entra ID | Authenticated role/tenant boundary | Parkway tenant, app registration, conditional access |
| Governed campaign records | Dataverse | Microsoft documents role-based access ([docs](https://learn.microsoft.com/en-us/power-platform/admin/database-security)) | Data model, field/row rules, licensing, geography, retention |
| Bounded classification | Copilot Studio | Data-policy and governance controls exist ([docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-faq)) | Model quality, policies, prompts, region, cost, approval |
| Appointment integration | Microsoft Graph Bookings | API supports shared-booking businesses, services, staff, and appointments ([docs](https://learn.microsoft.com/en-us/graph/api/resources/booking-api-overview?view=graph-rest-1.0)) | Actual provider workflow, permissions, idempotency, rate limits |
| Sanitised operational telemetry | Application Insights | Candidate for monitored, correlated events | PII scrubbing, access, retention, incident operations |

The current static prototype uses deterministic browser adapters. No Microsoft integration is live.

## 8. Business model and go-to-market

**Proposed model, unvalidated:**

1. paid, fixed-scope discovery and pilot for one provider, one employer, and one influenza campaign;
2. if the pilot clears its outcome and governance thresholds, charge the provider a campaign fee or annual platform fee; and
3. let the provider distribute through existing employer relationships rather than sell employee by employee.

Pricing is deliberately open. Five buyer interviews must identify the budget owner, alternative spend, procurement path, acceptable pilot structure, and response to a real number before any revenue or ROI slide is permitted.

## 9. Pilot and evaluation

**Hypothesis:** adding VaxMoment to the existing workflow increases authoritative influenza-vaccination completion within a fixed window among all invited employees, without unacceptable privacy, clinical, support, or missing-data harm.

**Design:** randomised individual/cluster assignment where feasible, otherwise a documented contemporaneous comparison. Both arms use the same authoritative completion source and observation rules.

**Primary metric:** authoritative completion among all invited employees.
**Secondary metrics:** booking conversion, time to next action, handoff resolution, opt-out, missing completion data, operator support time, and exception volume.
**Guardrails:** zero generated clinical decisions; zero unauthorised employer access; approved handling of real personal data; frozen handoff service level; no material missingness imbalance.

The minimum worthwhile effect, maximum support burden, missingness limit, sample size, and stop rules must be set with the sponsor and statistician before enrolment. Synthetic prototype events cannot support the result.

## 10. Privacy, safety, and governance

- collect the minimum campaign state; discourage medical details in free text;
- never log raw barrier text in the proposed design;
- keep clinical questions and suitability decisions with accountable humans;
- keep booking, attendance, and authoritative completion as separate events;
- enforce provider/operator and employer access at a trusted server boundary;
- give the employer fixed aggregates only, with suppression and anti-differencing controls;
- define purpose, notice, lawful basis, consent where required, retention, correction, deletion/export, incident response, and audit ownership before real data; and
- obtain qualified Singapore privacy, legal, security, and clinical review.

The prototype demonstrates intended boundaries. It does not claim PDPA compliance, anonymity, medical-device status, or production security.

## 11. Implementation path

| Phase | Work | Exit criterion |
|---|---|---|
| 0. Discovery | Observe two operator workflows; interview five buyers and 5–8 employees; run clinical, privacy, data, and Microsoft-admin workshops | One named problem owner, viable data contract, acceptable trust signal, and pilot intent |
| 1. Concierge test | Run the workflow manually with synthetic cases; test exception, correction, clinical handoff, and aggregate projection | Measured handling time and no unresolved safety/privacy blocker |
| 2. Pilot build | Trusted server, identity/authZ, minimum data model, approved booking/completion adapters, audit, monitoring, and deterministic baseline | Contract, denial, outage, privacy, and rollback tests pass |
| 3. Controlled pilot | Pre-register, recruit, operate, and analyse with identical outcome ascertainment | Effect and guardrails meet frozen go/no-go thresholds |
| 4. Scale decision | Price and integration based on measured value and cost | Named renewal/expansion decision; otherwise stop or redesign |

## 12. Top risks

| Risk | Earliest detection | Cheapest mitigation |
|---|---|---|
| No observable operator problem | First two workflow interviews | Stop before integration work |
| No lawful authoritative completion source | Data-contract workshop | Redesign outcome or stop pilot |
| Employees distrust barrier disclosure | Moderated sessions | Reduce fields, strengthen copy, or use no free text |
| Generic messaging is already sufficient | Baseline analysis / pilot | Test incremental value; remove decorative personalisation |
| Clinical question crosses software boundary | Golden-set and adversarial test | Fail closed and human-gate |
| Employer can infer individual health data | Projection threat model | Server-side fixed queries, suppression, query controls |
| Microsoft tenant or Bookings mismatch | Admin spike with synthetic data | Keep vendor-neutral ports or choose approved alternatives |
| No buyer will pay | Five priced interviews | Stop commercial build or change buyer/problem |

## 13. Ask

We are asking for a **sponsored validation partnership**, not a production rollout:

1. one corporate-health operator and one clinical handoff owner;
2. one privacy/data/system owner for a ten-record synthetic data-contract workshop;
3. one employer buyer willing to review a fixed-scope pilot and real price;
4. one Microsoft tenant administrator for licensing, data-policy, identity, Dataverse, and Bookings discovery; and
5. permission to design a pre-registered controlled pilot only if the discovery gates pass.

**Success for the next 30 days is evidence, not code:** observe the workflow, name the buyer, prove or kill the data path, and decide whether a pilot deserves to exist.
