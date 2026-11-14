import type { ReactNode } from "react";
import type { Work } from "@content/career";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/i18n/routing";
import { RichText, typo } from "./RichText";
import { VisualSlot } from "./VisualSlot";

export interface CaseLabels {
  problem: string;
  contribution: string;
  keyChoice: string;
  result: string;
  stack: string;
  soon: string;
  slot: string;
}

interface CaseCardProps {
  work: Work;
  /** Position in the list, from 1. */
  index: number;
  locale: Locale;
  labels: CaseLabels;
  /** Demo shown in the visual slot until `work.visual.media` is filled. */
  demo: ReactNode;
}

/** Feature card of an achievement: header, visual slot, problem / contribution / key choice, result and stack. */
export function CaseCard({ work, index, locale, labels, demo }: CaseCardProps) {
  const headingId = `t-${work.anchor}`;
  const details = [
    [labels.problem, work.problem],
    [labels.contribution, work.contribution],
    [labels.keyChoice, work.keyChoice],
  ] as const;

  return (
    <Reveal as="article" className="case" id={work.anchor} aria-labelledby={headingId}>
      <header className="case-hd">
        <p className="case-meta">
          <span className="case-n">{String(index).padStart(2, "0")}</span>
          <span className="case-co">{work.company[locale]}</span>
          <span>{work.period[locale]}</span>
        </p>
        <h3 id={headingId}>{typo((work.fullTitle ?? work.title)[locale], locale)}</h3>
        <p className="case-pitch">{typo(work.pitch[locale], locale)}</p>
      </header>

      <VisualSlot visual={work.visual} locale={locale} labels={labels}>
        {demo}
      </VisualSlot>

      <div className="case-body">
        <dl className="case-dl">
          {details.map(([term, text]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{typo(text[locale], locale)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="case-res">
        <p className="res-k">{labels.result}</p>
        <p className="res-t">
          <RichText text={work.result[locale]} locale={locale} />
        </p>
        <ul className="stack" aria-label={labels.stack}>
          {work.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {work.stackNote && <li className="q">{work.stackNote[locale]}</li>}
        </ul>
      </div>
    </Reveal>
  );
}
