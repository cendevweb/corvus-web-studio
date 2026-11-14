import type { ReactNode } from "react";
import type { WorkId } from "@content/career";
import { careerDemos, resolveContent } from "@content/career-demos";
import type { Locale } from "@/i18n/routing";
import { AdtechFormsDemo } from "./AdtechFormsDemo";
import { DbRedesignDemo } from "./DbRedesignDemo";
import { EntityBuilderDemo } from "./EntityBuilderDemo";
import { MonorepoDemo } from "./MonorepoDemo";
import { ScreenshotBotDemo } from "./ScreenshotBotDemo";
import { ServerlessDemo } from "./ServerlessDemo";

/**
 * Registry: one component per achievement, fed with its texts from `content/career-demos.ts`.
 * To replace a demo with a real component, swap its entry here; to replace it with an image
 * or a video, fill `visual.media` of the work in `content/career.ts` (no code change).
 */
const DEMOS: Record<WorkId, (locale: Locale) => ReactNode> = {
  "screenshot-bot": (locale) => <ScreenshotBotDemo t={resolveContent(careerDemos["screenshot-bot"], locale)} />,
  "entity-builder": (locale) => <EntityBuilderDemo t={resolveContent(careerDemos["entity-builder"], locale)} />,
  monorepo: (locale) => <MonorepoDemo t={resolveContent(careerDemos.monorepo, locale)} />,
  "adtech-forms": (locale) => <AdtechFormsDemo t={resolveContent(careerDemos["adtech-forms"], locale)} />,
  "db-redesign": (locale) => <DbRedesignDemo t={resolveContent(careerDemos["db-redesign"], locale)} />,
  serverless: (locale) => <ServerlessDemo t={resolveContent(careerDemos.serverless, locale)} />,
};

export function WorkDemo({ id, locale }: { id: WorkId; locale: Locale }) {
  return DEMOS[id](locale);
}
