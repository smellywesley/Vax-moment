# VaxMoment market validation brief

**Checked:** 10 August 2026  
**Decision supported:** whether to seek a sponsored workplace-influenza pilot  
**Current verdict:** validate first; the ecosystem fit is plausible, but buyer demand and outcome-data access are unproven.

## Claim status key

| Status | Meaning |
|---|---|
| Verified | The narrow statement is supported by a linked primary source. |
| Synthetic | Created for the competition walkthrough; not observed performance. |
| Assumed | A planning input without confirming evidence. |
| To Validate | A falsifiable hypothesis with a named validation step. |

## What the evidence supports

| Claim | Status | Evidence and boundary |
|---|---|---|
| Singapore has an established adult-vaccination schedule and subsidy pathways. | Verified | The [Ministry of Health subsidy page, updated 9 April 2026](https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/subsidies-for-national-adult-immunisation-schedule-%28nais%29-vaccines-administered-at-public-healthcare-settings/) describes subsidies for eligible Singapore citizens and permanent residents at public healthcare institutions. VaxMoment does not decide individual eligibility or entitlement. |
| Adult vaccination is incomplete in at least one reported population. | Verified, narrow population | In a [27 February 2025 parliamentary answer](https://www.moh.gov.sg/newsroom/take-up-and-subsidy-rates-for-vaccines-listed-in-national-adult-immunisation-schedule/), MOH reported influenza uptake among residents aged 65 and above rising from 18% in 2020 to 42% in 2024. This is not a workplace-campaign baseline and does not prove demand for this product. |
| Parkway Shenton publicly offers corporate, on-site, vaccination, wellness, and booking services. | Verified | Parkway Shenton's [Corporate Health Services page](https://www.parkwayshenton.com.sg/corporate-services/corporate-health-services), accessed 10 August 2026, describes those services. It does not establish endorsement, a partnership, a workflow need, or completion-data availability. |
| A barrier-specific journey increases vaccination completion. | To Validate | No pilot result exists. Test through the controlled experiment in [pilot-experiment.md](./pilot-experiment.md). |
| Parkway operators can lawfully and reliably obtain an authoritative completion signal for the pilot. | To Validate | Run a data-contract workshop with the operational, clinical, privacy, and system owners before recruiting participants. |
| An employer buyer will sponsor aggregate campaign-learning software. | To Validate | Conduct five buyer interviews and present a priced, time-bounded pilot offer. |
| Employees will disclose a useful barrier after seeing the prototype privacy explanation. | To Validate | Run moderated prototype sessions with at least two privacy-copy variants; record disclosure rate, abandonment, and trust concerns. |

## Narrow buyer narrative

The proposed buyer is the budget owner for corporate health campaign operations at Parkway Shenton. The user is a Parkway campaign operator who follows stalled bookings and human handoffs. The sponsor's customer is an employer that receives a fixed aggregate view, while the employee receives a non-clinical next action and a human route for personal medical questions.

This is a proposed commercial configuration, not evidence that Parkway Shenton has approved, endorsed, purchased, piloted, or integrated VaxMoment.

## Existing workflow to verify in interviews

The current workflow is not yet observed. The following is an interview guide, not a fact:

1. An employer and corporate-health provider agree a campaign population, channel, dates, sites, and appointment capacity.
2. Employees receive campaign information and decide whether to act.
3. Employees with convenience, information, cost/access, or personal clinical questions use existing channels or do nothing.
4. The provider manages booking and any human follow-up.
5. Completion information is reconciled if a lawful, authoritative source exists.
6. The employer receives an approved campaign summary.

For each step, ask who performs it, which system holds the source of truth, the median handling time, failure volume, escalation path, and what information may legally flow to the employer.

## Interview sequence and kill signals

| Interview | Required participant | Question that matters | Evidence to capture | Kill or redesign signal |
|---|---|---|---|---|
| 1–2 | Parkway campaign operator | Where do invited employees stall, and how is that known today? | Screen-level workflow, volumes, timestamps, support burden | No observable stalled-workflow problem or no operator action available |
| 3 | Parkway data/privacy/system owner | What is the lawful completion source and minimum permitted projection? | Named system, fields, ownership, latency, retention, access decision | No timely completion signal without excessive health-data exposure |
| 4–8 | Employer benefit/HR buyers | Would a fixed-fee pilot with aggregate reporting be funded? | Budget owner, alternative spend, procurement path, price reaction | No owner accepts the problem, pilot structure, or proposed price range |
| 9–13 | Employees matching campaign context | Would they use this route and disclose a barrier after the warning? | Task completion, hesitations, abandonment, privacy concerns | Persistent avoidance or distrust across realistic copy variants |

## Competitive alternatives

The immediate alternatives are the existing reminder and booking workflow, direct clinic/provider channels, employer communications, and doing nothing. A competitor-feature table is premature until the operator workflow is observed. VaxMoment must beat the existing process on a measured operational or participation outcome; having more screens is not differentiation.

## Go/no-go evidence gate

Proceed to pilot contracting only when all are true:

- a named buyer owns a budget and accepts a priced pilot in principle;
- the current workflow and failure point have been observed, not imagined;
- an authoritative completion source, purpose, lawful basis, access boundary, and retention owner are documented;
- moderated employee sessions show acceptable disclosure and abandonment against pre-set thresholds; and
- the Microsoft tenant, licensing, security, and integration fit has been checked with administrators.

Until then, the product is competition-ready but not pilot-ready.

