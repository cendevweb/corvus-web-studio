import { site } from "@content/site";
import {
  CONTACT_FIELDS,
  EXTRA_MAX,
  HONEYPOT_FIELD,
  isContactType,
  validateContactField,
  type ContactField,
  type ContactFieldError,
  type ContactResponse,
  type ContactType,
} from "@/lib/contact";

/**
 * Contact form endpoint: validates the message and sends it to the studio mailbox through Resend.
 *
 * Environment (see .env.example):
 *   RESEND_API_KEY      Resend API key. Without it the endpoint answers 503 and logs, nothing crashes.
 *   CONTACT_TO_EMAIL    Mailbox that receives the messages (never exposed to the browser).
 *   CONTACT_FROM_EMAIL  Optional sender on a domain verified in Resend. Defaults to Resend's test sender.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = `${site.name} <onboarding@resend.dev>`;
const MAX_BODY_BYTES = 16_000;
const MAX_EXTRAS = 4;

/** Best-effort throttle per IP (per server instance): 5 messages per 10 minutes. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

const TYPE_LABELS: Record<ContactType, string> = {
  recruiting: "Recrutement",
  freelance: "Freelance",
  press: "Presse",
  player: "Joueur",
};

const json = (body: ContactResponse, status = 200) => Response.json(body, { status });

const text = (value: unknown, max: number): string => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** Single-line value, safe for a mail header (subject, display name). */
const oneLine = (value: string): string => value.replace(/[\r\n\t]+/g, " ").trim();

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "invalid" }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  // Honeypot filled in: a bot. Answer "sent" without sending anything.
  if (typeof body[HONEYPOT_FIELD] === "string" && body[HONEYPOT_FIELD].trim() !== "") {
    return json({ ok: true });
  }

  const values: Record<ContactField, string> = {
    name: text(body.name, 500),
    email: text(body.email, 500),
    message: text(body.message, 5000),
  };
  const fields: Partial<Record<ContactField, ContactFieldError>> = {};
  for (const field of CONTACT_FIELDS) {
    const error = validateContactField(field, values[field]);
    if (error) fields[field] = error;
  }
  if (!isContactType(body.type) || Object.keys(fields).length > 0) {
    return json({ ok: false, error: "invalid", fields }, 422);
  }
  const type = body.type;

  const extras = (Array.isArray(body.extras) ? body.extras : [])
    .slice(0, MAX_EXTRAS)
    .map((entry) => {
      const item = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
      return { label: oneLine(text(item.label, 80)), value: oneLine(text(item.value, EXTRA_MAX)) };
    })
    .filter((entry) => entry.label && entry.value);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error(
      `[contact] Message not sent: ${!apiKey ? "RESEND_API_KEY" : "CONTACT_TO_EMAIL"} is not configured (see .env.example).`,
    );
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const locale = body.locale === "en" ? "en" : "fr";
  const name = oneLine(values.name);
  const rows: Array<[string, string]> = [
    ["Type", TYPE_LABELS[type]],
    ["Nom", name],
    ["E-mail", values.email],
    ...extras.map((entry): [string, string] => [entry.label, entry.value]),
    ["Langue du site", locale],
  ];

  const plain = `${rows.map(([label, value]) => `${label} : ${value}`).join("\n")}\n\n${values.message}\n`;
  const html = `<table cellpadding="4" style="font:14px/1.5 system-ui,sans-serif">${rows
    .map(([label, value]) => `<tr><td style="color:#666">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table><p style="font:15px/1.6 system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(values.message)}</p>`;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: to
          .split(",")
          .map((address) => address.trim())
          .filter(Boolean),
        reply_to: values.email,
        subject: `[${site.name}] ${TYPE_LABELS[type]} · ${name}`.slice(0, 200),
        text: plain,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[contact] Resend answered ${response.status}: ${detail.slice(0, 500)}`);
      return json({ ok: false, error: "send_failed" }, 502);
    }
  } catch (error) {
    console.error("[contact] Resend request failed:", error);
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true });
}
