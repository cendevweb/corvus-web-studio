import { getGame, type GameSlug } from "@content/games";
import { cn } from "@/lib/cn";
import { skinFontVariables } from "@/lib/fonts-skins";

/** Class list that applies a game's skin (and its fonts) to any element. */
export function gameSkinClass(game: GameSlug, className?: string): string {
  const skin = getGame(game)?.skin;
  return cn("sk", skin && `sk-${skin}`, skinFontVariables[game], className);
}
