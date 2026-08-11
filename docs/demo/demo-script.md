# VaxMoment three-minute demo script

**Audience:** Demo Day judges
**Version date:** 10 August 2026  
**Target duration:** 150–165 seconds  
**Single takeaway:** VaxMoment demonstrates a governed path from a self-described barrier to a non-clinical next action, a separate operator-attested completion event, and an aggregate-only employer demonstration with illustrative small-cell suppression.

## Opening disclosure — 0:00–0:15

**Action:** Open the employee start screen and point to the persistent demo banner.  
**Say:** “This is a public product demonstration using example people and outcomes. It has no live Microsoft or Parkway integration, does not give clinical advice, and does not claim measured uptake or return on investment.”

## Checkpoint 1: employee context — 0:15–0:30

**Action:** Select the convenience scenario.  
**Show:** The privacy warning and barrier choices.  
**Say:** “An employee can choose a barrier without entering personal or medical details. Optional text is transient and any classification is visibly simulated.”

## Checkpoint 2: governed next action — 0:30–0:50

**Action:** Confirm the convenience barrier.  
**Show:** One plain-language, non-clinical action.  
**Say:** “A deterministic policy maps an allowlisted category to a scheduling action. The product does not decide eligibility, vaccine choice, suitability, or contraindications.”

## Checkpoint 3: booking — 0:50–1:10

**Action:** Select a seeded appointment slot.  
**Show:** The receipt marked “Booked—not completed” and the demo booking reference.
**Say:** “The booking adapter is deterministic and browser-only. Booking remains separate from vaccination completion.”

## Checkpoint 4: Parkway operator — 1:10–1:35

**Action:** Keep the booked convenience scenario and switch the demo identity to Parkway Operator.  
**Show:** The completion checkpoint. Record the operator-attested demo event.
**Say:** “Booking cannot silently become completion. The operator appends a separate event labelled operator-attested and not verified to the same event timeline.”

## Checkpoint 5: employer boundary — 1:35–2:00

**Action:** Switch to Employer while the convenience cohort remains active.  
**Show:** No more than three aggregate metrics.  
**Say:** “The employer feature receives a fixed aggregate projection, not employee records. This demonstrates intended application behavior; public bundle data is inspectable, so production confidentiality still requires a trusted server boundary.”

## Checkpoint 6: clinical boundary — 2:00–2:30

**Action:** Switch to Employee, select the clinical-question scenario, and request human information.  
**Show:** The `Not submitted` handoff receipt and 995 emergency guidance.
**Say:** “The classifier never answers a personal clinical question. Arbitrary free text fails closed here. No message was sent, nobody is monitoring it, and a real service would need an agreed owner and response expectation.”

## Checkpoint 7: evidence and replay — 2:30–2:45

**Action:** Switch to Employer to show small-cohort suppression, open evidence disclosure, then use Reset.  
**Show:** The suppressed cohort, Verified, Demo-generated, Assumed, and To Validate labels, and a deterministic reset.
**Say:** “Every consequential claim carries a status. Primary sources support narrow ecosystem facts; product effect, buyer demand, and tenant fit remain to validate. Reset recreates the same walkthrough without external services.”

## Close — 2:45–3:00

**Say:** “This product demonstration proves the workflow and governance boundaries, not the clinical or commercial outcome. The next step is a data-contract workshop and a pre-registered sponsored pilot.”

## Pre-flight checklist

- Open the public URL in a clean browser session and confirm assets load under `/Vax-moment/`.
- Confirm the banner says “Safe demonstration environment” and “No real bookings or health records.”
- Run reset and complete all seven checkpoints once.
- Confirm the convenience booking says “Booked—not completed.”
- Confirm the clinical receipt states no message was sent or monitored.
- Confirm the operator completion is labelled “operator-attested” and “Demo.”
- Confirm a cohort of nine is suppressed and no hidden count appears in the employer view.
- Confirm evidence links open and show checked/source dates.
- Test keyboard navigation and a narrow mobile viewport.
- Keep a local screen recording and screenshots available if the network fails.

## Failure contingencies

| Failure | Recovery | Honest narration |
|---|---|---|
| External network unavailable after load | Continue with the loaded static app and deterministic adapters. | “The demo runtime intentionally has no external service dependency.” |
| Cold-load network failure | Use the local recording; do not claim offline cold reload. | “The hosted artifact needs the network for its initial static assets.” |
| Simulated classifier fails | Use the visible deterministic fallback. | “Fallback is active and visibly labelled.” |
| Seeded booking fails | Show alternative-channel state or reset. | “No live Bookings request was attempted.” |
| State becomes inconsistent | Use the one-action deterministic reset. | “The demo replaces its browser snapshot; production persistence would use a governed server boundary.” |

## Hostile Q&A

**“Is Parkway using this?”**  
No. Parkway Shenton is the proposed buyer/operator context based on its public corporate-health services. There is no endorsement, approval, pilot, or integration.

**“Is this built on Microsoft?”**  
The demo runtime is a static React application with replaceable business-semantic ports. Entra, Dataverse, Copilot Studio, Bookings, and Application Insights are documented future adapter candidates pending tenant and licensing discovery.

**“Does the AI know who should get vaccinated?”**  
No. The bounded classifier may only suggest an allowlisted barrier category for confirmation. It cannot decide eligibility, suitability, vaccine choice, clinical advice, or completion.

**“Is employer reporting anonymous or PDPA-compliant?”**  
No such claim is made. The app demonstrates an aggregate-only query and small-cell suppression. Production use requires server-side authorization, anti-differencing, retention/deletion controls, and qualified privacy review.

**“Did this improve uptake?”**  
Not yet known. All walkthrough outcomes are demo-generated. The proposed pilot has a pre-registered authoritative-completion endpoint and guardrails.
