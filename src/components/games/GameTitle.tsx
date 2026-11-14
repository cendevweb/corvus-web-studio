import Image from "next/image";
import type { ElementType } from "react";
import type { Game } from "@content/games";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

interface GameTitleProps {
  game: Game;
  as?: ElementType;
  /** Text set in the game's title lettering. Defaults to the game's name (Iconic then shows its logo). */
  text?: string;
  className?: string;
  id?: string;
}

/** A title in the lettering of a game: pixel gradient (One Piexel), bolt + Electrolize (Fastr), Titan One or logo (Iconic). */
export function GameTitle({ game, as: Tag = "span", text, className, id }: GameTitleProps) {
  if (game.skin === "op") {
    return (
      <Tag id={id} className={cn("op-title", className)}>
        {(text ?? game.name).toUpperCase()}
      </Tag>
    );
  }
  if (game.skin === "fa") {
    return (
      <Tag id={id} className={cn("fa-title", className)}>
        <Icon name="bolt" />
        {(text ?? game.name).toUpperCase()}
      </Tag>
    );
  }
  const logo = game.media.logo;
  if (!text && logo) {
    return (
      <Tag id={id} className={className}>
        <Image className="ic-logo" src={logo.src} width={logo.width} height={logo.height} alt={game.name} unoptimized />
      </Tag>
    );
  }
  return (
    <Tag id={id} className={cn("ic-title", className)}>
      {text ?? game.name}
    </Tag>
  );
}
