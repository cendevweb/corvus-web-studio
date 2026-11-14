"use client";

import { useRef } from "react";
import { CrowSprite, type CrowSpriteHandle } from "@/components/ui/CrowSprite";
import { Reveal } from "@/components/ui/Reveal";

const STARS = [
  { left: "6%", top: "22%" },
  { left: "90%", top: "14%" },
  { left: "97%", top: "62%" },
  { left: "1%", top: "70%" },
  { left: "78%", top: "95%" },
];

interface HeroCrowProps {
  labels: { crow: string; replay: string; caption: string };
}

/** Hero stage: iridescent halo + ring, twinkling stars and the animated crow (click to replay the landing). */
export function HeroCrow({ labels }: HeroCrowProps) {
  const crow = useRef<CrowSpriteHandle>(null);

  return (
    <Reveal className="stage" delay={120}>
      <div className="stage-halo" />
      <div className="stage-ring" />
      <div className="stage-disc" />
      {STARS.map((position) => (
        <i key={`${position.left}-${position.top}`} className="star" style={position} />
      ))}
      <button type="button" className="crow-btn" aria-label={labels.replay} onClick={() => crow.current?.replay()}>
        <CrowSprite ref={crow} label={labels.crow} />
      </button>
      <p className="stage-cap" aria-hidden="true">
        <b>&gt;</b> {labels.caption}
      </p>
    </Reveal>
  );
}
