import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import type { GameSlug } from "@content/games";
import { Reveal } from "@/components/ui/Reveal";
import { clientMessages } from "@/i18n/client-messages";
import type { Locale } from "@/i18n/routing";
import { FastrMalusDemo } from "./demos/FastrMalusDemo";
import { IconicQuizDemo } from "./demos/IconicQuizDemo";
import { RollbackDemo } from "./demos/RollbackDemo";
import { gameSkinClass } from "./skin";

const DEMOS = {
  "one-piexel": { Demo: RollbackDemo, messages: "gamesPage.demos.rollback" },
  iconic: { Demo: IconicQuizDemo, messages: "gamesPage.demos.iconic" },
  fastr: { Demo: FastrMalusDemo, messages: "gamesPage.demos.fastr" },
} as const;

/** The playable demo of a game page, inside the game's skin, with only its own messages sent to the client. */
export async function GameDemo({ game }: { game: GameSlug }) {
  const { Demo, messages } = DEMOS[game];
  const locale = (await getLocale()) as Locale;
  return (
    <Reveal className={gameSkinClass(game, "demo")}>
      <NextIntlClientProvider messages={await clientMessages(locale, [messages])}>
        <Demo />
      </NextIntlClientProvider>
    </Reveal>
  );
}
