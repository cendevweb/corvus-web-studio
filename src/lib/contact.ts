/**
 * Contact form rules shared by the browser (components/contact/ContactForm.tsx)
 * and the server (app/api/contact/route.ts). No UI text here: errors are codes.
 */

export const CONTACT_TYPES = ["recruiting", "freelance", "press", "player"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const isContactType = (value: unknown): value is ContactType =>
  typeof value === "string" && (CONTACT_TYPES as readonly string[]).includes(value);

/** Optional fields shown for each request type (the others are neither displayed nor sent). */
export const EXTRA_FIELDS = {
  recruiting: ["company", "offer"],
  freelance: ["project", "deadline"],
  press: ["media", "pressDeadline"],
  player: ["game", "topic"],
} as const satisfies Record<ContactType, readonly string[]>;

export type ExtraField = (typeof EXTRA_FIELDS)[ContactType][number];

export const NAME_MIN = 2;
export const NAME_MAX = 120;
export const EMAIL_MAX = 254;
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;
export const EXTRA_MAX = 300;

/** Name of the honeypot input: hidden from people, filled in by naive bots. */
export const HONEYPOT_FIELD = "website";

export const CONTACT_FIELDS = ["name", "email", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactFieldError = "nameMissing" | "emailMissing" | "emailNoTld" | "emailInvalid" | "messageShort";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_WITHOUT_TLD = /@[^\s@.]+$/;

/** Returns the error code of a required field, or null when it is valid. */
export function validateContactField(field: ContactField, value: string): ContactFieldError | null {
  const text = value.trim();
  switch (field) {
    case "name":
      return text.length < NAME_MIN || text.length > NAME_MAX ? "nameMissing" : null;
    case "email":
      if (!text) return "emailMissing";
      if (text.length > EMAIL_MAX || !EMAIL_PATTERN.test(text)) {
        return EMAIL_WITHOUT_TLD.test(text) ? "emailNoTld" : "emailInvalid";
      }
      return null;
    case "message":
      return text.length < MESSAGE_MIN || text.length > MESSAGE_MAX ? "messageShort" : null;
  }
}

export interface ContactPayload {
  type: ContactType;
  name: string;
  email: string;
  message: string;
  /** Answers to the optional fields of the request type, already labelled for the reader. */
  extras: Array<{ label: string; value: string }>;
  locale: string;
  /** Honeypot. */
  [HONEYPOT_FIELD]?: string;
}

export type ContactErrorCode = "invalid" | "not_configured" | "send_failed" | "rate_limited";

export type ContactResponse =
  | { ok: true }
  | { ok: false; error: ContactErrorCode; fields?: Partial<Record<ContactField, ContactFieldError>> };
