"use client";

import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import type { CareerDemoContent } from "@content/career-demos";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/media";
import { Segmented, wait } from "./shared";

type Format = "image" | "video";

function Avatar() {
  return <Image src="/images/brand/corbeau-logo.png" alt="" width={51} height={38} />;
}

/** Case 01: a tweet goes in, a framed capture (image or video) comes out. The pipeline can be replayed. */
export function ScreenshotBotDemo({ t }: { t: CareerDemoContent<"screenshot-bot"> }) {
  const [format, setFormat] = useState<Format>("image");
  const [lit, setLit] = useState(t.steps.length);
  const [busy, setBusy] = useState(false);
  const [runId, setRunId] = useState(0);
  const token = useRef(0);

  const run = async () => {
    const current = ++token.current;
    setBusy(true);
    setLit(0);
    setRunId((id) => id + 1);
    for (let step = 1; step <= t.steps.length; step++) {
      setLit(step);
      await wait(prefersReducedMotion() ? 120 : 380);
      if (current !== token.current) return;
    }
    setBusy(false);
  };

  const changeFormat = (next: Format) => {
    setFormat(next);
    void run();
  };

  return (
    <div className={cn("d1", busy && "busy")} data-s={format}>
      {/* Remounted on every run so the scan animation restarts. */}
      <div className={cn("tw", runId > 0 && "sweep")} key={runId} aria-hidden="true">
        <div className="tw-h">
          <Avatar />
          <div>
            <b>{t.tweet.name}</b>
            <span>
              {t.tweet.handle} · {t.tweet.time}
            </span>
          </div>
        </div>
        <p>{t.tweet.text}</p>
        <div className="tw-a">
          <i />
          <i />
          <i />
        </div>
      </div>

      <ol className="d1-pipe" aria-label={t.stepsLabel}>
        {t.steps.map((step, index) => (
          <Fragment key={step}>
            {index > 0 && (
              <li className="ar" aria-hidden="true">
                <Icon name="arrow" />
              </li>
            )}
            <li className={cn(index < lit && "on")}>{step}</li>
          </Fragment>
        ))}
      </ol>

      <div>
        <div className="d1-out" role="img" aria-label={t.outputLabel}>
          <div className="tw">
            <div className="tw-h">
              <Avatar />
              <div>
                <b>{t.tweet.name}</b>
                <span>{t.tweet.handle}</span>
              </div>
            </div>
            <p>{t.tweet.text}</p>
          </div>
          <span className="d1-crop" />
          <span className="d1-vid">
            <Icon name="play" />
            <span>
              <i />
            </span>
          </span>
        </div>
        <p className="d1-file">{t.files[format]}</p>
      </div>

      <div className="d1-ctl">
        <Segmented
          label={t.formatLabel}
          value={format}
          onChange={changeFormat}
          options={[
            { value: "image", label: t.formats.image },
            { value: "video", label: t.formats.video },
          ]}
        />
        <button type="button" className="dbtn" onClick={() => void run()}>
          <Icon name="play" />
          {t.run}
        </button>
      </div>
    </div>
  );
}
