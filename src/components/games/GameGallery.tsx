"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { GameIcon } from "./GameIcon";
import { Lightbox } from "./Lightbox";

export interface GalleryShot {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

interface GameGalleryProps {
  shots: GalleryShot[];
  labels: {
    /** Accessible name of the viewer ("Captures de One Piexel"). */
    dialog: string;
    /** Prefix of each thumbnail's accessible name ("Agrandir :"). */
    enlarge: string;
    close: string;
    prev: string;
    next: string;
  };
}

/** Screenshot grid of a game page; each thumbnail opens the lightbox (arrow keys to navigate). */
export function GameGallery({ shots, labels }: GameGalleryProps) {
  const [current, setCurrent] = useState<number | null>(null);
  const shot = current === null ? undefined : shots[current];
  const go = (step: number) => setCurrent((index) => ((index ?? 0) + step + shots.length) % shots.length);

  return (
    <>
      <div className="shots">
        {shots.map((item, index) => (
          <Reveal
            as="button"
            key={item.src}
            className="shot"
            type="button"
            delay={(index % 3) * 60}
            aria-label={`${labels.enlarge} ${item.alt}`}
            onClick={() => setCurrent(index)}
          >
            <Image
              src={item.src}
              width={item.width}
              height={item.height}
              alt={item.alt}
              sizes={index === 0 ? "(min-width: 860px) 66vw, 100vw" : "(min-width: 860px) 33vw, 50vw"}
            />
            <span className="shot-n" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="shot-z" aria-hidden="true">
              <GameIcon name="zoom" />
            </span>
            <span className="shot-c" aria-hidden="true">
              {item.caption}
            </span>
          </Reveal>
        ))}
      </div>
      <Lightbox
        open={shot !== undefined}
        onClose={() => setCurrent(null)}
        label={labels.dialog}
        counter={`${(current ?? 0) + 1} / ${shots.length}`}
        caption={shot?.caption ?? ""}
        closeLabel={labels.close}
        prevLabel={labels.prev}
        nextLabel={labels.next}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
      >
        {shot && (
          <Image
            key={shot.src}
            src={shot.src}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            sizes="100vw"
            loading="eager"
          />
        )}
      </Lightbox>
    </>
  );
}
