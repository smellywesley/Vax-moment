import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  EmployerDashboard,
  type EmployerAggregateProjection,
} from "./EmployerDashboard";

const metrics: EmployerAggregateProjection["metrics"] = [
  { id: "invited", label: "Invited", value: 24, context: "Synthetic people" },
  { id: "booked", label: "Booked", value: 8, context: "Synthetic bookings" },
  {
    id: "operator-attested-completions",
    label: "Operator-attested",
    value: 2,
    context: "Synthetic, unverified events",
  },
];

const displayedProjection: EmployerAggregateProjection = {
  campaignName: "Workplace influenza campaign",
  metrics,
  suppressed: false,
  suppressionThreshold: 10,
  suppressionReason: "Small cohorts are hidden.",
  asOfLabel: "As of synthetic event 12",
  evidenceStatus: "Synthetic",
};

describe("EmployerDashboard", () => {
  it("renders exactly three aggregate metrics", () => {
    render(<EmployerDashboard projection={displayedProjection} />);

    const aggregateList = screen.getByLabelText("Aggregate campaign metrics");
    expect(aggregateList.querySelectorAll("dt")).toHaveLength(3);
    expect(aggregateList).toHaveTextContent("24");
    expect(aggregateList).toHaveTextContent("8");
    expect(aggregateList).toHaveTextContent("2");
  });

  it("hides every aggregate value for a small cohort", () => {
    render(
      <EmployerDashboard
        projection={{ ...displayedProjection, suppressed: true }}
      />,
    );

    expect(screen.getByText("Small cohort suppressed")).toBeInTheDocument();
    expect(screen.getAllByText("Suppressed")).toHaveLength(3);
    expect(screen.queryByText("24")).not.toBeInTheDocument();
    expect(screen.queryByText("8")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("states the public static prototype limitation", () => {
    render(<EmployerDashboard projection={displayedProjection} />);

    expect(screen.getByText(/public static prototype/i)).toBeInTheDocument();
    expect(screen.getByText(/not evidence of uptake, causality, or return on investment/i)).toBeInTheDocument();
  });
});
