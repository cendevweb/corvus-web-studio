"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { VideoSource } from "@/lib/markdown/video";

interface VideoFrameProps {
  video: VideoSource;
  /** Accessible name of the play button, reused as the player's title. */
  label: string;
  /** Poster content (image, title, play pill). */
  children: ReactNode;
  className?: string;
}

/**
 * Poster first, player on demand: nothing is requested from YouTube (or of the video file)
 * before the visitor presses play. YouTube goes through the cookie-less domain.
 */
export function VideoFrame({ video, label, children, className }: VideoFrameProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={cn(className, "is-playing")}>
        {video.kind === "youtube" ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            src={video.src}
            controls
            autoPlay
            playsInline
            aria-label={label}
            ref={(el) => el?.focus()}
            onError={() => setPlaying(false)}
          />
        )}
      </div>
    );
  }

  return (
    <button type="button" className={className} aria-label={label} onClick={() => setPlaying(true)}>
      {children}
    </button>
  );
}
