"use client";

import { useEffect, useRef, useState } from "react";
import type { CareerDemoContent } from "@content/career-demos";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { REDUCED_MOTION_QUERY } from "@/lib/media";
import { wait } from "./shared";

type NodeId = "event" | "queue" | "lambda" | "hook";
type Status = "idle" | "processing" | "failed" | "ok";
type Flash = "hit" | "fail";

interface View {
  queued: number;
  done: number;
  replayed: number;
  status: Status;
  flashes: Partial<Record<NodeId, Flash>>;
}

const QUEUE_SLOTS = 4;
/** Every fourth message fails once and is replayed. */
const FAIL_EVERY = 4;

/**
 * Case 06: event → queue → Lambda → hook. Messages travel along the tracks; a failed one goes back
 * to the queue. Runs by itself while visible, and on demand with the button.
 */
export function ServerlessDemo({ t }: { t: CareerDemoContent<"serverless"> }) {
  const [view, setView] = useState<View>({ queued: 2, done: 0, replayed: 0, status: "idle", flashes: {} });
  const root = useRef<HTMLDivElement>(null);
  const tracks = useRef<Array<HTMLDivElement | null>>([]);
  const emitRef = useRef<() => void>(() => {});

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY);

    let alive = true;
    let queued = 2;
    let done = 0;
    let replayed = 0;
    let handled = 0;
    let status: Status = "idle";
    let busy = false;
    let visible = false;
    let timer = 0;
    const flashes: Partial<Record<NodeId, Flash>> = {};

    const sync = () => {
      if (alive) setView({ queued, done, replayed, status, flashes: { ...flashes } });
    };
    const flash = (node: NodeId, kind: Flash = "hit", ms = 420) => {
      flashes[node] = kind;
      sync();
      setTimeout(() => {
        if (flashes[node] === kind) delete flashes[node];
        sync();
      }, ms);
    };
    /** Sends a packet along a track (backwards and red when a message is replayed). */
    const move = (index: number, { back = false, bad = false } = {}): Promise<void> => {
      const track = tracks.current[index];
      if (reduce.matches || !track || !alive) return wait(260);
      const packet = document.createElement("i");
      packet.className = bad ? "pk bad" : "pk";
      track.appendChild(packet);
      const width = track.clientWidth - 10;
      const from = `translateX(${back ? width : 0}px)`;
      const to = `translateX(${back ? 0 : width}px)`;
      const remove = () => packet.remove();
      return packet
        .animate(
          [
            { transform: from, opacity: 0.2 },
            { opacity: 1, offset: 0.2 },
            { opacity: 1, offset: 0.8 },
            { transform: to, opacity: 0.2 },
          ],
          { duration: 620, easing: "cubic-bezier(.77,0,.175,1)" },
        )
        .finished.then(remove, remove);
    };

    const pump = async () => {
      if (busy || !queued || !alive) return;
      busy = true;
      queued--;
      sync();
      await move(1);
      status = "processing";
      flash("lambda", "hit", 520);
      await wait(480);
      if (++handled % FAIL_EVERY === 0) {
        status = "failed";
        flash("lambda", "fail", 700);
        replayed++;
        await move(1, { back: true, bad: true });
        queued++;
      } else {
        status = "ok";
        sync();
        await move(2);
        done++;
        flash("hook");
      }
      sync();
      busy = false;
      if (queued) void pump();
      else
        setTimeout(() => {
          if (busy) return;
          status = "idle";
          sync();
        }, 900);
    };

    const emit = async () => {
      flash("event");
      await move(0);
      queued++;
      flash("queue", "hit", 300);
      void pump();
    };
    emitRef.current = () => void emit();

    const auto = () => {
      window.clearInterval(timer);
      if (!visible || reduce.matches || document.hidden) return;
      void pump();
      timer = window.setInterval(() => {
        if (queued < QUEUE_SLOTS) void emit();
      }, 2600);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
        auto();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", auto);
    reduce.addEventListener("change", auto);

    return () => {
      alive = false;
      window.clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", auto);
      reduce.removeEventListener("change", auto);
    };
  }, []);

  const node = (id: NodeId) => cn("fn", view.flashes[id]);
  const track = (index: number) => (
    <div
      className="ft-t"
      ref={(element) => {
        tracks.current[index] = element;
      }}
    />
  );

  return (
    <div className="d6" ref={root}>
      <div className="flow" role="img" aria-label={t.flowLabel}>
        <div className={node("event")}>
          <span className="fn-b">
            <svg viewBox="0 0 24 24">
              <path d="M13 3 5 13.5h6L10 21l9-11.5h-6z" />
            </svg>
          </span>
          <b>{t.nodes.event.title}</b>
          <span>{t.nodes.event.sub}</span>
        </div>
        {track(0)}
        <div className={node("queue")}>
          <span className="fn-b">
            <span className="fn-q">
              {Array.from({ length: QUEUE_SLOTS }, (_, index) => (
                <i key={index} className={cn(index < Math.min(view.queued, QUEUE_SLOTS) && "f")} />
              ))}
            </span>
          </span>
          <b>{t.nodes.queue.title}</b>
          <span>{t.nodes.queue.sub}</span>
        </div>
        {track(1)}
        <div className={node("lambda")}>
          <span className="fn-b">
            <svg viewBox="0 0 24 24">
              <path d="M6 20h4l5-11 2 5h2M6 4h4l2 5" />
            </svg>
          </span>
          <b>{t.nodes.lambda.title}</b>
          <span>{t.status[view.status]}</span>
        </div>
        {track(2)}
        <div className={node("hook")}>
          <span className="fn-b">
            <svg viewBox="0 0 24 24">
              <path d="M9 6a3 3 0 1 1 5.6 1.5L12 12M7.5 12.5a3 3 0 1 0 3 4.5h5M17.5 20a3 3 0 1 0-2-5.3L12 9" />
            </svg>
          </span>
          <b>{t.nodes.hook.title}</b>
          <span>{t.nodes.hook.sub}</span>
        </div>
      </div>

      <div className="d6-b">
        <p className="d6-c d-note" aria-live="off">
          <span>
            {t.counters.queued} <b>{view.queued}</b>
          </span>
          <span>
            {t.counters.done} <b>{view.done}</b>
          </span>
          <span>
            {t.counters.replayed} <b>{view.replayed}</b>
          </span>
        </p>
        <button type="button" className="dbtn" onClick={() => emitRef.current()}>
          <Icon name="bolt" />
          {t.send}
        </button>
      </div>
    </div>
  );
}
