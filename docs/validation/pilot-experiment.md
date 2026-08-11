<a id="pilot-plan"></a>

# VaxMoment pilot experiment

**Status:** To Validate  
**Version date:** 10 August 2026  
**Purpose:** test whether a barrier-specific workflow changes authoritative completion without unacceptable safety, privacy, or support costs.

This document is a pre-registration outline, not a completed protocol, ethics approval, privacy assessment, or clinical sign-off. A qualified human team must approve the final protocol before any real person or health-related data enters the system.

## Falsifiable hypothesis

Among all employees invited to one workplace influenza campaign, assignment to the VaxMoment journey produces a higher rate of authoritative completion within the fixed observation window than the existing reminder-and-booking workflow, using identical outcome ascertainment in both arms.

The hypothesis is unverified. Synthetic prototype events cannot support it.

## Population and allocation

- Population: all employees invited to one pre-specified employer campaign.
- Denominator: all invited employees. Do not infer clinical eligibility. A different denominator may be used only if an externally supplied, clinician-authorized eligibility definition is frozen before enrolment.
- Allocation: randomized individual or cluster assignment where operationally and ethically acceptable; otherwise use a contemporaneous comparison with documented confounders.
- Arms: existing workflow versus existing workflow plus VaxMoment.
- Observation window: freeze before enrolment based on campaign timing and completion-feed latency.
- Exclusions: freeze before enrolment; report every exclusion count and reason by arm.

## Outcomes

### Primary outcome

Authoritative vaccination completion by the end of the observation window among all invited employees. The source system, verification state, event timestamp, received timestamp, correction rules, and responsible owner must be recorded before launch.

Operator attestation is not authoritative completion unless the approved pilot protocol explicitly establishes its lawful provenance and verification process. In the public prototype it remains **Synthetic**.

### Secondary outcomes

- booking conversion among all invited employees;
- time from invitation to next recorded action;
- human-handoff resolution within the agreed service level;
- opt-out rate;
- missing completion-data rate; and
- operator support time and exception volume.

### Guardrails

- any generated clinical recommendation or suitability decision;
- privacy or employer-access incident;
- real personal/medical content recorded outside approved fields;
- unresolved clinical handoff beyond the agreed service level;
- material imbalance in outcome missingness between arms; and
- participant trust or abandonment worse than the existing workflow.

## Analysis rules

1. Analyse the primary outcome using the pre-specified invitation denominator.
2. Report each arm's absolute rate, absolute difference, uncertainty interval, denominator, and missingness.
3. Use the same outcome source and observation rules in both arms.
4. Separate booking from completion and unknown completion from non-completion.
5. Report support burden and every safety/privacy guardrail event alongside participation results.
6. Do not describe an uncontrolled before/after comparison as causal.
7. Do not calculate or present return on investment until actual costs and buyer-approved value inputs exist.

## Decision thresholds to freeze before launch

The sponsor, statistician, operational owner, privacy owner, and clinical reviewer must enter numbers before enrolment:

| Decision | Pre-registered threshold |
|---|---|
| Minimum worthwhile absolute completion difference | [OPEN] |
| Maximum acceptable support minutes per invited employee | [OPEN] |
| Maximum acceptable missing completion-data rate | [OPEN] |
| Maximum acceptable handoff service-level breach | [OPEN] |
| Privacy or unauthorized employer access | Zero tolerance; pause and investigate |
| Generated clinical answer or eligibility decision | Zero tolerance; pause and investigate |

Leaving effect and burden thresholds open after seeing results invalidates the decision rule.

## Cheapest experiments before the pilot

1. Data-contract workshop: ten synthetic records, each system owner present, with a signed minimum-field and correction-flow decision.
2. Operator concierge test: run the proposed workflow manually for synthetic cases and measure handling time and edge cases.
3. Five buyer interviews: present the fixed-fee pilot scope and ask who owns budget and procurement.
4. Moderated employee usability test: measure completion, disclosure, trust, and abandonment with no real health details retained.
5. Golden-set classifier test: deterministic baseline versus any future model, with zero clinical-answer routes permitted.

## Stop conditions

Do not start, or pause an active pilot, if:

- there is no lawful, authoritative, same-method completion source for both arms;
- the employer can receive individual barrier, booking, handoff, or completion records through the product;
- clinical questions cannot reach an accountable human service with a defined response expectation;
- the workflow requires the model to infer eligibility, suitability, or completion; or
- governance owners have not approved purpose, retention, deletion, incident handling, and participant communications.

