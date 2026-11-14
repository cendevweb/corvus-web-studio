"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/i18n/navigation";

interface ContactWhoProps {
  groupLabel: string;
  options: Array<{ key: string; chip: string; cta: string }>;
}

/** Request-type chips: the call to action adapts to who is writing. */
export function ContactWho({ groupLabel, options }: ContactWhoProps) {
  const [active, setActive] = useState(options[0]?.key);
  const current = options.find((option) => option.key === active) ?? options[0];

  return (
    <>
      <div className="who" role="group" aria-label={groupLabel}>
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            className="chip"
            aria-pressed={option.key === active}
            onClick={() => setActive(option.key)}
          >
            {option.chip}
          </button>
        ))}
      </div>
      <Link className="btn btn-main" href="/contact">
        <span>{current?.cta}</span>
        <Icon name="arrow" className="arr" />
      </Link>
    </>
  );
}
