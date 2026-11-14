import type { ComponentProps, ElementType } from "react";
import type { GameSlug } from "@content/games";
import { gameSkinClass } from "./skin";

type GameSkinProps<T extends ElementType> = {
  game: GameSlug;
  as?: T;
} & Omit<ComponentProps<T>, "as">;

/**
 * Wraps content in a game's own look (colours, borders, fonts) inside the studio's art direction.
 * Adds `.sk .sk-<key>` (see src/styles/skins.css) and loads that game's fonts.
 *
 *   <GameSkin game="fastr" as="section" className="play">…</GameSkin>
 *
 * To skin an element rendered by another component, use `gameSkinClass(slug)` from ./skin.
 */
export function GameSkin<T extends ElementType = "div">({ game, as, className, ...props }: GameSkinProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={gameSkinClass(game, className)} {...props} />;
}
