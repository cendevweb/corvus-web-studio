"use client";

import Image from "next/image";
import { useFormatter, useLocale } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { prefersReducedMotion } from "@/lib/media";
import { useGamesT } from "../t";

const PENALTIES = ["none", "wall", "freeze", "clouds"] as const;
type Penalty = (typeof PENALTIES)[number];

/** Demo dictionary: first-generation Pokémon, under the names of each language. */
const NAMES = {
  fr: [
    "Pikachu", "Raichu", "Salamèche", "Dracaufeu", "Carapuce", "Tortank", "Bulbizarre", "Florizarre",
    "Évoli", "Mew", "Mewtwo", "Ronflex", "Rondoudou", "Psykokwak", "Magicarpe", "Ectoplasma",
    "Miaouss", "Rattata", "Roucool", "Abra", "Onix", "Lokhlass", "Dracolosse", "Léviator",
  ],
  en: [
    "Pikachu", "Raichu", "Charmander", "Charizard", "Squirtle", "Blastoise", "Bulbasaur", "Venusaur",
    "Eevee", "Mew", "Mewtwo", "Snorlax", "Jigglypuff", "Psyduck", "Magikarp", "Gengar",
    "Meowth", "Rattata", "Pidgey", "Abra", "Onix", "Lapras", "Dragonite", "Gyarados",
  ],
} as const;

/** Same rules as the game: the wall keeps 4 characters, the freeze delays each keystroke by 650 ms. */
const WALL_LENGTH = 4;
const FREEZE_MS = 650;
const MAX_LENGTH = 24;

type Message =
  | { key: "penalty" }
  | { key: "unknown"; word: string }
  | { key: "duplicate"; word: string }
  | { key: "valid"; word: string; bonus: number; typo: boolean };

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}

/** Fastr demo: type words on a theme, then switch a penalty on and try again. */
export function FastrMalusDemo() {
  const t = useGamesT("demos.fastr");
  const format = useFormatter();
  const locale = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const penaltyRef = useRef<Penalty>("none");
  const pending = useRef(new Set<ReturnType<typeof setTimeout>>());
  const [penalty, setPenalty] = useState<Penalty>("none");
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<Message>({ key: "penalty" });
  const [animate, setAnimate] = useState(false);

  // Keystrokes are intercepted natively: `beforeinput` carries the typed text and can be cancelled.
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const timers = pending.current;
    const onBeforeInput = (event: InputEvent) => {
      if (penaltyRef.current !== "freeze" || event.inputType !== "insertText" || !event.data) return;
      event.preventDefault();
      const text = event.data;
      const id = setTimeout(() => {
        timers.delete(id);
        el.value = (el.value + text).slice(0, MAX_LENGTH);
      }, FREEZE_MS);
      timers.add(id);
    };
    const onInput = () => {
      if (penaltyRef.current === "wall" && el.value.length > WALL_LENGTH) el.value = el.value.slice(0, WALL_LENGTH);
    };
    el.addEventListener("beforeinput", onBeforeInput);
    el.addEventListener("input", onInput);
    return () => {
      el.removeEventListener("beforeinput", onBeforeInput);
      el.removeEventListener("input", onInput);
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const choose = (next: Penalty) => {
    penaltyRef.current = next;
    setPenalty(next);
    pending.current.forEach(clearTimeout);
    pending.current.clear();
    const el = input.current;
    if (el && next === "wall") el.value = el.value.slice(0, WALL_LENGTH);
    setMessage({ key: "penalty" });
    el?.focus({ preventScroll: true });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const el = input.current;
    const typed = el?.value.trim() ?? "";
    const word = normalize(typed);
    if (!el || !word) return;
    const names: readonly string[] = NAMES[locale];
    const tolerance = word.length >= 12 ? 2 : 1;
    const hit =
      names.find((name) => normalize(name) === word) ??
      names.find((name) => levenshtein(normalize(name), word) <= tolerance);
    if (!hit) return setMessage({ key: "unknown", word: typed });
    if (found.includes(hit)) return setMessage({ key: "duplicate", word: hit });
    const bonus = Math.max(0, 119 - found.length);
    setFound([...found, hit]);
    setScore(score + 100 + bonus);
    setAnimate(!prefersReducedMotion());
    setMessage({ key: "valid", word: hit, bonus, typo: normalize(hit) !== word });
    el.value = "";
  };

  const messageText =
    message.key === "penalty"
      ? t(`penalties.${penalty}.text`)
      : message.key === "valid"
        ? t(message.typo ? "validTypo" : "valid", { word: message.word, bonus: message.bonus })
        : t(message.key, { word: message.word });

  return (
    <>
      <div className="demo-hd">
        <h3 className="demo-t">{t("title")}</h3>
        <span className="demo-live">
          <i aria-hidden="true" />
          {t("live")}
        </span>
      </div>
      <p className="demo-p">{t("intro")}</p>
      <div className="mx-mal" role="group" aria-label={t("penaltyLabel")}>
        {PENALTIES.map((key) => (
          <button key={key} type="button" data-m={key} aria-pressed={penalty === key} onClick={() => choose(key)}>
            {t(`penalties.${key}.name`)}
          </button>
        ))}
      </div>
      <form className="mx-form" autoComplete="off" onSubmit={onSubmit}>
        <div className="mx-wrap" data-m={penalty}>
          <label className="sr" htmlFor="mx-word">
            {t("inputLabel")}
          </label>
          <input
            ref={input}
            id="mx-word"
            type="text"
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t("placeholder")}
            maxLength={MAX_LENGTH}
          />
          <div className="mx-brick" aria-hidden="true" />
          <Image className="mx-ice" src="/images/games/fastr/gel.png" width={900} height={300} alt="" sizes="(min-width: 980px) 900px, 100vw" />
        </div>
        <button className="gbtn a" type="submit">
          {t("submit")}
        </button>
      </form>
      <p
        className="mx-msg"
        role="status"
        data-k={message.key === "valid" ? "good" : message.key === "penalty" ? undefined : "bad"}
      >
        {messageText}
      </p>
      <div className="mx-foot" data-m={penalty}>
        <ul className="mx-list" aria-label={t("listLabel")}>
          {found.length === 0 && <li className="mx-empty">{t("empty")}</li>}
          {found.map((word, index) => (
            <li key={word} className={animate && index === found.length - 1 ? "new" : undefined}>
              {word}
            </li>
          ))}
        </ul>
        <p className="mx-score">
          {t("score")}
          <b>{format.number(score)}</b>
        </p>
        <div className="mx-cloud" aria-hidden="true" />
      </div>
    </>
  );
}
