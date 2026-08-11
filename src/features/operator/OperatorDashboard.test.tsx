import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorDashboard, type OperatorDashboardProps } from "./OperatorDashboard";

const props: OperatorDashboardProps = {
  campaign: {
    campaignName: "Workplace influenza campaign",
    organisationLabel: "Fictional employer",
    statusLabel: "Active",
    invited: 24,
    booked: 8,
    operatorAttestedCompletions: 2,
  },
  completionCheckpoint: {
    scenarioLabel: "Synthetic employee C-014",
    currentState: "Booked—not completed",
    sourceLabel: "Seeded booking event",
    canRecordCompletion: true,
  },
  handoffs: [
    {
      id: "handoff-1",
      scenarioLabel: "Synthetic clinical-question scenario",
      requestedAtLabel: "10 Aug, 10:15",
      status: "Not submitted",
      ownerLabel: "Proposed accountable clinical service — not agreed",
    },
  ],
  timeline: [
    {
      id: "event-1",
      title: "Slot booked",
      timestampLabel: "10 Aug, 10:12",
      detail: "A seeded appointment was booked; completion remains unknown.",
      status: "Synthetic",
    },
  ],
  onRecordCompletion: vi.fn(),
};

describe("OperatorDashboard", () => {
  it("keeps booking and completion visibly separate", () => {
    render(<OperatorDashboard {...props} />);

    expect(screen.getByText("Booked—not completed")).toBeInTheDocument();
    expect(
      screen.getByText(/Booking is not completion/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/not observed uptake/i)).toBeInTheDocument();
  });

  it("calls the supplied completion command", () => {
    const onRecordCompletion = vi.fn();
    render(
      <OperatorDashboard {...props} onRecordCompletion={onRecordCompletion} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Record operator-attested synthetic completion/i,
      }),
    );

    expect(onRecordCompletion).toHaveBeenCalledOnce();
  });

  it("states that synthetic handoffs are not monitored", () => {
    render(<OperatorDashboard {...props} />);

    expect(screen.getByText(/not sent to or monitored by a clinician/i)).toBeInTheDocument();
  });
});
