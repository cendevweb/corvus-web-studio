"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CrowSprite } from "@/components/ui/CrowSprite";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  CONTACT_FIELDS,
  CONTACT_TYPES,
  EXTRA_FIELDS,
  EXTRA_MAX,
  HONEYPOT_FIELD,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  validateContactField,
  type ContactErrorCode,
  type ContactField,
  type ContactFieldError,
  type ContactPayload,
  type ContactResponse,
  type ContactType,
  type ExtraField,
} from "@/lib/contact";
import { prefersReducedMotion } from "@/lib/media";
import { useContactType } from "./ContactType";
import { ContactIcon } from "./icons";

/** Options of the <select> extras; the others are free text. */
const SELECT_OPTIONS = {
  project: ["saas", "game", "realtime", "ai", "other"],
  game: ["one-piexel", "fastr", "iconic", "all"],
  topic: ["bug", "idea", "gg"],
} as const;
type SelectField = keyof typeof SELECT_OPTIONS;
type TextExtra = Exclude<ExtraField, SelectField>;

const isSelect = (field: ExtraField): field is SelectField => field in SELECT_OPTIONS;

/** Player feedback always states the game and the topic; the other extras are optional. */
const OPTIONAL_TYPES: readonly ContactType[] = ["recruiting", "freelance", "press"];

const FIELD_IDS: Record<ContactField, string> = { name: "f-name", email: "f-email", message: "f-message" };
const SWAP_MS = 220;

type Errors = Record<ContactField, ContactFieldError | null>;
const NO_ERRORS: Errors = { name: null, email: null, message: null };
const EMPTY = { name: "", email: "", message: "" };

/** form → (fade out) → sent, and back. `*-out` / `*-in` are the blurred halves of the cross-fade. */
type Phase = "form" | "form-out" | "sent-in" | "sent" | "sent-out" | "form-in";

/**
 * Contact form: request type with its conditional fields, validation messages that say what to fix,
 * error summary, honeypot, and a success pane where the crow lands. Posts to /api/contact.
 */
export function ContactForm() {
  const t = useTranslations("contactPage.form");
  const ok = useTranslations("contactPage.ok");
  const locale = useLocale();
  const { type, setType } = useContactType();

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>(NO_ERRORS);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<ContactErrorCode | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [sent, setSent] = useState<{ type: ContactType; email: string } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (callback: () => void, ms: number) => {
    timers.current.push(setTimeout(callback, ms));
  };

  const check = (field: ContactField, value: string) => {
    const error = validateContactField(field, value);
    setErrors((current) => ({ ...current, [field]: error }));
    return error;
  };

  const onChange = (field: ContactField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Like the mockup: a field is only re-validated while typing once it is flagged.
    if (errors[field]) check(field, value);
  };

  const onBlur = (field: ContactField) => {
    if (tried || values[field]) check(field, values[field]);
  };

  const errorText = (field: ContactField): string => {
    const error = errors[field];
    if (!error) return "";
    if (error === "nameMissing" && type === "player") return t("errors.handleMissing");
    if (error === "messageShort") {
      return t("errors.messageShort", {
        min: MESSAGE_MIN,
        missing: Math.max(1, MESSAGE_MIN - values.message.trim().length),
      });
    }
    return t(`errors.${error}`);
  };

  const invalid = CONTACT_FIELDS.filter((field) => errors[field]);
  const showSummary = tried && invalid.length > 0;

  const focusBox = (box: HTMLElement | null) => {
    if (!box) return;
    box.focus({ preventScroll: true });
    box.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  /** Cross-fade between the form and the success pane (instant with reduced motion). */
  const swap = (to: "sent" | "form") => {
    const wait = prefersReducedMotion() ? 0 : SWAP_MS;
    setPhase(to === "sent" ? "form-out" : "sent-out");
    later(() => {
      setPhase(to === "sent" ? "sent-in" : "form-in");
      later(() => {
        setPhase(to);
        if (to === "sent") sentRef.current?.focus({ preventScroll: true });
      }, 30);
    }, wait);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setTried(true);
    setFailure(null);

    const next: Errors = { ...NO_ERRORS };
    for (const field of CONTACT_FIELDS) next[field] = validateContactField(field, values[field]);
    setErrors(next);
    if (CONTACT_FIELDS.some((field) => next[field])) {
      requestAnimationFrame(() => focusBox(summaryRef.current));
      return;
    }

    // Disabled (hidden) extras are not part of FormData: only the active type's fields are sent.
    const data = new FormData(event.currentTarget);
    const extras: ContactPayload["extras"] = [];
    for (const field of EXTRA_FIELDS[type]) {
      const value = String(data.get(field) ?? "").trim();
      if (!value) continue;
      extras.push({
        label: t(`extras.${field}.label`),
        value: isSelect(field) ? selectLabel(field, value) : value,
      });
    }
    const payload: ContactPayload = {
      type,
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      extras,
      locale,
      [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? ""),
    };

    setSending(true);
    let result: ContactResponse;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      result = ((await response.json().catch(() => null)) as ContactResponse | null) ?? {
        ok: false,
        error: "send_failed",
      };
    } catch {
      result = { ok: false, error: "send_failed" };
    }
    setSending(false);

    if (result.ok) {
      setSent({ type, email: payload.email });
      swap("sent");
      return;
    }
    if (result.error === "invalid" && result.fields && Object.keys(result.fields).length > 0) {
      setErrors({ ...NO_ERRORS, ...result.fields });
      requestAnimationFrame(() => focusBox(summaryRef.current));
      return;
    }
    setFailure(result.error);
    requestAnimationFrame(() => focusBox(failureRef.current));
  };

  const selectLabel = (field: SelectField, value: string): string => {
    const options: readonly string[] = SELECT_OPTIONS[field];
    // `value` comes from our own <option> list; anything else is dropped.
    return options.includes(value) ? t(`extras.${field}.options.${value}` as never) : "";
  };

  const onAgain = () => {
    formRef.current?.reset();
    setValues(EMPTY);
    setErrors(NO_ERRORS);
    setTried(false);
    setFailure(null);
    swap("form");
  };

  const showForm = phase === "form" || phase === "form-out" || phase === "form-in";
  const optional = OPTIONAL_TYPES.includes(type) ? <small>{t("optional")}</small> : null;

  const textExtra = (field: TextExtra, props?: { type?: "url"; autoComplete?: string }) => (
    <label className="fld" key={field}>
      <span className="lab">
        {t(`extras.${field}.label`)} {optional}
      </span>
      <input
        className="inp"
        name={field}
        maxLength={EXTRA_MAX}
        placeholder={t(`extras.${field}.placeholder`)}
        disabled={!EXTRA_FIELDS[type].some((active) => active === field)}
        inputMode={props?.type === "url" ? "url" : undefined}
        {...props}
      />
    </label>
  );

  const selectExtra = (field: SelectField, isOptional: boolean) => (
    <label className="fld" key={field}>
      <span className="lab">
        {t(`extras.${field}.label`)} {isOptional && <small>{t("optional")}</small>}
      </span>
      <select className="inp" name={field} disabled={!EXTRA_FIELDS[type].some((active) => active === field)}>
        {SELECT_OPTIONS[field].map((option) => (
          <option key={option} value={option}>
            {t(`extras.${field}.options.${option}` as never)}
          </option>
        ))}
      </select>
    </label>
  );

  const fieldError = (field: ContactField) => {
    const message = errorText(field);
    return (
      <span className="err" id={`e-${field}`} data-on={message ? "" : undefined}>
        <ContactIcon name="warn" />
        <span>{message}</span>
      </span>
    );
  };

  return (
    <>
      <form
        ref={formRef}
        className={cn("pane", phase !== "form" && "out")}
        hidden={!showForm}
        noValidate
        onSubmit={onSubmit}
      >
        <div className="sum" ref={summaryRef} role="alert" tabIndex={-1} hidden={!showSummary}>
          <b>
            <ContactIcon name="warn" />
            <span>{t("errors.summary", { count: invalid.length })}</span>
          </b>
          <ul>
            {invalid.map((field) => (
              <li key={field}>
                <a
                  href={`#${FIELD_IDS[field]}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(FIELD_IDS[field])?.focus();
                  }}
                >
                  {t(`fields.${field}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="sum" ref={failureRef} role="alert" tabIndex={-1} hidden={!failure}>
          <b>
            <ContactIcon name="warn" />
            <span>{t("failure.title")}</span>
          </b>
          <p>{failure && t(`failure.${failure}`)}</p>
        </div>

        <span className="fstep" aria-hidden="true">
          {t("steps.request")}
        </span>
        <fieldset>
          <legend>{t("typeLegend")}</legend>
          <div className="types">
            {CONTACT_TYPES.map((key) => (
              <label className="type" key={key}>
                <input type="radio" name="type" value={key} checked={type === key} onChange={() => setType(key)} />
                <span>
                  <b>{t(`types.${key}.name`)}</b>
                  <small>{t(`types.${key}.hint`)}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="cond grid2" hidden={type !== "recruiting"}>
          {textExtra("company", { autoComplete: "organization" })}
          {textExtra("offer", { type: "url" })}
        </div>
        <div className="cond grid2" hidden={type !== "freelance"}>
          {selectExtra("project", true)}
          {textExtra("deadline")}
        </div>
        <div className="cond grid2" hidden={type !== "press"}>
          {textExtra("media")}
          {textExtra("pressDeadline")}
        </div>
        <div className="cond grid2" hidden={type !== "player"}>
          {selectExtra("game", false)}
          {selectExtra("topic", false)}
        </div>

        <span className="fstep" aria-hidden="true">
          {t("steps.details")}
        </span>
        <div className="grid2">
          <label className="fld">
            <span className="lab">
              {t("fields.name")} {type === "player" && <small>{t("fields.nameAlt")}</small>}
            </span>
            <input
              className="inp"
              id={FIELD_IDS.name}
              name="name"
              autoComplete="name"
              required
              maxLength={NAME_MAX}
              value={values.name}
              onChange={(event) => onChange("name", event.target.value)}
              onBlur={() => onBlur("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="e-name"
              placeholder={t(`types.${type}.namePlaceholder`)}
            />
            {fieldError("name")}
          </label>
          <label className="fld">
            <span className="lab">{t("fields.email")}</span>
            <input
              className="inp"
              id={FIELD_IDS.email}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              required
              value={values.email}
              onChange={(event) => onChange("email", event.target.value)}
              onBlur={() => onBlur("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby="e-email"
              placeholder={t("fields.emailPlaceholder")}
            />
            {fieldError("email")}
          </label>
        </div>

        <span className="fstep" aria-hidden="true">
          {t("steps.message")}
        </span>
        <label className="fld">
          <span className="lab">{t("fields.message")}</span>
          <textarea
            className="inp"
            id={FIELD_IDS.message}
            name="message"
            required
            minLength={MESSAGE_MIN}
            maxLength={MESSAGE_MAX}
            value={values.message}
            onChange={(event) => onChange("message", event.target.value)}
            onBlur={() => onBlur("message")}
            aria-invalid={Boolean(errors.message)}
            aria-describedby="e-message h-message"
            placeholder={t(`types.${type}.messagePlaceholder`)}
          />
          {fieldError("message")}
          <span className="help" id="h-message">
            <span>{t(`types.${type}.tip`)}</span>
            <output>{t("counter", { count: values.message.length, max: MESSAGE_MAX })}</output>
          </span>
        </label>

        <div className="hp" aria-hidden="true">
          <label>
            {t("honeypot")}
            <input name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="send">
          <button className="btn btn-main btn-send" type="submit" aria-busy={sending || undefined}>
            <span>{sending ? t("sending") : t(`types.${type}.submit`)}</span>
            <Icon name="arrow" className="arr" />
            <i className="spin" aria-hidden="true" />
          </button>
          <p>{t("privacy")}</p>
        </div>
      </form>

      <div ref={sentRef} className={cn("pane okp", phase !== "sent" && "out")} tabIndex={-1} hidden={showForm}>
        {/* Mounted with the pane: the crow plays its landing when the message is sent. */}
        {!showForm && <CrowSprite label={ok("crowAlt")} />}
        <h2>{ok.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h2>
        {sent && (
          <>
            <p>{t(`types.${sent.type}.ok`)}</p>
            <dl className="recap">
              <dt>{ok("request")}</dt>
              <dd>{t(`types.${sent.type}.name`)}</dd>
              <dt>{ok("replyTo")}</dt>
              <dd>{sent.email}</dd>
              <dt>{ok("delay")}</dt>
              <dd>{ok("delayValue")}</dd>
            </dl>
          </>
        )}
        <div>
          <button className="btn btn-ghost" type="button" onClick={onAgain}>
            {ok("again")}
          </button>
        </div>
      </div>
      <p className="sr" role="status">
        {phase === "sent" ? ok("announce") : ""}
      </p>
    </>
  );
}
