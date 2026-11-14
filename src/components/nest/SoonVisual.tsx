import type { ExperimentId } from "@content/nest";

const LETTERS_X = [34, 62, 90, 118, 146, 174, 202];

/** Schematic placeholder of an experiment still in the incubator (never a fake screenshot). */
export function SoonVisual({ id, caption }: { id: ExperimentId; caption?: string }) {
  if (id === "rollback") {
    return (
      <svg viewBox="0 0 240 100">
        <g className="s">
          {[6, 26, 46].map((x) => (
            <rect key={x} x={x} y="38" width="16" height="24" rx="3" />
          ))}
        </g>
        <g className="i">
          {[66, 86, 106, 126, 146, 166, 186, 206].map((x) => (
            <rect key={x} x={x} y="38" width="16" height="24" rx="3" />
          ))}
        </g>
        <path className="i flow" d="M214 30C190 6 98 6 74 30" />
        <path className="i" d="m82 22-9 9 12 2" />
        <circle className="fi" cx="214" cy="76" r="4" />
        <path className="s" d="M6 76h200" />
        <text x="144" y="94" textAnchor="middle">
          {caption}
        </text>
      </svg>
    );
  }
  if (id === "brick-wall") {
    return (
      <svg viewBox="0 0 240 100">
        <rect className="s" x="10" y="32" width="220" height="36" rx="2" />
        <g className="i">
          <path d="M96 32v36M96 44h134M96 56h134M130 32v12M164 32v12M198 32v12M113 44v12M147 44v12M181 44v12M215 44v12M130 56v12M164 56v12M198 56v12" />
        </g>
        <g className="f">
          {[20, 38, 56, 74].map((x) => (
            <rect key={x} x={x} y="42" width="12" height="16" />
          ))}
        </g>
        <path className="s flow" d="M20 82h66" />
        <text x="53" y="96" textAnchor="middle">
          {caption}
        </text>
      </svg>
    );
  }
  if (id === "typo-tolerance") {
    return (
      <svg viewBox="0 0 240 100">
        <g className="s">
          {[14, 58].flatMap((y) =>
            [22, 50, 106, 134, 162, 190].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="24" height="28" rx="4" />),
          )}
        </g>
        <rect className="i" x="78" y="14" width="24" height="28" rx="4" />
        <rect className="i" x="78" y="58" width="24" height="28" rx="4" />
        <path className="i flow" d="M90 42v16" />
        <g textAnchor="middle">
          {[..."pikachu"].map((letter, index) => (
            <text key={`a${index}`} x={LETTERS_X[index]} y="33">
              {letter}
            </text>
          ))}
          {[..."picachu"].map((letter, index) => (
            <text key={`b${index}`} x={LETTERS_X[index]} y="77">
              {letter}
            </text>
          ))}
        </g>
      </svg>
    );
  }
  return null;
}
