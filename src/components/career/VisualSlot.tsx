import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { WorkVisualSlot } from "@content/career";
import type { Locale } from "@/i18n/routing";
import { typo } from "./RichText";

interface VisualSlotProps {
  visual: WorkVisualSlot;
  locale: Locale;
  /** Replayable demo shown while the real visual is not available. */
  children: ReactNode;
  labels: { soon: string; slot: string };
}

/**
 * Visual of a case study, at the ratio declared in content.
 * - Without `visual.media`: dashed "visual to come" frame hosting the demo, plus the brief of the expected visual.
 * - With `visual.media`: the real image or video takes the frame; the placeholder labels disappear.
 */
export function VisualSlot({ visual, locale, children, labels }: VisualSlotProps) {
  const ratio = { "--ar": visual.ratio.replace(":", "/") } as CSSProperties;
  const { media } = visual;

  if (media) {
    return (
      <div className="case-vis">
        <div className="case-media" style={ratio}>
          {media.type === "video" ? (
            <video src={media.src} poster={media.poster} controls playsInline preload="none" aria-label={media.alt[locale]} />
          ) : (
            <Image
              src={media.src}
              alt={media.alt[locale]}
              width={media.width}
              height={media.height}
              sizes="(min-width: 1000px) 700px, 100vw"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="case-vis">
      <div className="slot" style={ratio}>
        <p className="slot-bar">
          <span className="slot-live">
            <i />
            {visual.kind[locale]}
          </span>
          <span className="slot-tag">
            {labels.soon} <b>{visual.ratio}</b>
          </span>
        </p>
        <div className="slot-body">{children}</div>
      </div>
      <p className="slot-cap">
        <b>{labels.slot}</b>
        <span>{typo(visual.brief[locale], locale)}</span>
      </p>
    </div>
  );
}
