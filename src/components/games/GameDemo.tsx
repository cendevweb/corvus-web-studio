import type { GameSlug } from "@content/games";
import { Reveal } from "@/components/ui/Reveal";
import { FastrMalusDemo } from "./demos/FastrMalusDemo";
import { IconicQuizDemo } from "./demos/IconicQuizDemo";
import { RollbackDemo } from "./demos/RollbackDemo";
import { gameSkinClass } from "./skin";

const DEMOS = { "one-piexel": RollbackDemo, iconic: IconicQuizDemo, fastr: FastrMalusDemo } as const;

/** The playable demo of a game page, inside the game's skin. */
export function GameDemo({ game }: { game: GameSlug }) {
  const Demo = DEMOS[game];
  return (
    <Reveal className={gameSkinClass(game, "demo")}>
      <Demo />
    </Reveal>
  );
}
