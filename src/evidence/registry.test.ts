import { describe, expect, it } from "vitest";

import {
  evidenceRegistry,
  evidenceStatuses,
  getEvidenceById,
} from "./registry";

describe("evidenceRegistry", () => {
  it("keeps every record dated, checked, scoped, and status-labelled", () => {
    const isoDate = /^\d{4}-\d{2}-\d{2}$/;

    expect(evidenceRegistry.length).toBeGreaterThan(0);

    for (const record of evidenceRegistry) {
      expect(record.sourceDate).toMatch(isoDate);
      expect(record.lastCheckedAt).toMatch(isoDate);
      expect(record.scopeNote.length).toBeGreaterThan(20);
      expect(evidenceStatuses).toContain(record.status);
    }
  });

  it("does not promote the product-effect hypothesis to verified", () => {
    expect(getEvidenceById("barrier-specific-action-effect")?.status).toBe(
      "To Validate",
    );
  });

  it("labels prototype completion evidence as synthetic", () => {
    expect(getEvidenceById("prototype-event-timeline")?.status).toBe(
      "Synthetic",
    );
  });

  it("keeps the illustrative privacy threshold explicitly assumed", () => {
    expect(getEvidenceById("illustrative-privacy-threshold")?.status).toBe(
      "Assumed",
    );
  });

  it("represents every evidence status in the drawer registry", () => {
    const represented = new Set(evidenceRegistry.map((record) => record.status));

    for (const status of evidenceStatuses) {
      expect(represented.has(status)).toBe(true);
    }
  });
});
