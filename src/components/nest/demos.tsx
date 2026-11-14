import type { ComponentType } from "react";
import type { ExperimentDemo } from "@content/nest";
import { CrowFollowDemo } from "./CrowFollowDemo";
import { IconGridDemo } from "./IconGridDemo";
import { RoundTimerDemo } from "./RoundTimerDemo";

/** Demo component of each playable experiment (`Experiment.demo` in content/nest.ts). */
export const experimentDemos: Record<ExperimentDemo, ComponentType> = {
  "crow-follow": CrowFollowDemo,
  "round-timer": RoundTimerDemo,
  "icon-grid": IconGridDemo,
};
