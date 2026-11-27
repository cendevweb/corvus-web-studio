import type { ComponentType } from "react";
import type { ExperimentDemo } from "@content/nest";
import { CrowFollowDemo } from "./CrowFollowDemo";
import { IconGridDemo } from "./IconGridDemo";
import { RoundTimerDemo } from "./RoundTimerDemo";

/** Compact demo of each experiment shown on the home page (`Experiment.demo` in content/nest.ts). */
export const experimentDemos: Partial<Record<ExperimentDemo, ComponentType>> = {
  "crow-follow": CrowFollowDemo,
  "round-timer": RoundTimerDemo,
  "icon-grid": IconGridDemo,
};
