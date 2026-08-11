import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  BookingReceipt as DomainBookingReceipt,
  EmployeeJourneyView,
  EmployerDashboardView,
  OperatorDashboard as OperatorDashboardView,
  SessionView,
  SyntheticTimelineEventView,
} from "../application";
import { createDemoRuntime } from "../adapters/demo";
import {
  ActionButton,
  DemoBanner,
  Notice,
  SurfaceCard,
  type DemoBannerProps,
} from "../components";
import {
  GUIDED_CHECKPOINTS,
  GuidedDemoCoach,
  type GuidedCheckpoint,
} from "../demo";
import type { Role, ScenarioId } from "../domain";
import { evidenceRegistry, evidenceStatusDescriptions } from "../evidence";
import {
  type BarrierClassification,
  type BarrierSubmission,
  type EmployeeJourneyScreen,
  EmployeeJourney,
} from "../features/employee";
import {
  EmployerDashboard,
  type EmployerAggregateProjection,
} from "../features/employer";
import {
  OperatorDashboard,
  type OperatorCampaignSummary,
  type OperatorCompletionCheckpoint,
  type OperatorHandoffItem,
  type OperatorTimelineItem,
} from "../features/operator";
import "./App.css";

const runtime = createDemoRuntime({
  storage: typeof window === "undefined" ? undefined : window.localStorage,
});

type EmployeeStage =
  | "barrier"
  | "confirmation"
  | "next-action"
  | "booking-receipt"
  | "handoff-receipt";

const roleLabels: Readonly<
  Record<Role, DemoBannerProps["identity"]["role"]>
> = {
  employee: "Employee",
  operator: "Parkway operator",
  employer: "Employer",
};

function resultMessage(error: { message: string; recovery?: string }) {
  return error.recovery ? `${error.message} ${error.recovery}` : error.message;
}

function formatSlot(startsAt: string) {
  const date = new Date(startsAt);
  return {
    dateLabel: date.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Singapore",
    }),
    timeLabel: date.toLocaleTimeString("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Singapore",
    }),
  };
}

function mapBookingReceipt(receipt: DomainBookingReceipt) {
  const labels = formatSlot(receipt.startsAt);
  return {
    reference: receipt.reference,
    dateLabel: labels.dateLabel,
    timeLabel: labels.timeLabel,
    locationLabel: receipt.location,
    bookingMode: "seeded" as const,
  };
}

function mapEmployerProjection(
  view: EmployerDashboardView | undefined,
  campaignName: string,
): EmployerAggregateProjection {
  const suppressed = view?.kind !== "displayed";
  const metrics = view?.kind === "displayed" ? view.metrics : undefined;

  return {
    campaignName,
    metrics: [
      {
        id: "invited",
        label: "Invited",
        value: metrics?.invited ?? 0,
        context: "Illustrative invited employees",
      },
      {
        id: "booked",
        label: "Booked",
        value: metrics?.booked ?? 0,
        context: "Illustrative appointments booked",
      },
      {
        id: "operator-attested-completions",
        label: "Operator-attested",
        value: metrics?.completed ?? 0,
        context: "Illustrative completion events; not verified records",
      },
    ],
    suppressed,
    suppressionThreshold: view?.kind === "suppressed" ? view.threshold : 10,
    suppressionReason:
      view?.privacyNote
        ?.replace("synthetic people", "people")
        .replace("synthetic campaign outcomes", "campaign outcomes") ??
      "No aggregate-only demonstration outcome is available.",
    asOfLabel: "Demo snapshot · 10 Aug 2026 SGT",
    evidenceStatus: "Synthetic",
  };
}

function mapTimeline(events: readonly SyntheticTimelineEventView[]): readonly OperatorTimelineItem[] {
  return [...events]
    .slice(-6)
    .reverse()
    .map((event) => ({
      id: event.id,
      title: event.command.replaceAll("_", " ").toLowerCase(),
      timestampLabel: `${new Date(event.timestamp).toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
      })} SGT`,
      detail: `${event.actorRole} · ${event.resultCode}${
        event.fallback ? " · visible fallback" : ""
      }`,
      status: "Synthetic" as const,
    }));
}

export function App() {
  const [session, setSession] = useState<SessionView>();
  const [journey, setJourney] = useState<EmployeeJourneyView>();
  const [operatorView, setOperatorView] = useState<OperatorDashboardView>();
  const [employerView, setEmployerView] = useState<EmployerDashboardView>();
  const [timeline, setTimeline] = useState<readonly SyntheticTimelineEventView[]>([]);
  const [employeeStage, setEmployeeStage] = useState<EmployeeStage>("barrier");
  const [classification, setClassification] = useState<BarrierClassification>();
  const [bookingReceipt, setBookingReceipt] = useState<DomainBookingReceipt>();
  const [fallbackMessage, setFallbackMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [guideActive, setGuideActive] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [completionResult, setCompletionResult] = useState<string>();
  const [resetGeneration, setResetGeneration] = useState(0);
  const evidenceFocusRequested = useRef(false);
  const evidenceOpenRef = useRef(false);
  evidenceOpenRef.current = evidenceOpen;

  const activeRole = session?.role ?? "employee";
  const scenarioLabel =
    session?.scenarios.find((scenario) => scenario.id === session.scenarioId)?.label ??
    "Convenience barrier";

  const loadRoleView = useCallback(async (role: Role): Promise<boolean> => {
    let loadedSuccessfully = true;
    if (role === "employee") {
      const result = await runtime.service.getEmployeeJourney();
      if (result.ok) setJourney(result.value);
      else {
        setError(resultMessage(result.error));
        loadedSuccessfully = false;
      }
    }
    if (role === "operator") {
      const result = await runtime.service.getOperatorDashboard();
      if (result.ok) setOperatorView(result.value);
      else {
        setError(resultMessage(result.error));
        loadedSuccessfully = false;
      }
    }
    if (role === "employer") {
      const result = await runtime.service.getEmployerDashboard();
      if (result.ok) setEmployerView(result.value);
      else {
        setError(resultMessage(result.error));
        loadedSuccessfully = false;
      }
    }

    if (role === "operator") {
      const timelineResult = await runtime.service.getSyntheticTimeline();
      if (timelineResult.ok) setTimeline(timelineResult.value.events);
      else {
        setError(resultMessage(timelineResult.error));
        loadedSuccessfully = false;
      }
    } else {
      setTimeline([]);
    }
    return loadedSuccessfully;
  }, []);

  const initialise = useCallback(async () => {
    try {
      const sessionResult = await runtime.service.getSession();
      if (!sessionResult.ok) {
        setError(resultMessage(sessionResult.error));
        return;
      }
      setSession(sessionResult.value);
      await loadRoleView(sessionResult.value.role);
    } catch {
      setError(
        "The demo stopped unexpectedly. Restore the default journey and retry.",
      );
    }
  }, [loadRoleView]);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  useEffect(() => {
    if (!evidenceOpen || !evidenceFocusRequested.current) return;
    evidenceFocusRequested.current = false;
    const heading = document.getElementById("evidence-heading");
    heading?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    heading?.focus();
  }, [evidenceOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (evidenceOpenRef.current || evidenceFocusRequested.current) return;
      const targetId =
        activeRole === "employee"
          ? "employee-stage-heading"
          : activeRole === "operator"
            ? "operator-heading"
            : "employer-heading";
      document.getElementById(targetId)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeRole, employeeStage, resetGeneration]);

  const openEvidenceDrawer = useCallback(() => {
    if (evidenceOpen) {
      const heading = document.getElementById("evidence-heading");
      heading?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      heading?.focus();
      return;
    }
    evidenceFocusRequested.current = true;
    setEvidenceOpen(true);
  }, [evidenceOpen]);

  const switchRole = useCallback(
    async (role: Role): Promise<boolean> => {
      setBusy(true);
      setError(undefined);
      try {
        const result = await runtime.service.switchRole(role);
        if (!result.ok) {
          setError(resultMessage(result.error));
          return false;
        } else {
          setSession(result.value);
          return loadRoleView(role);
        }
      } catch {
        setError("The role switch stopped unexpectedly. Reset the demo and retry.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [loadRoleView],
  );

  const resetScenario = useCallback(
    async (scenarioId: ScenarioId = "convenience"): Promise<boolean> => {
      setBusy(true);
      setError(undefined);
      setFallbackMessage(undefined);
      setClassification(undefined);
      setBookingReceipt(undefined);
      setCompletionResult(undefined);
      setOperatorView(undefined);
      setEmployerView(undefined);
      setGuideStep(0);
      setEvidenceOpen(false);
      setResetGeneration((generation) => generation + 1);
      try {
        const reset = await runtime.service.reset();
        if (!reset.ok) {
          setError(resultMessage(reset.error));
          return false;
        }
        const selected = await runtime.service.selectScenario(scenarioId);
        const currentSession = await runtime.service.getSession();
        if (!selected.ok) {
          setError(resultMessage(selected.error));
          return false;
        } else if (!currentSession.ok) {
          setError(resultMessage(currentSession.error));
          return false;
        } else {
          setJourney(selected.value);
          setSession(currentSession.value);
          setEmployeeStage("barrier");
          setTimeline([]);
          return true;
        }
      } catch {
        setError("The reset stopped unexpectedly. Restore the canonical demo and retry.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const selectScenario = useCallback(
    async (scenarioId: ScenarioId) => {
      setGuideActive(false);
      setGuideStep(0);
      if (activeRole !== "employee") await switchRole("employee");
      await resetScenario(scenarioId);
    },
    [activeRole, resetScenario, switchRole],
  );

  const toggleGuidedDemo = useCallback(async () => {
    if (guideActive) {
      setGuideActive(false);
      return;
    }

    setGuideStep(0);
    const ready = await resetScenario("convenience");
    if (ready) setGuideActive(true);
  }, [guideActive, resetScenario]);

  const classifyBarrier = useCallback(
    async (submission: BarrierSubmission): Promise<BarrierClassification> => {
      if (!submission.transientText && submission.selectedCategory) {
        return { category: submission.selectedCategory, mode: "preset" };
      }
      const result = await runtime.service.classifyBarrier({
        rawText: submission.transientText ?? "",
      });
      if (!result.ok) throw new Error(resultMessage(result.error));
      if (result.value.fallbackActive) {
        setFallbackMessage(
          "The simulated classifier was unavailable. An allowlisted deterministic category replaced it.",
        );
      }
      return {
        category: result.value.category,
        mode: result.value.mode,
        fallbackMessage: result.value.fallbackActive
          ? "Simulated classification was unavailable; the deterministic safety fallback was used."
          : undefined,
      };
    },
    [],
  );

  const confirmAndOffer = useCallback(
    async (prepared = classification): Promise<EmployeeJourneyView | undefined> => {
      if (!prepared || !journey) return;
      setBusy(true);
      setError(undefined);
      try {
        const confirmed = await runtime.service.confirmBarrier({
          category: prepared.category,
          employeeId: journey.employeeId,
          expectedVersion: journey.stateVersion,
        });
        if (!confirmed.ok) {
          setError(resultMessage(confirmed.error));
          return undefined;
        }
        const action = await runtime.service.offerNextAction({
          employeeId: confirmed.value.employeeId,
          expectedVersion: confirmed.value.stateVersion,
        });
        if (!action.ok) {
          setError(resultMessage(action.error));
          return undefined;
        }
        setJourney(action.value.journey);
        setEmployeeStage(action.value.handoff ? "handoff-receipt" : "next-action");
        return action.value.journey;
      } catch {
        setError("The governed action stopped unexpectedly. Reset the scenario and retry.");
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [classification, journey],
  );

  const bookFirstSlot = useCallback(async (currentJourney = journey): Promise<boolean> => {
    if (!currentJourney) return false;
    setBusy(true);
    setError(undefined);
    try {
      const slots = await runtime.service.getBookingSlots({
        employeeId: currentJourney.employeeId,
        expectedVersion: currentJourney.stateVersion,
      });
      if (!slots.ok || slots.value.slots.length === 0) {
        setError(
          !slots.ok ? resultMessage(slots.error) : "No demonstration appointment is available.",
        );
        return false;
      }
      if (slots.value.fallbackActive) {
        setFallbackMessage(
          "Live booking is unavailable. Showing seeded demo slots instead.",
        );
      }
      const firstSlot = slots.value.slots[0];
      if (!firstSlot) {
        setError("No demonstration appointment is available.");
        return false;
      }
      const refreshedBeforeBooking = await runtime.service.getEmployeeJourney();
      if (!refreshedBeforeBooking.ok) {
        setError(resultMessage(refreshedBeforeBooking.error));
        return false;
      }
      const booked = await runtime.service.bookSlot({
        employeeId: refreshedBeforeBooking.value.employeeId,
        slotId: firstSlot.id,
        expectedVersion: refreshedBeforeBooking.value.stateVersion,
      });
      if (!booked.ok) {
        setError(resultMessage(booked.error));
        return false;
      }
      setBookingReceipt(booked.value);
      setEmployeeStage("booking-receipt");
      const refreshed = await runtime.service.getEmployeeJourney();
      if (refreshed.ok) setJourney(refreshed.value);
      else {
        setError(resultMessage(refreshed.error));
        return false;
      }
      return true;
    } catch {
      setError("The seeded booking stopped unexpectedly. Reset the scenario and retry.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [journey]);

  const recordCompletion = useCallback(async () => {
    setBusy(true);
    setError(undefined);
    try {
      const employee = operatorView?.employees[0];
      if (!employee) {
        setError("No demo employee is available for this completion checkpoint.");
        return;
      }
      const result = await runtime.service.recordCompletion({
        employeeId: employee.employeeId,
        expectedVersion: employee.stateVersion,
      });
      if (!result.ok) setError(resultMessage(result.error));
      else {
        setCompletionResult(
          "Completion checkpoint recorded. This is not a verified clinical record.",
        );
        await loadRoleView("operator");
      }
    } catch {
      setError("The completion checkpoint stopped unexpectedly. Retry from the operator view.");
    } finally {
      setBusy(false);
    }
  }, [loadRoleView, operatorView]);

  const runSafetyScenario = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    setError(undefined);
    try {
      const roleResult = await runtime.service.switchRole("employee");
      if (!roleResult.ok) {
        setError(resultMessage(roleResult.error));
        return false;
      }
      const selected = await runtime.service.selectScenario("clinical_handoff");
      if (!selected.ok) {
        setError(resultMessage(selected.error));
        return false;
      }
      const confirmed = await runtime.service.confirmBarrier({
        category: "clinical_question",
        employeeId: selected.value.employeeId,
        expectedVersion: selected.value.stateVersion,
      });
      if (!confirmed.ok) {
        setError(resultMessage(confirmed.error));
        return false;
      }
      const action = await runtime.service.offerNextAction({
        employeeId: confirmed.value.employeeId,
        expectedVersion: confirmed.value.stateVersion,
      });
      if (!action.ok) {
        setError(resultMessage(action.error));
        return false;
      }
      setJourney(action.value.journey);
      setClassification({ category: "clinical_question", mode: "preset" });
      setSession({ ...roleResult.value, scenarioId: "clinical_handoff" });
      setEmployeeStage("handoff-receipt");
      setOperatorView(undefined);
      setEmployerView(undefined);
      return true;
    } catch {
      setError("The clinical-boundary scenario stopped unexpectedly. Reset and retry.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const runCheckpointAction = useCallback(
    async (checkpoint: GuidedCheckpoint): Promise<boolean> => {
      if (checkpoint.id === "promise-and-barrier") {
        return resetScenario("convenience");
      } else if (checkpoint.id === "confirm-category") {
        const prepared: BarrierClassification = {
          category: "convenience",
          mode: "preset",
        };
        setClassification(prepared);
        setEmployeeStage("confirmation");
        return true;
      } else if (checkpoint.id === "book-slot") {
        let actionableJourney = journey;
        if (!classification) {
          const prepared: BarrierClassification = {
            category: "convenience",
            mode: "preset",
          };
          setClassification(prepared);
          actionableJourney = await confirmAndOffer(prepared);
        } else if (employeeStage === "confirmation") {
          actionableJourney = await confirmAndOffer(classification);
        }
        if (!actionableJourney) return false;
        return bookFirstSlot(actionableJourney);
      } else if (checkpoint.id === "operator-checkpoint") {
        return switchRole("operator");
      } else if (checkpoint.id === "employer-reveal") {
        return switchRole("employer");
      } else if (checkpoint.id === "safety-resilience-evidence") {
        return runSafetyScenario();
      } else if (checkpoint.id === "close") {
        setEvidenceOpen(true);
        return switchRole("employer");
      }
      return false;
    },
    [
      bookFirstSlot,
      classification,
      confirmAndOffer,
      employeeStage,
      journey,
      resetScenario,
      runSafetyScenario,
      switchRole,
    ],
  );

  const employeeScreen = useMemo<EmployeeJourneyScreen>(() => {
    if (employeeStage === "confirmation" && classification) {
      return {
        kind: "confirmation",
        props: {
          classification,
          disabled: busy,
          onChange: () => setEmployeeStage("barrier"),
          onContinue: () => void confirmAndOffer(),
          traceOpenByDefault: guideActive,
        },
      };
    }

    if (employeeStage === "next-action" && journey?.intervention) {
      const interventionAction = journey.intervention.action;
      const isBookingAction = interventionAction === "show_slots";
      const isOptOutAction = interventionAction === "record_opt_out";
      const traceClassification =
        classification ??
        (journey.barrierCategory
          ? { category: journey.barrierCategory, mode: "preset" as const }
          : undefined);
      if (!traceClassification) {
        return {
          kind: "custom",
          content: (
            <Notice title="Barrier confirmation unavailable" tone="warning">
              Reset the journey so the governed action can be traced from its source.
            </Notice>
          ),
        };
      }
      return {
        kind: "next-action",
        props: {
          headline: journey.intervention.wording,
          description:
            isBookingAction
              ? "Reserve the next available appointment to remove the schedule barrier."
              : isOptOutAction
                ? "The opt-out is recorded without pressure. You can return while the demo campaign is open."
                : "Review the source-linked evidence and use a human service for individual questions.",
          evidenceStatus:
            interventionAction === "create_handoff"
              ? "Product safety rule · To Validate"
              : "Evidence-informed · outcome To Validate",
          trace: {
            classification: traceClassification,
            policyAction: journey.intervention.wording,
            policyRule: journey.intervention.id,
            openByDefault: guideActive,
          },
          primaryAction: {
            label:
              isBookingAction
                ? "Reserve next available appointment"
                : isOptOutAction
                  ? "Return to campaign"
                  : "Review source-linked evidence",
            onAction: () => {
              if (isBookingAction) {
                void bookFirstSlot(journey);
              } else if (isOptOutAction) {
                setEmployeeStage("barrier");
              } else {
                openEvidenceDrawer();
              }
            },
            disabled: busy,
          },
          secondaryAction: {
            label: "Choose another barrier",
            onAction: () => setEmployeeStage("barrier"),
          },
        },
      };
    }

    if (employeeStage === "booking-receipt" && bookingReceipt) {
      return {
        kind: "booking-receipt",
        props: {
          receipt: mapBookingReceipt(bookingReceipt),
          trace: classification
            ? {
                classification,
                policyAction: "Showing a slot was authorized by the barrier policy.",
                policyRule: journey?.intervention?.id,
                openByDefault: guideActive,
              }
            : undefined,
          showDemoEvidence: true,
          onBackToCampaign: () => setEmployeeStage("barrier"),
        },
      };
    }

    if (employeeStage === "handoff-receipt" && journey?.handoff) {
      return {
        kind: "handoff-receipt",
        props: {
          receipt: {
            reference: journey.handoff.reference,
            status: "Synthetic receipt — not submitted",
            ownerRole: journey.handoff.ownerRole,
            expectedResponseWindow: journey.handoff.expectedResponseWindow,
          },
          trace: {
            classification:
              classification?.category === "clinical_question"
                ? classification
                : { category: "clinical_question", mode: "preset" },
            policyAction: "Automation stopped and prepared a human-information route.",
            policyRule: journey.intervention?.id,
            openByDefault: guideActive,
          },
          onReturn: () => setEmployeeStage("barrier"),
        },
      };
    }

    return {
      kind: "barrier",
      props: {
        onSubmit: classifyBarrier,
        onConfirmed: (prepared) => {
          setClassification(prepared);
          setEmployeeStage("confirmation");
        },
        onSkip: (selectedCategory) => {
          setClassification({ category: selectedCategory ?? "convenience", mode: "preset" });
          setEmployeeStage("confirmation");
        },
        disabled: busy,
      },
    };
  }, [
    bookingReceipt,
    bookFirstSlot,
    busy,
    classification,
    classifyBarrier,
    confirmAndOffer,
    employeeStage,
    journey,
    openEvidenceDrawer,
  ]);

  const campaignName =
    activeRole === "operator" && operatorView
      ? operatorView.campaignTitle
      : scenarioLabel;
  const campaignSummary: OperatorCampaignSummary = {
    campaignName,
    organisationLabel: "Northstar Pte Ltd",
    statusLabel: "Campaign open",
    invited: operatorView?.employees.length ?? 0,
    booked:
      operatorView?.employees.filter((employee) =>
        ["BOOKED", "COMPLETION_UNKNOWN", "COMPLETED"].includes(employee.state),
      ).length ?? 0,
    operatorAttestedCompletions:
      operatorView?.employees.filter((employee) => employee.state === "COMPLETED")
        .length ?? 0,
  };
  const primaryOperatorEmployee = operatorView?.employees[0];
  const completionCheckpoint: OperatorCompletionCheckpoint = {
    scenarioLabel: primaryOperatorEmployee ? "Primary employee journey" : "Employee journey",
    currentState:
      primaryOperatorEmployee?.state === "COMPLETED"
        ? "Operator-attested synthetic completion"
        : primaryOperatorEmployee?.state === "BOOKED"
          ? "Booked—not completed"
          : "Completion unknown",
    sourceLabel: "Operator action · demo provenance not verified",
    canRecordCompletion: primaryOperatorEmployee?.state === "BOOKED",
    blockedReason:
      primaryOperatorEmployee?.state === "BOOKED"
        ? undefined
        : "A seeded booking must exist before a separate completion event can be recorded.",
  };
  const handoffs: readonly OperatorHandoffItem[] =
    (operatorView?.pendingHandoffs ?? 0) > 0
      ? [
          {
            id: "synthetic-handoff-summary",
            scenarioLabel: "Clinical-question scenario",
            requestedAtLabel: "Demo only · no message sent",
            status: "Not submitted",
            ownerLabel: "Proposed accountable clinical service — not agreed",
          },
        ]
      : [];

  const banner: DemoBannerProps = {
    identity: {
      label:
        activeRole === "employee"
          ? "You"
          : activeRole === "operator"
            ? "Parkway demo operator"
            : "Employer programme viewer",
      role: roleLabels[activeRole],
    },
    scenarioLabel,
    fallback: { active: Boolean(fallbackMessage), message: fallbackMessage },
  };

  if (!session) {
    return (
      <main className="app-loading" id="main-content">
        <p>Preparing VaxMoment…</p>
        {error ? (
          <Notice title="VaxMoment could not start" tone="danger">
            <p>{error}</p>
            <ActionButton onClick={() => void resetScenario()}>Reset application</ActionButton>
          </Notice>
        ) : null}
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="app-brand" href="#/" aria-label="VaxMoment home">
          <span aria-hidden="true">V</span>
          <strong>VaxMoment</strong>
        </a>
        <p>Governed vaccination support, with privacy by design</p>
        <div className="role-switcher-wrap">
          <span>View as</span>
          <nav aria-label="Product roles" className="role-switcher">
            {(Object.keys(roleLabels) as Role[]).map((role) => (
              <button
                aria-pressed={activeRole === role}
                disabled={busy}
                key={role}
                onClick={() => void switchRole(role)}
                type="button"
              >
                {roleLabels[role]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="demo-controls" aria-label="Journey controls">
        <div className="demo-controls__intro">
          <span>VaxMoment journey</span>
          <strong>Explore how vaccination support becomes action</strong>
        </div>
        <label>
          Choose a journey
          <select
            disabled={busy}
            onChange={(event) => void selectScenario(event.target.value as ScenarioId)}
            value={session.scenarioId}
          >
            {session.scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
        </label>
        <ActionButton
          id="walkthrough-toggle"
          disabled={busy}
          onClick={() => void toggleGuidedDemo()}
          variant={guideActive ? "quiet" : "primary"}
        >
          {guideActive ? "Close walkthrough" : "Start 3-minute walkthrough"}
        </ActionButton>
        <ActionButton disabled={busy} onClick={() => void resetScenario(session.scenarioId)} variant="quiet">
          Reset this story
        </ActionButton>
      </section>

      {error ? (
        <div className="app-alert">
          <Notice title="What happened" tone="danger" live="assertive">
            <p>{error}</p>
            <p>Your last consistent demo state remains available.</p>
          </Notice>
        </div>
      ) : null}

      <div className={guideActive ? "app-layout app-layout--guided" : "app-layout"}>
        <div className="app-product">
          {activeRole === "employee" ? (
            <EmployeeJourney
              banner={banner}
              key={`${session.scenarioId}-${resetGeneration}`}
              screen={employeeScreen}
            />
          ) : (
            <div className="vm-page-shell">
              <DemoBanner {...banner} />
              <main className="vm-page-main" id="main-content">
                {activeRole === "operator" ? (
                  <OperatorDashboard
                    campaign={campaignSummary}
                    completionCheckpoint={completionCheckpoint}
                    handoffs={handoffs}
                    timeline={mapTimeline(timeline)}
                    onRecordCompletion={() => void recordCompletion()}
                    isRecordingCompletion={busy}
                    completionResult={completionResult}
                  />
                ) : (
                  <EmployerDashboard
                    projection={mapEmployerProjection(employerView, campaignName)}
                  />
                )}
              </main>
            </div>
          )}

          <section className="evidence-section" aria-label="Evidence and validation boundaries">
            <details
              className="evidence-drawer"
              onToggle={(event) => setEvidenceOpen(event.currentTarget.open)}
              open={evidenceOpen}
            >
              <summary>
                <span>Evidence and assumptions</span>
                <strong>Review verified evidence, assumptions, and validation boundaries</strong>
              </summary>
              <SurfaceCard
                eyebrow="Inspectable evidence"
                title="What is known—and what is not"
                titleId="evidence-heading"
              >
                <p>
                  Evidence status describes the claim, not clinical confidence or an
                  individual recommendation.
                </p>
                <div className="evidence-grid">
                  {evidenceRegistry.map((record) => (
                    <article key={record.id}>
                      <span>{record.status === "Synthetic" ? "Demo-generated" : record.status}</span>
                      <h3>{record.title}</h3>
                      <p>{record.claim}</p>
                      <p>{record.scopeNote}</p>
                      <dl>
                        <div>
                          <dt>Publisher</dt>
                          <dd>{record.publisher}</dd>
                        </div>
                        <div>
                          <dt>Source date</dt>
                          <dd>{record.sourceDate}</dd>
                        </div>
                        <div>
                          <dt>Last checked</dt>
                          <dd>{record.lastCheckedAt}</dd>
                        </div>
                      </dl>
                      <a href={record.url} rel="noreferrer" target="_blank">
                        View source
                      </a>
                    </article>
                  ))}
                </div>
                <details>
                  <summary>Evidence-status legend</summary>
                  <dl className="evidence-legend">
                    {Object.entries(evidenceStatusDescriptions).map(([status, meaning]) => (
                      <div key={status}>
                          <dt>{status === "Synthetic" ? "Demo-generated" : status}</dt>
                        <dd>{meaning}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </SurfaceCard>
            </details>
          </section>
        </div>

        <GuidedDemoCoach
          active={guideActive}
          checkpoints={GUIDED_CHECKPOINTS}
          currentStep={guideStep}
          key={resetGeneration}
          onExit={() => {
            setGuideActive(false);
            window.requestAnimationFrame(() => {
              document.getElementById("walkthrough-toggle")?.focus();
            });
          }}
          onPrimaryAction={(checkpoint) => runCheckpointAction(checkpoint)}
          onRestart={async () => {
            setGuideStep(0);
            await resetScenario("convenience");
            window.requestAnimationFrame(() => {
              document.getElementById("guided-demo-heading")?.focus();
            });
          }}
          onStepChange={(step) => setGuideStep(step)}
        />
      </div>

      <footer className="app-footer">
        <p>VaxMoment · Privacy-first vaccination engagement</p>
        <a href="https://github.com/smellywesley/Vax-moment" rel="noreferrer">
          Source and implementation notes
        </a>
      </footer>
    </div>
  );
}
