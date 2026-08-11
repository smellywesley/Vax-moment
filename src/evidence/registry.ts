export const evidenceStatuses = [
  "Verified",
  "Synthetic",
  "Assumed",
  "To Validate",
] as const;

export type EvidenceStatus = (typeof evidenceStatuses)[number];

export type EvidenceSourceKind =
  | "government"
  | "provider"
  | "vendor-documentation"
  | "prototype";

export interface EvidenceRecord {
  readonly id: string;
  readonly claim: string;
  readonly title: string;
  readonly url: string;
  readonly publisher: string;
  /** Publication or official last-updated date in YYYY-MM-DD format. */
  readonly sourceDate: string;
  readonly lastCheckedAt: string;
  readonly status: EvidenceStatus;
  readonly sourceKind: EvidenceSourceKind;
  readonly scopeNote: string;
}

export const evidenceStatusDescriptions: Readonly<
  Record<EvidenceStatus, string>
> = {
  Verified: "Supported by the linked source for the narrow claim stated.",
  Synthetic: "Generated within the demo environment; not observed performance.",
  Assumed: "A planning input that has not yet been confirmed.",
  "To Validate": "A falsifiable claim that needs a real-world test before use as fact.",
};

export const evidenceRegistry = [
  {
    id: "moh-adult-vaccine-uptake-2025",
    claim:
      "Singapore's Ministry of Health reported that influenza vaccination uptake among residents aged 65 and above increased from 18% in 2020 to 42% in 2024.",
    title:
      "Take-up and subsidy rates for vaccines listed in National Adult Immunisation Schedule",
    url: "https://www.moh.gov.sg/newsroom/take-up-and-subsidy-rates-for-vaccines-listed-in-national-adult-immunisation-schedule/",
    publisher: "Singapore Ministry of Health",
    sourceDate: "2025-02-27",
    lastCheckedAt: "2026-08-10",
    status: "Verified",
    sourceKind: "government",
    scopeNote:
      "This is a population-level statement for residents aged 65 and above. It does not establish workplace-campaign demand or VaxMoment impact.",
  },
  {
    id: "moh-nais-subsidies-2026",
    claim:
      "Eligible Singapore citizens and permanent residents can receive subsidies for nationally recommended adult vaccinations at public healthcare institutions.",
    title:
      "Subsidies for National Adult Immunisation Schedule vaccines administered at public healthcare settings",
    url: "https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/subsidies-for-national-adult-immunisation-schedule-%28nais%29-vaccines-administered-at-public-healthcare-settings/",
    publisher: "Singapore Ministry of Health",
    sourceDate: "2026-04-09",
    lastCheckedAt: "2026-08-10",
    status: "Verified",
    sourceKind: "government",
    scopeNote:
      "Eligibility is determined by the official programme. The prototype never decides an individual's eligibility or subsidy entitlement.",
  },
  {
    id: "parkway-corporate-services",
    claim:
      "Parkway Shenton publicly describes corporate health, on-site, vaccination, employee wellness, and booking services.",
    title: "Corporate Health Services",
    url: "https://www.parkwayshenton.com.sg/corporate-services/corporate-health-services",
    publisher: "Parkway Shenton",
    sourceDate: "2026-08-10",
    lastCheckedAt: "2026-08-10",
    status: "Verified",
    sourceKind: "provider",
    scopeNote:
      "Source date records the access date because the page exposes no publication date. It confirms a public service description only; it is not endorsement, partnership, workflow validation, or a live integration.",
  },
  {
    id: "scdf-emergency-medical-services-995",
    claim:
      "Singapore Civil Defence Force directs people to call 995 for life-threatening medical emergencies.",
    title: "Emergency Medical Services",
    url: "https://www.scdf.gov.sg/home/about-scdf/emergency-medical-services",
    publisher: "Singapore Civil Defence Force",
    sourceDate: "2026-08-10",
    lastCheckedAt: "2026-08-10",
    status: "Verified",
    sourceKind: "government",
    scopeNote:
      "Source date records the access date because the page exposes no publication date. The prototype links this route only as emergency recovery guidance; it does not triage symptoms or decide whether an individual situation is an emergency.",
  },
  {
    id: "dataverse-role-security-2026",
    claim:
      "Microsoft Dataverse supports role-based access to apps, data, and environment resources.",
    title: "Role-based security roles for Microsoft Dataverse",
    url: "https://learn.microsoft.com/en-us/power-platform/admin/database-security",
    publisher: "Microsoft Learn",
    sourceDate: "2026-06-02",
    lastCheckedAt: "2026-08-10",
    status: "Verified",
    sourceKind: "vendor-documentation",
    scopeNote:
      "This supports a future adapter option. It does not prove tenant availability, configuration, licensing, or production privacy controls for Parkway.",
  },
  {
    id: "microsoft-bookings-api",
    claim:
      "Microsoft Graph exposes a Bookings API for shared-booking businesses, services, staff members, and appointments.",
    title: "Use the Microsoft Bookings API in Microsoft Graph for shared bookings",
    url: "https://learn.microsoft.com/en-us/graph/api/resources/booking-api-overview?view=graph-rest-1.0",
    publisher: "Microsoft Learn",
    sourceDate: "2024-05-23",
    lastCheckedAt: "2026-08-10",
    status: "Verified",
    sourceKind: "vendor-documentation",
    scopeNote:
      "API existence is verified. VaxMoment has no live Bookings connection; permissions, tenant fit, rate limits, and failure behavior require discovery and testing.",
  },
  {
    id: "copilot-security-governance-2026",
    claim:
      "Copilot Studio provides tenant and environment governance controls, including data policies and publishing controls.",
    title: "Security FAQs for Copilot Studio",
    url: "https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-faq",
    publisher: "Microsoft Learn",
    sourceDate: "2026-04-29",
    lastCheckedAt: "2026-08-10",
    status: "Verified",
    sourceKind: "vendor-documentation",
    scopeNote:
      "This confirms vendor-documented controls, not that they are licensed, configured, approved, or sufficient for this use case.",
  },
  {
    id: "prototype-event-timeline",
    claim:
      "The walkthrough contains deterministic, operator-attested demo completion events.",
    title: "VaxMoment demonstration",
    url: "https://github.com/smellywesley/Vax-moment#important-boundaries",
    publisher: "VaxMoment prototype team",
    sourceDate: "2026-08-10",
    lastCheckedAt: "2026-08-10",
    status: "Synthetic",
    sourceKind: "prototype",
    scopeNote:
      "The events demonstrate workflow behavior only. They are not verified vaccination records, observed uptake, a clinical audit trail, or evidence of causality.",
  },
  {
    id: "illustrative-privacy-threshold",
    claim:
      "A cohort threshold of 10 is an appropriate minimum for a future employer-facing production view.",
    title: "Illustrative small-cohort threshold",
    url: "https://github.com/smellywesley/Vax-moment/blob/main/docs/validation/pilot-experiment.md",
    publisher: "VaxMoment prototype team",
    sourceDate: "2026-08-10",
    lastCheckedAt: "2026-08-10",
    status: "Assumed",
    sourceKind: "prototype",
    scopeNote:
      "Ten is a visible demo rule, not a legal safe harbour or production anonymity guarantee. Privacy owners must approve a server-enforced threshold and anti-differencing controls before a pilot.",
  },
  {
    id: "barrier-specific-action-effect",
    claim:
      "Barrier-specific next actions improve authoritative completion compared with the existing workplace reminder workflow.",
    title: "Proposed VaxMoment controlled pilot",
    url: "https://github.com/smellywesley/Vax-moment/blob/main/docs/validation/pilot-experiment.md",
    publisher: "VaxMoment prototype team",
    sourceDate: "2026-08-10",
    lastCheckedAt: "2026-08-10",
    status: "To Validate",
    sourceKind: "prototype",
    scopeNote:
      "No real pilot result exists. This claim must remain a hypothesis until a pre-registered comparison with authoritative outcome ascertainment is complete.",
  },
] as const satisfies readonly EvidenceRecord[];

export type EvidenceId = (typeof evidenceRegistry)[number]["id"];

export function getEvidenceById(id: string): EvidenceRecord | undefined {
  return evidenceRegistry.find((record) => record.id === id);
}
