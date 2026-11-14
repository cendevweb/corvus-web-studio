"use client";

import Image from "next/image";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Lightbox } from "./Lightbox";

const TrailerContext = createContext<() => void>(() => {});

interface TrailerProviderProps {
  src: string;
  poster: string;
  /** Accessible name of the dialog and of the playing video. */
  label: string;
  /** Top-left text of the viewer ("Trailer"). */
  counter: string;
  caption: string;
  closeLabel: string;
  children: ReactNode;
}

/**
 * Holds the trailer viewer of a game page. The <video> only exists while the viewer is open,
 * so no video byte is downloaded before the visitor asks for it.
 * Open it from anywhere below with <TrailerPoster> or <TrailerButton>.
 */
export function TrailerProvider({ src, poster, label, counter, caption, closeLabel, children }: TrailerProviderProps) {
  const [open, setOpen] = useState(false);
  return (
    <TrailerContext value={() => setOpen(true)}>
      {children}
      <Lightbox
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        counter={counter}
        caption={caption}
        closeLabel={closeLabel}
        video
      >
        <video src={src} poster={poster} controls autoPlay playsInline preload="auto" aria-label={label} />
      </Lightbox>
    </TrailerContext>
  );
}

interface TrailerPosterProps {
  poster: { src: string; width: number; height: number; alt: string };
  playLabel: string;
  /** Badge at the bottom left ("TRAILER · 1 MIN 39"). */
  badge: string;
}

/** Poster of the game page hero: the whole image is the play button. */
export function TrailerPoster({ poster, playLabel, badge }: TrailerPosterProps) {
  const open = useContext(TrailerContext);
  return (
    <button className="poster" type="button" onClick={open}>
      {/* Name = play label + poster alt + visible badge; no aria-label (WCAG 2.5.3). */}
      <span className="sr">{playLabel} : </span>
      <Image
        src={poster.src}
        width={poster.width}
        height={poster.height}
        alt={poster.alt}
        sizes="(min-width: 1240px) 660px, (min-width: 920px) 55vw, 100vw"
        loading="eager"
        fetchPriority="high"
      />
      <span className="poster-play">
        <Icon name="play" />
      </span>
      <span className="poster-cap">
        <b>{badge}</b>
      </span>
    </button>
  );
}

/** Secondary "Voir le trailer" button, styled by the surrounding skin. */
export function TrailerButton({ className, children }: { className?: string; children: ReactNode }) {
  const open = useContext(TrailerContext);
  return (
    <button className={className} type="button" onClick={open}>
      {children}
    </button>
  );
}
