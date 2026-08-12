# Judge Q&A — VaxMoment

## Product and market

### What problem are you solving?

We are testing whether a corporate-health provider lacks a privacy-conscious way to resolve why employees stall between a vaccination campaign invitation and verified completion. That workflow gap is a hypothesis, not an observed customer fact yet.

### Singapore already has HealthHub and clinics. Why is this needed?

HealthHub, Healthier SG, and provider channels already support information and booking. VaxMoment does not replace them. Its proposed value is provider-side orchestration: identify a minimal non-clinical barrier, route the person into the right existing channel, preserve a human clinical boundary, and learn from aggregate campaign states.

### Who pays?

The proposed buyer is the budget owner for corporate-health campaign operations at Parkway Shenton or a comparable provider, with an employer sponsoring or distributing the campaign. This buyer and budget line are not validated; five priced interviews are a required next step.

### Is Parkway Shenton or IHH a customer or partner?

No. Parkway is the proposed operating context because its public site describes corporate health, on-site care, vaccination experience, wellness, and booking. There is no endorsement, approval, customer commitment, pilot, data access, or integration.

### What is defensible about the product?

Today, the defensible element is the operating design, not a moat: bounded barrier-to-action policy, explicit clinical handoff, separate completion provenance, and aggregate-only employer projection. A durable advantage would need to come from validated workflow integration, trusted distribution, and a growing evidence/evaluation asset. None exists yet.

### What are the main alternatives?

Do nothing; employer email/SMS/intranet; HealthHub/Healthier SG; Parkway's existing booking and support; other corporate-health providers; generic reminder platforms; and manual concierge follow-up. VaxMoment must beat the current workflow, not a fictional absence of services.

## Evidence and impact

### What evidence shows the problem is important?

NPHS 2024 reports 28.2% of Singapore residents aged 18–74 self-reported influenza vaccination in the prior 12 months. MOH separately reported 42% uptake among residents aged 65+. These show incomplete national uptake, not workplace workflow failure or product demand.

### Why do you cite 42% and 52.6% for older residents?

They are different measures. MOH reported 42% among residents aged 65+, while NPHS reported 52.6% self-reported uptake among ages 65–74. We do not combine them; the population and measurement basis differ.

### Does personalisation increase vaccination uptake?

Not reliably. One US workplace RCT found a specific date-and-time planning prompt improved vaccination, including an adjusted effect of about 5.5 percentage points in one subgroup/outcome. Much larger US health-system trials found tailored or repeated reminders could have no substantive effect. Our claim is that barrier-specific orchestration deserves a controlled test, not that personalisation works.

### What impact has VaxMoment achieved?

None measured. Every booking, completion, handoff, and aggregate in the demo is synthetic. There is no uptake, ROI, customer, or willingness-to-pay result.

### How will you prove it works?

Run a pre-registered controlled workplace influenza pilot using the same authoritative completion source in both arms. Analyse all invited employees, report absolute completion difference and uncertainty, and publish missingness, support burden, opt-outs, handoff performance, and every safety/privacy guardrail event.

### What result would make you stop?

No observable operator problem, no lawful completion source, no buyer willing to fund a pilot, unacceptable employee distrust, a guardrail breach, or an effect below the frozen minimum worthwhile difference.

## AI and clinical safety

### Why use AI?

Only to map optional transient free text to an allowlisted barrier category for confirmation. The product works with deterministic choices today. A model is added only if a golden-set comparison proves it improves task success enough to justify its risk and cost.

### Is this an agent?

No. An autonomous agent would add authority and failure surface without earning its place. The design is a deterministic workflow with, at most, one bounded classifier.

### Can it tell an employee whether they should be vaccinated?

No. It cannot decide eligibility, suitability, vaccine choice, contraindications, diagnosis, treatment, or completion. Personal clinical questions stop at a human handoff.

### What happens when the model is wrong or unavailable?

Malformed, uncertain, or clinical output is rejected. The user sees a deterministic fallback or human route. No failure is converted into a clinical answer or successful booking/completion.

### Is the WHO BeSD framework built into the classifier?

No. BeSD supports the principle that barriers include cognitive, social, motivational, and practical drivers. VaxMoment's current categories are a simplified product taxonomy and require user and expert validation.

## Privacy and governance

### Is the employer dashboard anonymous or PDPA-compliant?

We make neither claim. The prototype demonstrates fixed aggregates and illustrative small-cell suppression. Production use needs trusted server-side authorization, anti-differencing controls, purpose and lawful-basis decisions, retention/deletion, incident response, audit, and qualified Singapore privacy/legal review.

### Can the employer see who booked or what barrier they selected?

Not through the proposed employer contract. The employer receives approved aggregates only. Production enforcement must occur at the server/data boundary, not only in the user interface.

### What data do you collect?

The public demo uses only synthetic browser-local data. A pilot would define a minimum-field contract. Raw optional barrier text should be transient and not logged; clinical information should remain with the accountable clinical service.

### Why is booking not completion?

Because an appointment can be cancelled, missed, duplicated, or completed elsewhere. Completion needs a separately attributable, authoritative event with correction and unknown-state rules.

## Microsoft and implementation

### Is this built on Microsoft technology?

The current public demo is a static React/TypeScript prototype with deterministic adapters. It has no live Entra, Dataverse, Copilot Studio, Microsoft Graph Bookings, or Application Insights integration.

### Then why present a Microsoft architecture?

Microsoft provides plausible production candidates: Entra for identity, Dataverse for governed records, Copilot Studio for a bounded classifier, Graph Bookings for shared-booking integration, and Application Insights for sanitised telemetry. Official documentation establishes product capabilities only; tenant, licence, policy, permission, cost, and workflow fit require admin discovery.

### Why not build the integration now?

The highest risks are problem validity, buyer demand, completion-data access, employee trust, and governance. Integration before those facts would amplify speculation. The next build is a synthetic adapter spike only after discovery identifies a real contract.

### What will you build first after the competition?

Nothing production-facing. First: two operator workflow observations, five buyer interviews, 5–8 employee sessions, a clinical-handoff interview, and a ten-record synthetic data-contract workshop. Only passing evidence gates unlocks a pilot build.

## Commercial and execution

### What is the business model?

A fixed-scope paid discovery/pilot, followed by a campaign fee or annual provider platform fee if measured value is proven. Price, sales cycle, budget line, service cost, and margin are open; no ROI claim is made.

### What is the fastest path to market?

Sell through a corporate-health provider's existing employer relationships rather than acquire employees directly. Start with one provider, one employer, and one influenza campaign. This distribution thesis is unvalidated.

### What is your biggest risk?

The provider may not have the problem. Existing booking, support, and reporting tools may already be sufficient. That can be discovered in the first two workflow interviews, before production engineering.

### What are you asking from the organisers?

Access to the right validators: one campaign operator, clinical handoff owner, privacy/data/system owner, employer buyer, and Microsoft tenant administrator. We are asking to earn a controlled pilot, not to skip directly into deployment.

### What should judges believe after the demo?

Believe that the team has built an inspectable, safety-bounded prototype and a credible plan to test a narrow workflow hypothesis. Do not believe that effectiveness, customer demand, production compliance, or integration has already been proven.
