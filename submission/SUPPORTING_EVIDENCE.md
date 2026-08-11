# VaxMoment supporting evidence

**Evidence cut-off:** 11 August 2026
**Rule:** each source supports only the narrow claim stated. External evidence motivates a test; it does not validate VaxMoment.

## Claim ledger

| Submission claim | Status | Best evidence | What must not be inferred |
|---|---|---|---|
| Adult influenza vaccination is measured nationally in Singapore. | Verified, national survey | [NPHS 2024](https://www.hpb.gov.sg/docs/default-source/pdf/nphs-2024-survey-report.pdf): 28.2% of residents aged 18–74 self-reported influenza vaccination in the past 12 months. | Not an estimate of unmet need among recommended groups; not a workplace baseline; not proof that lack of reminders caused non-completion. |
| Uptake among older residents has improved but is not universal. | Verified, separate MOH measure | [MOH parliamentary answer](https://www.moh.gov.sg/newsroom/take-up-and-subsidy-rates-for-vaccines-listed-in-national-adult-immunisation-schedule/): 42% uptake among residents aged 65+ in 2024. | Do not equate with NPHS's 52.6% for ages 65–74; age band and method differ. |
| Existing booking channels already exist. | Verified | [HealthHub vaccination booking FAQ](https://support.healthhub.sg/hc/en-us/articles/52607825421465-How-do-I-book-a-vaccination-appointment-What-adult-vaccines-are-available-at-polyclinics) and [Healthier SG](https://www.healthhub.sg/programmes/hsg). | VaxMoment is not the first or only route to vaccination booking. |
| Parkway has corporate, on-site, vaccination, wellness, and booking capabilities. | Verified, public capability | [Parkway Shenton Corporate Health Services](https://www.parkwayshenton.com.sg/corporate-services/corporate-health-services). | No unmet need, partnership, endorsement, data access, or willingness to pay. |
| Parkway Shenton and employee-benefits capabilities sit within IHH Singapore. | Verified, organisational context | [IHH Healthcare Singapore](https://www.ihhhealthcare.com/sg). | No shared-data permission or sales channel for VaxMoment. |
| IHH has a stated innovation and pilot orientation. | Verified, broad context | [IHH innovation overview](https://www.ihhhealthcare.com/transforming-care/innovation). | No programme acceptance or access for this team. |
| Planning prompts can affect workplace flu vaccination in one setting. | Verified external RCT | [Milkman et al., PNAS 2011](https://pubmed.ncbi.nlm.nih.gov/21670283/): date-and-time planning prompt produced +4.2 percentage points in the full sample; +5.5 points for any-location vaccination in a PPO subsample after adjustment. | No assumed effect size for Singapore, VaxMoment, barrier classification, or a different campaign design. |
| Generic or personalised reminders can fail. | Verified external RCTs | [196,486-patient personalised-message trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC8858355/) and [262,085-patient portal/text trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC10949147/). | “Personalisation” alone is not a defensible product claim. |
| Vaccination barriers span cognitive, social, motivational, and practical domains. | Verified framework | [WHO demand guidance](https://www.who.int/teams/immunization-vaccines-and-biologicals/essential-programme-on-immunization/demand) and [WHO BeSD influenza guide](https://iris.who.int/bitstream/handle/10665/382234/9789240106369-eng.pdf?sequence=1). | VaxMoment's simplified categories are not a validated BeSD instrument. |
| Dataverse can implement role-based access. | Verified product capability | [Microsoft Dataverse security roles](https://learn.microsoft.com/en-us/power-platform/admin/database-security). | No proof of Parkway tenant configuration, licensing, field security, or compliant design. |
| Microsoft Graph exposes shared-booking resources. | Verified product capability | [Microsoft Graph Bookings API](https://learn.microsoft.com/en-us/graph/api/resources/booking-api-overview?view=graph-rest-1.0). | No proof that shared Bookings matches Parkway's workflow or permissions. |
| Copilot Studio has governance and data-policy controls. | Verified product capability | [Copilot Studio security FAQ](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-faq) and [data policies](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention). | No guarantee against unsafe output; admin discovery, configuration, testing, and human governance remain required. |

## Evidence synthesis for the pitch

The national evidence supports a prevention problem worth working on, but not VaxMoment's cause-and-effect story. Singapore already has national, clinical, and provider booking channels. The product must therefore prove value in the conversion workflow after an invitation: identify an actionable non-clinical barrier, route the person to an existing trusted channel, escalate clinical questions, and help the provider measure completion without exposing individual health information to the employer.

The behavioural literature is deliberately mixed. A specific plan-making prompt improved vaccination in one US workplace experiment, including an adjusted effect of about 5.5 percentage points in one subgroup/outcome. Much larger health-system trials found tailored or repeated reminders could have no material effect. The correct claim is: **barrier-specific orchestration is a plausible hypothesis that requires a controlled Singapore workplace pilot**, not “personalised nudges increase uptake.”

## Evidence status in the prototype

- **Verified:** narrow ecosystem or external-research facts with links.
- **Demo-generated:** seeded people, bookings, completion events, handoffs, and aggregates.
- **Assumed:** proposed workflow, buyer, business model, data access, Microsoft fit, and privacy thresholds.
- **To Validate:** operator pain, employee trust, willingness to pay, authoritative completion, intervention effect, and production governance.

## Missing primary evidence

1. Observed corporate vaccination campaign workflow.
2. De-identified funnel volumes and handling-time baseline.
3. Buyer interview and price response.
4. Employee usability and privacy response.
5. Completion-system data contract and lawful-purpose decision.
6. Clinical handoff owner and service level.
7. Microsoft tenant, licence, data-policy, connector, and Bookings-fit discovery.
8. Controlled pilot outcome with pre-registered thresholds.

## Citation discipline for slides

Use a short source footer beside every quantitative claim. Keep the population and measurement in the label, for example:

> 28.2% of Singapore residents aged 18–74 self-reported a flu vaccination in the prior 12 months (NPHS 2024); not a workplace-campaign baseline.

Do not put “42% of seniors” and “52.6% of ages 65–74” on the same chart without explaining that they come from different MOH/HPB measures and populations.
