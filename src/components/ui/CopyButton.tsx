"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface CopyButtonProps {
  /** Text placed on the clipboard. */
  text: string;
  labels: { idle: string; copied: string; failed: string };
  /** Small note after the label ("MIT"). */
  note?: string;
  className?: string;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for insecure contexts / older browsers.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

/** Copies a snippet and confirms for 1.6s (announced politely to screen readers). */
export function CopyButton({ text, labels, note, className }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    const ok = await copyToClipboard(text);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  };

  return (
    <button type="button" className={cn("copy", state === "copied" && "done", className)} onClick={onClick}>
      <Icon name="copy" className="cp" />
      <Icon name="check" className="ok" />
      <span aria-live="polite">{labels[state]}</span>
      {note && <small>{note}</small>}
    </button>
  );
}
