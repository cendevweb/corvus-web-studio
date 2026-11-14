"use client";

import Image from "next/image";
import { useFormatter } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/media";
import { useGamesT } from "../t";

/** Three cards of the "Historical figures" set; `id` is the key of their texts in the messages. */
const CARDS = [
  {
    id: "screw",
    src: "/images/games/iconic/card-vis.jpg",
    answers: ["leonarddevinci", "devinci", "vinci", "leonard", "davinci", "leonardodavinci", "leonardo"],
  },
  { id: "elephant", src: "/images/games/iconic/card-elephant.jpg", answers: ["hannibal", "hannibalbarca"] },
  {
    id: "bicorne",
    src: "/images/games/iconic/card-bicorne.jpg",
    answers: ["napoleon", "napoleonbonaparte", "bonaparte", "napoleon1er", "napoleonier", "napoleoni"],
  },
] as const;

const STATES = ["draw", "input", "validation", "result", "save"] as const;
type MachineState = (typeof STATES)[number];
type Message =
  | { key: "question" | "hint" | "lost" }
  | { key: "found"; gain: number; streak: number };

interface View {
  card: number;
  tries: number;
  coins: number;
  streak: number;
  state: MachineState;
  /** Outcome shown in the "result" step. */
  result: "pending" | "found" | "missed";
  save: "idle" | "pending" | "synced";
  motion: "" | "swap" | "win";
  locked: boolean;
  message: Message;
}

const initialView: View = {
  card: 0,
  tries: 3,
  coins: 0,
  streak: 0,
  state: "input",
  result: "pending",
  save: "idle",
  motion: "",
  locked: false,
  message: { key: "question" },
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

const multiplier = (streak: number) => 1 + Math.max(0, streak - 1) * 0.1;

/** Iconic demo: a mini game driven by a state machine, like the real game-machine. */
export function IconicQuizDemo() {
  const t = useGamesT("demos.iconic");
  const format = useFormatter();
  const input = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  const busy = useRef(false);
  const [view, setView] = useState(initialView);
  const card = CARDS[view.card]!;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const patch = (changes: Partial<View>) => {
    if (alive.current) setView((current) => ({ ...current, ...changes }));
  };
  const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, prefersReducedMotion() ? Math.min(ms, 120) : ms));

  /** save → draw → next card, as the game does after each icon. */
  const next = async (from: number) => {
    patch({ state: "save", save: "pending" });
    await wait(700);
    patch({ save: "synced" });
    await wait(900);
    patch({ state: "draw", save: "idle", result: "pending", motion: "swap" });
    await wait(260);
    patch({ card: (from + 1) % CARDS.length, tries: 3 });
    await wait(120);
    patch({ motion: "" });
    await wait(300);
    if (input.current) input.current.value = "";
    patch({ state: "input", message: { key: "question" }, locked: false });
    busy.current = false;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const answer = normalize(input.current?.value ?? "");
    if (!answer || busy.current) return;
    busy.current = true;
    const { card: index, tries, coins, streak } = view;
    patch({ state: "validation" });
    await wait(320);

    if ((CARDS[index]!.answers as readonly string[]).includes(answer)) {
      const gain = Math.round(25 * multiplier(streak + 1));
      patch({
        streak: streak + 1,
        coins: coins + gain,
        state: "result",
        result: "found",
        motion: "win",
        locked: true,
        message: { key: "found", gain, streak: streak + 1 },
      });
      await wait(900);
      return next(index);
    }
    if (tries > 1) {
      patch({ tries: tries - 1, state: "input", message: { key: "hint" } });
      busy.current = false;
      input.current?.select();
      return;
    }
    patch({ tries: 0, streak: 0, state: "result", result: "missed", locked: true, message: { key: "lost" } });
    await wait(1500);
    return next(index);
  };

  const name = t(`cards.${card.id}.name`);
  const { message } = view;
  const messageText =
    message.key === "found"
      ? t(message.streak > 1 ? "foundStreak" : "found", { name, gain: message.gain, streak: message.streak })
      : message.key === "question"
        ? t(`cards.${card.id}.question`)
        : message.key === "hint"
          ? t("hint", { hint: t(`cards.${card.id}.hint`) })
          : t("lost", { name });

  const stateLabel = (state: MachineState) => {
    if (state === "result" && view.result !== "pending") return t(`result.${view.result}`);
    if (state === "save" && view.save !== "idle") return t(`save.${view.save}`);
    return t(`states.${state}`);
  };

  return (
    <>
      <div className="demo-hd">
        <h3 className="demo-t">{t("title")}</h3>
        <span className="demo-live">{t("live")}</span>
      </div>
      <div className="iq-grid">
        <div className={cn("iq-card", view.motion)}>
          <Image src={card.src} width={520} height={520} alt={t(`cards.${card.id}.alt`)} sizes="300px" />
          <span className="iq-b iq-coins">
            ICoins <b>{view.coins}</b>
          </span>
          <span className="iq-b iq-streak">
            {t("streak")} <b>{view.streak}</b>{" "}
            <small>
              ×{format.number(multiplier(view.streak), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </small>
          </span>
        </div>
        <div>
          <p className="demo-p">{t("intro")}</p>
          <form className="iq-form" autoComplete="off" onSubmit={onSubmit}>
            <label className="sr" htmlFor="iq-answer">
              {t("answer")}
            </label>
            <input
              ref={input}
              id="iq-answer"
              type="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t("placeholder")}
              maxLength={40}
              disabled={view.locked}
            />
            <button className="gbtn a" type="submit">
              {t("submit")}
            </button>
          </form>
          <p className="iq-row">
            <span>
              {t("tries")}
              <span className="iq-tries" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <i key={index} className={index >= view.tries ? "off" : undefined} />
                ))}
              </span>
              <span className="sr">{t("triesLeft", { count: view.tries })}</span>
            </span>
            <span>{t("reward")}</span>
          </p>
          <p
            className="iq-msg"
            role="status"
            data-k={message.key === "found" ? "good" : message.key === "question" ? undefined : "bad"}
          >
            {messageText}
          </p>
          <ol className="iq-fsm" aria-label={t("machineLabel")}>
            <li className="iq-fsm-h" aria-hidden="true">
              game-machine
            </li>
            {STATES.map((state) => (
              <li
                key={state}
                className={cn(
                  view.state === state && "on",
                  view.state === "result" && state === "result" && view.result === "missed" && "bad",
                )}
              >
                <span>{stateLabel(state)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
