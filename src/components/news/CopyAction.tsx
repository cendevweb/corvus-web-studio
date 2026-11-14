"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface CopyActionProps {
  /** What to copy: a literal text, the text of an element (by id), or the URL of the page. */
  source: { text: string } | { elementId: string } | { page: true };
  label: string;
  copiedLabel: string;
  /** Accessible name when the visible label is too short ("Copier" → "Copier la liste des changements"). */
  ariaLabel?: string;
  className?: string;
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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

/** Copy button of the article and Nid pages: the two labels cross-fade with a slight blur. */
export function CopyAction({ source, label, copiedLabel, ariaLabel, className }: CopyActionProps) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    const text =
      "text" in source
        ? source.text
        : "elementId" in source
          ? (document.getElementById(source.elementId)?.innerText.trim() ?? "")
          : window.location.href.split("#")[0]!;
    if (!(await writeClipboard(text))) return;
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1600);
  };

  return (
    <button type="button" className={cn("cpy", done && "done", className)} aria-label={ariaLabel} onClick={onClick}>
      <span className="def">
        <Icon name="copy" />
        {label}
      </span>
      <span className="ok" aria-hidden="true">
        <Icon name="check" />
        {copiedLabel}
      </span>
      <span className="sr" role="status">
        {done ? copiedLabel : ""}
      </span>
    </button>
  );
}
