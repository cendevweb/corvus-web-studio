"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Locale } from "@content/types";
import { CopyAction } from "@/components/news/CopyAction";
import { Icon } from "@/components/ui/Icon";
import { highlight } from "@/lib/highlight";
import type { DaTranslator } from "./Board";
import type { Da, DaFormat } from "./engine";
import { DA_EXPORTS, exportFile, exportMime, exportText, type DaExportId } from "./exports";

/** Markdown and plain text: headings, inline code, list markers; fenced code goes through `highlight`. */
function highlightText(source: string): ReactNode[] {
  const out: ReactNode[] = [];
  let fence = false;
  source.split("\n").forEach((line, index) => {
    if (index) out.push("\n");
    if (line.startsWith("```")) {
      fence = !fence;
      out.push(
        <span key={index} className="tk-c">
          {line}
        </span>,
      );
    } else if (fence) out.push(<span key={index}>{highlight(line)}</span>);
    else if (/^(#|---$|name:|description:)/.test(line))
      out.push(
        <span key={index} className={line.startsWith("# ") && !line.startsWith("# DA") ? "tk-c" : "tk-k"}>
          {line}
        </span>,
      );
    else {
      const marker = /^(\s*(?:[-*]|\d+\.|\|)\s)/.exec(line)?.[1] ?? "";
      out.push(
        <span key={index}>
          {marker && <span className="tk-n">{marker}</span>}
          {line
            .slice(marker.length)
            .split("`")
            .map((part, position) => (position % 2 ? <span key={position} className="tk-s">{`\`${part}\``}</span> : part))}
        </span>,
      );
    }
  });
  return out;
}

export function ExportPanel({ da, format, locale, t }: { da: Da; format: DaFormat; locale: Locale; t: DaTranslator }) {
  const [tab, setTab] = useState<DaExportId>("css");
  const base = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const text = useMemo(() => exportText(tab, da, locale, format), [tab, da, locale, format]);
  const file = exportFile(da, tab);
  const body = useMemo(() => (tab === "skill" || tab === "prompt" ? highlightText(text) : highlight(text)), [tab, text]);

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = DA_EXPORTS.length - 1;
    const next =
      event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    const target = (next + DA_EXPORTS.length) % DA_EXPORTS.length;
    setTab(DA_EXPORTS[target]!);
    tabs.current[target]?.focus();
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: `${exportMime(tab)};charset=utf-8` }));
    const link = document.createElement("a");
    link.href = url;
    link.download = file;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="da-ex night" aria-labelledby={`${base}h`}>
      <div className="ex-h">
        <h3 id={`${base}h`}>{t("export")}</h3>
        <div className="ex-tabs" role="tablist" aria-label={t("exportLabel")}>
          {DA_EXPORTS.map((id, index) => (
            <button
              key={id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${base}t${id}`}
              aria-selected={tab === id}
              aria-controls={`${base}p`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(event) => onKey(event, index)}
            >
              {t(`exports.${id}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="ex-p" role="tabpanel" id={`${base}p`} aria-labelledby={`${base}t${tab}`}>
        <div className="ex-bar">
          <p>
            <code>{file}</code>
            <span>{t(`hints.${tab}`)}</span>
          </p>
          <div className="ex-act">
            <CopyAction source={{ text }} label={t("copy")} copiedLabel={t("copied")} ariaLabel={t("copyFile", { file })} />
            <button type="button" className="cpy" onClick={download} aria-label={t("downloadFile", { file })}>
              <span className="def">
                <Icon name="download" />
                {t("download")}
              </span>
            </button>
          </div>
        </div>
        <pre tabIndex={0} aria-label={t("source", { file })}>
          <code>{body}</code>
        </pre>
      </div>
    </section>
  );
}
