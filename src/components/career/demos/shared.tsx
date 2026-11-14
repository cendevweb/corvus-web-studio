"use client";

import { useEffect, type RefObject } from "react";

interface SegmentedProps<Value extends string> {
  label: string;
  value: Value;
  options: ReadonlyArray<{ value: Value; label: string }>;
  onChange: (value: Value) => void;
}

/** Segmented control shared by the demos (image/video, before/after). */
export function Segmented<Value extends string>({ label, value, options, onChange }: SegmentedProps<Value>) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Calls back whenever the element enters or leaves the viewport (35% visible), so nothing animates off-screen. */
export function useVisibility(ref: RefObject<Element | null>, onChange: (visible: boolean) => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => onChange(entry.isIntersecting)),
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
    // The callback is read at subscription time only: demos pass stable handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
