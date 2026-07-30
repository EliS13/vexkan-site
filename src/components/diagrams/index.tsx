import React from "react";
import {
  BrainSystemDiagram,
  CompetitionFormats,
  ManualReadingFlow,
  BrainstormingSteps,
  ResearchSources,
  DriveTypes,
  SpeedTorqueTradeoff,
  ScoringCycle,
  TradeoffTriangle,
  FusionSpectrum,
  PtoBuildOrder,
  PtoTypes,
  PtoPowerSplit,
  PneumaticBinary,
  NotebookEntryTypes,
  TeamStructure,
} from "./iq";
import {
  WheelSizes,
  SpeedReference,
  WheelLayout,
  LiftTypes,
  LauncherTypes,
  SolenoidCylinder,
  TeeFitting,
  PneumaticSystem,
  ScoutingTimeline,
} from "./v5";

export const DIAGRAMS: Record<string, React.ComponentType> = {
  "brain-system": BrainSystemDiagram,
  "competition-formats": CompetitionFormats,
  "manual-reading-flow": ManualReadingFlow,
  "brainstorming-steps": BrainstormingSteps,
  "research-sources": ResearchSources,
  "drive-types": DriveTypes,
  "speed-torque": SpeedTorqueTradeoff,
  "scoring-cycle": ScoringCycle,
  "tradeoff-triangle": TradeoffTriangle,
  "fusion-spectrum": FusionSpectrum,
  "pto-build-order": PtoBuildOrder,
  "pto-types": PtoTypes,
  "pto-power-split": PtoPowerSplit,
  "pneumatic-binary": PneumaticBinary,
  "notebook-entry-types": NotebookEntryTypes,
  "team-structure": TeamStructure,
  "wheel-sizes": WheelSizes,
  "speed-reference": SpeedReference,
  "wheel-layout": WheelLayout,
  "lift-types": LiftTypes,
  "launcher-types": LauncherTypes,
  "solenoid-cylinder": SolenoidCylinder,
  "tee-fitting": TeeFitting,
  "pneumatic-system": PneumaticSystem,
  "scouting-timeline": ScoutingTimeline,
};

export function Figure({ id, caption }: { id: string; caption: string }) {
  const Component = DIAGRAMS[id];
  if (!Component) return null;

  return (
    <figure className="my-7">
      {/*
        The caption below states what the diagram shows, so the SVG itself is
        hidden from assistive tech. Otherwise a screen reader reads the loose
        text nodes in DOM order, which for a diagram is meaningless.
      */}
      <div
        className="overflow-hidden rounded-xl border bg-surface px-3 py-4 sm:px-5"
        style={{ borderColor: "var(--line)" }}
        aria-hidden="true"
      >
        <Component />
      </div>
      <figcaption className="mt-2 text-[12.5px] leading-relaxed text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
