"use client";

import { useTranslations } from "next-intl";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isContactType, type ContactType } from "@/lib/contact";

interface ContactTypeState {
  type: ContactType;
  setType: (type: ContactType) => void;
}

const ContactTypeContext = createContext<ContactTypeState | null>(null);

/** `?type=` values accepted in links to the contact page (French aliases included). */
const ALIASES: Record<string, ContactType> = {
  recrutement: "recruiting",
  mission: "freelance",
  presse: "press",
  joueur: "player",
};

/**
 * Shares the selected request type between the form and the side column
 * (the reply-time note adapts to it). A `?type=freelance` query preselects a type.
 */
export function ContactTypeProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<ContactType>("recruiting");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("type") ?? "";
    const preset = isContactType(requested) ? requested : ALIASES[requested];
    if (!preset) return;
    // After hydration, so the static HTML (default type) and the first client render match.
    const frame = requestAnimationFrame(() => setType(preset));
    return () => cancelAnimationFrame(frame);
  }, []);

  const value = useMemo(() => ({ type, setType }), [type]);
  return <ContactTypeContext value={value}>{children}</ContactTypeContext>;
}

export function useContactType(): ContactTypeState {
  const state = useContext(ContactTypeContext);
  if (!state) throw new Error("useContactType must be used inside <ContactTypeProvider>");
  return state;
}

/** Side-column sentence describing what the reply looks like for the selected request type. */
export function DelayNote() {
  const { type } = useContactType();
  const t = useTranslations("contactPage.form.types");
  return (
    <p className="delay-note" aria-live="polite">
      {t(`${type}.delay`)}
    </p>
  );
}
