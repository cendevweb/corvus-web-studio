"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface VideoPosterProps {
  /** Video file, only requested once the visitor presses play. */
  src: string;
  poster: { src: string; width: number; height: number; alt: string };
  /** Accessible name of the play button ("Lire le trailer de One Piexel"). */
  playLabel: string;
  /** Accessible name of the <video> while it plays. */
  playingLabel?: string;
  /** Visible content of the play button (icon + text). */
  children: ReactNode;
  /** Extra classes on the frame (e.g. `op-screen`, `fa-screen`). */
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Poster image with a play button; the <video> element is created on demand,
 * so no video byte is downloaded before the click. Falls back to the poster on error or at the end.
 */
export function VideoPoster({
  src,
  poster,
  playLabel,
  playingLabel,
  children,
  className,
  sizes = "(min-width: 860px) 50vw, 100vw",
  priority,
}: VideoPosterProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={cn("vposter", className)}>
      <Image
        src={poster.src}
        width={poster.width}
        height={poster.height}
        alt={poster.alt}
        sizes={sizes}
        {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      />
      <button type="button" className="vplay" aria-label={playLabel} hidden={playing} onClick={() => setPlaying(true)}>
        <span>{children}</span>
      </button>
      {playing && (
        <video
          src={src}
          poster={poster.src}
          controls
          autoPlay
          playsInline
          preload="auto"
          aria-label={playingLabel ?? playLabel}
          ref={(video) => video?.focus()}
          onEnded={() => setPlaying(false)}
          onError={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
