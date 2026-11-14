"use client";

import { useId, useState, type CSSProperties } from "react";
import type { CareerDemoContent } from "@content/career-demos";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Format = "square" | "portrait";

const toggleIn = (list: readonly number[], index: number) =>
  list.includes(index) ? list.filter((item) => item !== index) : [...list, index].sort((a, b) => a - b);

interface OptionsProps {
  labelledBy: string;
  options: ReadonlyArray<string>;
  isPressed: (index: number) => boolean;
  onPick: (index: number) => void;
}

function Options({ labelledBy, options, isPressed, onPick }: OptionsProps) {
  return (
    <div className="opts" role="group" aria-labelledby={labelledBy}>
      {options.map((option, index) => (
        <button type="button" className="opt" key={option} aria-pressed={isPressed(index)} onClick={() => onPick(index)}>
          {option}
        </button>
      ))}
    </div>
  );
}

/** Case 04: a three-step campaign form (targeting, creatives, settings) and an ad preview that follows every choice. */
export function AdtechFormsDemo({ t }: { t: CareerDemoContent<"adtech-forms"> }) {
  const id = useId();
  const [step, setStep] = useState(0);
  const [ages, setAges] = useState<readonly number[]>([1, 2]);
  const [interests, setInterests] = useState<readonly number[]>([0]);
  const [hook, setHook] = useState(0);
  const [visual, setVisual] = useState(0);
  const [format, setFormat] = useState<Format>("square");
  const [budget, setBudget] = useState(50);
  const [placements, setPlacements] = useState<readonly number[]>([0]);
  const [action, setAction] = useState(0);

  const audience = Math.min(1, ages.length * 0.2 + (interests.length ? 0.28 - interests.length * 0.05 : 0.2));
  const audienceText = !ages.length
    ? t.audience.empty
    : audience < 0.4
      ? t.audience.narrow
      : audience < 0.7
        ? t.audience.balanced
        : t.audience.wide;
  const blocked = step === 0 && !ages.length;
  const gradient = t.visual.options[visual]?.gradient;
  const meta = [
    ages.map((index) => t.ages.options[index]).join(", ") || t.noAge,
    interests.map((index) => t.interests.options[index]).join(", ") || t.allInterests,
    `${budget} ${t.budget.perDay}`,
  ].join(" · ");

  return (
    <div className="d4">
      <div className="steps" role="group" aria-label={t.stepsLabel}>
        {t.steps.map((label, index) => (
          <button
            type="button"
            key={label}
            aria-current={index === step ? "step" : undefined}
            className={cn(((index === 0 && step > 0 && ages.length > 0) || (index === 1 && step > 1)) && "ok")}
            onClick={() => setStep(index)}
          >
            <i>{index + 1}</i>
            {label}
          </button>
        ))}
      </div>

      <div className="d4-main">
        <div className="d4-form">
          {step === 0 && (
            <div className="pane on">
              <div>
                <p className="fl" id={`${id}-age`}>
                  {t.ages.label}
                </p>
                <Options
                  labelledBy={`${id}-age`}
                  options={t.ages.options}
                  isPressed={(index) => ages.includes(index)}
                  onPick={(index) => setAges((list) => toggleIn(list, index))}
                />
              </div>
              <div>
                <p className="fl" id={`${id}-int`}>
                  {t.interests.label}
                </p>
                <Options
                  labelledBy={`${id}-int`}
                  options={t.interests.options}
                  isPressed={(index) => interests.includes(index)}
                  onPick={(index) => setInterests((list) => toggleIn(list, index))}
                />
              </div>
              <div>
                <p className="fl">
                  <span>{t.audience.label}</span>
                  <output>{audienceText}</output>
                </p>
                <div className="gauge">
                  <i style={{ "--v": ages.length ? audience.toFixed(2) : 0 } as CSSProperties} />
                </div>
              </div>
              <p className={cn("err", !ages.length && "show")} role="alert">
                {!ages.length && t.ageError}
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="pane on">
              <div>
                <p className="fl" id={`${id}-hook`}>
                  {t.hook.label}
                </p>
                <Options
                  labelledBy={`${id}-hook`}
                  options={t.hook.options}
                  isPressed={(index) => index === hook}
                  onPick={setHook}
                />
              </div>
              <div>
                <p className="fl" id={`${id}-vis`}>
                  {t.visual.label}
                </p>
                <div className="opts" role="group" aria-labelledby={`${id}-vis`}>
                  {t.visual.options.map((option, index) => (
                    <button
                      type="button"
                      className="opt sw-c"
                      key={option.gradient}
                      aria-pressed={index === visual}
                      aria-label={option.name}
                      style={{ "--g": option.gradient } as CSSProperties}
                      onClick={() => setVisual(index)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="fl" id={`${id}-fmt`}>
                  {t.format.label}
                </p>
                <div className="opts" role="group" aria-labelledby={`${id}-fmt`}>
                  {(["square", "portrait"] as const).map((value) => (
                    <button
                      type="button"
                      className="opt"
                      key={value}
                      aria-pressed={value === format}
                      onClick={() => setFormat(value)}
                    >
                      {t.format[value]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="pane on">
              <div>
                <label className="fl" htmlFor={`${id}-bud`}>
                  <span>{t.budget.label}</span>
                  <output>{budget} €</output>
                </label>
                <input
                  type="range"
                  id={`${id}-bud`}
                  min={10}
                  max={200}
                  step={10}
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                />
              </div>
              <div>
                <p className="fl" id={`${id}-pla`}>
                  {t.placements.label}
                </p>
                <Options
                  labelledBy={`${id}-pla`}
                  options={t.placements.options}
                  isPressed={(index) => placements.includes(index)}
                  onPick={(index) => setPlacements((list) => toggleIn(list, index))}
                />
              </div>
              <div>
                <label className="fl" htmlFor={`${id}-cta`}>
                  {t.action.label}
                </label>
                <select id={`${id}-cta`} value={action} onChange={(event) => setAction(Number(event.target.value))}>
                  {t.action.options.map((option, index) => (
                    <option key={option} value={index}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <p className={cn("err", !placements.length && "show")} role="alert">
                {!placements.length && t.placementError}
              </p>
            </div>
          )}

          <div className="d4-nav">
            <button type="button" className="dbtn" disabled={step === 0} onClick={() => setStep(step - 1)}>
              {t.back}
            </button>
            <button
              type="button"
              className="dbtn fill"
              disabled={blocked}
              style={blocked ? { opacity: 0.4 } : undefined}
              onClick={() => setStep(step === 2 ? 0 : step + 1)}
            >
              {step === 2 ? t.restart : t.next}
              <Icon name="arrow" />
            </button>
          </div>
        </div>

        <div>
          <div className="ad" data-f={format} aria-live="polite">
            <div className="ad-h">
              <i aria-hidden="true" />
              <div>
                <b>{t.brand}</b>
                <span>{t.sponsored}</span>
              </div>
            </div>
            <div className="ad-img" style={{ "--g": gradient } as CSSProperties}>
              <strong>{t.hook.options[hook]}</strong>
            </div>
            <div className="ad-f">
              <span>{placements.map((index) => t.placements.options[index]).join(" · ") || t.placements.none}</span>
              <b>{t.action.options[action]}</b>
            </div>
          </div>
          <p className="ad-meta">{meta}</p>
        </div>
      </div>
    </div>
  );
}
