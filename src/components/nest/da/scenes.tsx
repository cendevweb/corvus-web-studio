import { useId, type CSSProperties, type ReactNode } from "react";
import type { DaUniverseId } from "@content/da";

/**
 * Backdrop of each universe, drawn in SVG with the DA's colours (CSS custom properties), so a new
 * palette recolours the scene without a new drawing. Shapes only evoke the references: no logo,
 * character, vehicle or building from the works cited. `amb-*` classes are slow ambient loops
 * timed on the beat (see nest-da.css); the composition stays readable when cropped to 9:16 or 16:10.
 */

const stop = (offset: number, color: string, opacity = 1) => (
  <stop key={offset} offset={offset} style={{ stopColor: color, stopOpacity: opacity }} />
);

const delay = (value: number) => ({ "--d": value } as CSSProperties);

function Frond({ angle, length = 16 }: { angle: number; length?: number }) {
  return (
    <path
      className="d-deep"
      transform={`rotate(${angle})`}
      d={`M0 0 Q ${length * 0.45} ${-length * 0.24} ${length} ${length * 0.12} Q ${length * 0.5} ${-length * 0.06} 0 0.9 Z`}
    />
  );
}

function Palm({ base, top, flip = false, delay: d }: { base: [number, number]; top: [number, number]; flip?: boolean; delay: number }) {
  const [bx, by] = base;
  const [tx, ty] = top;
  const angles = [-160, -128, -100, -64, -30, -8, 20];
  return (
    <g className="amb-sway" style={delay(d)}>
      <path
        className="d-deep"
        d={`M${bx - 1.3} ${by} Q ${bx + (tx - bx) * 0.2 - 1} ${(by + ty) / 2} ${tx - 0.6} ${ty} L ${tx + 0.6} ${ty} Q ${bx + (tx - bx) * 0.2 + 1.2} ${(by + ty) / 2} ${bx + 1.3} ${by} Z`}
      />
      <g transform={`translate(${tx} ${ty}) scale(${flip ? -1 : 1} 1)`}>
        {angles.map((angle) => (
          <Frond key={angle} angle={angle} length={angle < -120 || angle > 0 ? 13 : 16} />
        ))}
      </g>
    </g>
  );
}

function Heatwave({ id }: { id: string }) {
  const sun = "color-mix(in oklab, var(--da-accent-2) 62%, #fff)";
  return (
    <>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, "var(--da-bg)")}
          {stop(0.36, "var(--da-surface)")}
          {stop(0.56, "var(--da-accent)")}
          {stop(0.64, "var(--da-accent-2)")}
        </linearGradient>
        <linearGradient id={`${id}sun`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, sun)}
          {stop(1, "var(--da-accent)")}
        </linearGradient>
        <linearGradient id={`${id}sea`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, "var(--da-accent)", 0.9)}
          {stop(1, "var(--da-deep)")}
        </linearGradient>
        <mask id={`${id}cut`}>
          <rect width="100" height="100" fill="#fff" />
          {[50, 53.4, 56.4, 59].map((y, index) => (
            <rect key={y} x="0" y={y} width="100" height={0.7 + index * 0.45} fill="#000" />
          ))}
        </mask>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}sky)`} />
      <g className="amb-pulse">
        <circle cx="50" cy="50" r="17" fill={`url(#${id}sun)`} mask={`url(#${id}cut)`} />
      </g>
      <g className="d-deep" opacity=".88">
        {[
          [14, 4],
          [18, 7],
          [22, 5],
          [27, 9],
          [31, 6],
          [35, 11],
          [39, 7],
          [57, 8],
          [61, 13],
          [65, 6],
          [69, 9],
          [74, 5],
          [79, 7],
          [84, 4],
        ].map(([x, h]) => (
          <rect key={x} x={x} y={62 - h!} width="3.6" height={h} />
        ))}
      </g>
      <rect y="62" width="100" height="38" fill={`url(#${id}sea)`} />
      {[64.5, 67.5, 71, 75, 80].map((y, index) => (
        <rect
          key={y}
          className="amb-wave"
          style={{ ...delay(index * 0.4), fill: sun }}
          x={50 - (14 - index * 2.4)}
          y={y}
          width={(14 - index * 2.4) * 2}
          height={0.9 - index * 0.08}
          opacity={0.85 - index * 0.12}
        />
      ))}
      <Palm base={[23, 102]} top={[30, 47]} delay={0} />
      <Palm base={[80, 102]} top={[71, 52]} flip delay={1.2} />
    </>
  );
}

function Dunesday({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, "var(--da-deep)")}
          {stop(0.45, "var(--da-surface)")}
          {stop(0.66, "var(--da-accent-2)")}
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}sky)`} />
      <circle className="amb-pulse d-g" cx="50" cy="45" r="13" opacity=".92" />
      <path className="d-a2" d="M0 64 Q 18 57 36 61 T 70 59 T 100 62 V100 H0Z" />
      <path d="M0 64 Q 18 57 36 61 T 70 59 T 100 62" fill="none" stroke="var(--da-accent)" strokeWidth=".45" opacity=".7" />
      <path className="d-s" d="M0 73 Q 24 64 50 70 T 100 67 V100 H0Z" />
      <path d="M0 73 Q 24 64 50 70 T 100 67" fill="none" stroke="var(--da-accent)" strokeWidth=".5" opacity=".55" />
      <polygon className="d-deep" points="47,70.5 53,70.5 86,79 72,79" opacity=".45" />
      <rect className="d-deep" x="47" y="25" width="6" height="46" />
      <rect className="d-a" x="52.3" y="25" width=".7" height="46" opacity=".9" />
      <path className="d-deep" d="M0 84 Q 30 76 58 82 T 100 80 V100 H0Z" />
      <g className="d-deep">
        <circle cx="61" cy="72.6" r=".75" />
        <rect x="60.45" y="73.3" width="1.1" height="2.8" rx=".4" />
      </g>
      <g className="amb-drift d-g" opacity=".55">
        {[
          [12, 30],
          [24, 52],
          [36, 22],
          [66, 34],
          [78, 56],
          [88, 26],
          [58, 60],
          [30, 66],
        ].map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index % 3 ? 0.35 : 0.55} />
        ))}
      </g>
    </>
  );
}

function Liminal() {
  const stripes = [6, 13, 20, 27, 34];
  return (
    <>
      <polygon className="d-s" points="0,0 100,0 60,38 40,38" />
      <polygon className="d-a" points="0,100 100,100 60,58 40,58" opacity=".9" />
      <polygon className="d-bg" points="0,0 40,38 40,58 0,100" />
      <polygon className="d-bg" points="100,0 60,38 60,58 100,100" />
      <polygon className="d-deep" points="100,0 60,38 60,58 100,100" opacity=".07" />
      <rect className="d-s" x="40" y="38" width="20" height="20" />
      <rect className="d-deep" x="40" y="38" width="20" height="20" opacity=".14" />
      <rect className="d-deep" x="46.6" y="45" width="6.8" height="13" opacity=".86" />
      <rect className="d-g" x="47.6" y="41.6" width="4.8" height="1.6" opacity=".9" />
      <g stroke="var(--da-deep)" strokeWidth=".3" opacity=".1">
        {stripes.map((x) => (
          <g key={x}>
            <line x1={x} y1={(x * 38) / 40} x2={x} y2={100 - (x * 42) / 40} />
            <line x1={100 - x} y1={(x * 38) / 40} x2={100 - x} y2={100 - (x * 42) / 40} />
          </g>
        ))}
      </g>
      <g stroke="var(--da-deep)" strokeWidth=".6" opacity=".3">
        <line x1="0" y1="97" x2="40" y2="57" />
        <line x1="100" y1="97" x2="60" y2="57" />
      </g>
      <polygon className="d-a2" points="37,5 63,5 60,11 40,11" />
      <polygon className="d-a2 amb-flick" points="43,21 57,21 55.4,25 44.6,25" />
      <polygon className="d-a2" points="46.4,30.4 53.6,30.4 52.8,33 47.2,33" opacity=".9" />
    </>
  );
}

function Aero({ id }: { id: string }) {
  const bubbles: [number, number, number, number][] = [
    [26, 70, 4.5, 0],
    [40, 84, 2.6, 1.4],
    [72, 76, 6, 0.6],
    [60, 92, 3.2, 2.2],
    [84, 88, 2.2, 3],
    [16, 90, 3, 1.9],
  ];
  return (
    <>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, "var(--da-accent)")}
          {stop(0.55, "var(--da-bg)")}
          {stop(0.72, "var(--da-surface)")}
        </linearGradient>
        <radialGradient id={`${id}sun`}>
          {stop(0, "var(--da-surface)")}
          {stop(0.3, "var(--da-glow)", 0.8)}
          {stop(1, "var(--da-glow)", 0)}
        </radialGradient>
        <radialGradient id={`${id}bub`} cx=".5" cy=".5" r=".5">
          {stop(0.55, "#fff", 0.04)}
          {stop(0.92, "#fff", 0.42)}
          {stop(1, "#fff", 0.8)}
        </radialGradient>
        <linearGradient id={`${id}hill`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, "color-mix(in oklab, var(--da-accent-2) 70%, #fff)")}
          {stop(0.4, "var(--da-accent-2)")}
          {stop(1, "color-mix(in oklab, var(--da-accent-2) 60%, var(--da-deep))")}
        </linearGradient>
        <radialGradient id={`${id}orb`} cx=".35" cy=".3" r=".75">
          {stop(0, "#fff", 0.9)}
          {stop(0.35, "var(--da-surface)", 0.35)}
          {stop(1, "var(--da-accent)", 0.35)}
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}sky)`} />
      <circle cx="72" cy="20" r="18" fill={`url(#${id}sun)`} className="amb-pulse" />
      <g className="amb-drift d-s" opacity=".75">
        <ellipse cx="22" cy="28" rx="10" ry="3.2" />
        <ellipse cx="30" cy="26" rx="6" ry="3.4" />
        <ellipse cx="80" cy="40" rx="8" ry="2.4" />
      </g>
      <path d="M0 70 Q 30 57 60 67 T 100 63 V100 H0Z" fill={`url(#${id}hill)`} />
      <path d="M0 84 Q 44 70 100 81 V100 H0Z" fill={`url(#${id}hill)`} />
      <path d="M0 84 Q 44 70 100 81" fill="none" stroke="#fff" strokeWidth=".5" opacity=".45" />
      <g className="amb-bob" style={delay(0.5)}>
        <circle cx="64" cy="42" r="10" fill={`url(#${id}orb)`} stroke="#fff" strokeWidth=".35" strokeOpacity=".7" />
        <ellipse cx="60.5" cy="37.5" rx="4.2" ry="2.2" fill="#fff" opacity=".75" transform="rotate(-28 60.5 37.5)" />
      </g>
      {bubbles.map(([x, y, r, d], index) => (
        <g key={index} className="amb-rise" style={delay(d)}>
          <circle cx={x} cy={y} r={r} fill={`url(#${id}bub)`} stroke="#fff" strokeWidth=".25" strokeOpacity=".6" />
          <ellipse cx={x - r * 0.35} cy={y - r * 0.42} rx={r * 0.32} ry={r * 0.18} fill="#fff" opacity=".85" />
        </g>
      ))}
    </>
  );
}

function Y2016({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}pic`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, "var(--da-glow)")}
          {stop(1, "var(--da-accent)")}
        </linearGradient>
      </defs>
      <rect className="d-bg" width="100" height="100" />
      <circle className="d-g amb-pulse" cx="72" cy="26" r="15" opacity=".55" />
      <polyline points="9,20 14,15 19,20 24,15 29,20 34,15" fill="none" stroke="var(--da-accent-2)" strokeWidth="1.6" strokeLinejoin="round" />
      <polygon points="74,80 80,69 86,80" fill="none" stroke="var(--da-accent)" strokeWidth="1.4" strokeLinejoin="round" className="amb-bob" style={delay(0.8)} />
      <g className="d-i" opacity=".28">
        {[0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => <circle key={`${row}${col}`} cx={12 + col * 3.6} cy={70 + row * 3.6} r=".75" />))}
      </g>
      <path d="M58 90 q 3 -4 6 0 t 6 0 t 6 0" fill="none" stroke="var(--da-ink)" strokeWidth="1.1" strokeLinecap="round" opacity=".6" />
      <rect className="d-a" x="18" y="40" width="4" height="4" transform="rotate(20 20 42)" />
      <rect className="d-a2" x="82" y="52" width="3" height="3" transform="rotate(-15 83.5 53.5)" />
      <circle className="d-a2" cx="26" cy="86" r="2" />
      <g className="amb-bob">
        <g transform="rotate(-6 50 52)">
          <rect className="d-deep" x="33.2" y="31.2" width="36" height="43" opacity=".14" />
          <rect className="d-s" x="32" y="30" width="36" height="43" />
          <rect x="35" y="33" width="30" height="30" fill={`url(#${id}pic)`} />
          <circle cx="50" cy="52" r="7" fill="none" stroke="var(--da-surface)" strokeWidth="1" opacity=".9" />
          <path d="M44 41 c 0 -2.4 3.4 -2.4 3.4 0 c 0 -2.4 3.4 -2.4 3.4 0 c 0 2.6 -3.4 4.2 -3.4 4.2 c 0 0 -3.4 -1.6 -3.4 -4.2 Z" fill="var(--da-surface)" opacity=".9" />
          <rect className="d-i" x="38" y="66.5" width="16" height="1.6" rx=".8" opacity=".5" />
          <rect className="d-g" x="44" y="27.6" width="12" height="4.4" opacity=".7" transform="rotate(4 50 29.8)" />
        </g>
      </g>
      {[
        [24, 34, 0],
        [80, 46, 1],
        [66, 84, 2],
      ].map(([x, y, d]) => (
        <path
          key={x}
          className="d-s amb-twinkle"
          style={delay(d!)}
          d={`M${x} ${y! - 3} Q ${x} ${y} ${x! + 3} ${y} Q ${x} ${y} ${x} ${y! + 3} Q ${x} ${y} ${x! - 3} ${y} Q ${x} ${y} ${x} ${y! - 3} Z`}
        />
      ))}
    </>
  );
}

function Brutal() {
  return (
    <>
      <rect className="d-bg" width="100" height="100" />
      <rect className="d-s" x="6" y="0" width="20" height="100" />
      <rect className="d-s" x="74" y="0" width="20" height="100" />
      <rect className="d-s" x="0" y="12" width="100" height="11" />
      <rect className="d-deep" x="0" y="23" width="100" height="1.4" opacity=".16" />
      <rect className="d-deep" x="26" y="0" width="1.2" height="100" opacity=".14" />
      <rect className="d-deep" x="74" y="0" width="1.2" height="100" opacity=".08" />
      <polygon className="d-deep" points="0,86 100,86 100,100 0,100" opacity=".14" />
      <g stroke="var(--da-deep)" strokeWidth=".25" opacity=".16">
        {[32, 40, 48, 56, 64, 72, 80].map((y) => (
          <g key={y}>
            <line x1="6" y1={y} x2="26" y2={y} />
            <line x1="74" y1={y} x2="94" y2={y} />
          </g>
        ))}
      </g>
      <g className="d-deep" opacity=".2">
        {[36, 52, 68].map((y) => (
          <g key={y}>
            <circle cx="11" cy={y} r=".55" />
            <circle cx="21" cy={y} r=".55" />
            <circle cx="79" cy={y} r=".55" />
            <circle cx="89" cy={y} r=".55" />
          </g>
        ))}
      </g>
      <g stroke="var(--da-ink)" strokeWidth=".18" opacity=".1">
        {Array.from({ length: 11 }, (_, index) => (
          <line key={index} x1={(index + 1) * 8.33} y1="0" x2={(index + 1) * 8.33} y2="100" />
        ))}
      </g>
      <rect className="d-a" x="14" y="76" width="46" height="1.6" />
      <ellipse className="d-deep amb-shadow" cx="51" cy="80" rx="13" ry="1.6" opacity=".22" />
      <g className="amb-float">
        <g transform="rotate(-8 47 48)">
          <rect className="d-pale" x="38" y="36" width="17" height="22" />
          <rect className="d-i" x="40.5" y="39.5" width="10" height="1.3" />
          <rect className="d-i" x="40.5" y="43" width="12" height="1.3" />
          <rect className="d-a" x="40.5" y="46.5" width="7" height="1.3" />
          <rect className="d-i" x="40.5" y="50" width="11" height="1.3" />
        </g>
      </g>
      <g className="amb-float" style={delay(1.3)}>
        <g transform="rotate(11 60 56)">
          <rect className="d-pale" x="53" y="46" width="14" height="18" opacity=".92" />
          <rect className="d-i" x="55" y="49.5" width="9" height="1.2" />
          <rect className="d-i" x="55" y="53" width="6" height="1.2" />
          <rect className="d-i" x="55" y="56.5" width="8" height="1.2" />
        </g>
      </g>
    </>
  );
}

function Ink({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}mist`} x1="0" y1="0" x2="1" y2="0">
          {stop(0, "var(--da-bg)", 0)}
          {stop(0.5, "var(--da-bg)", 0.85)}
          {stop(1, "var(--da-bg)", 0)}
        </linearGradient>
      </defs>
      <rect className="d-bg" width="100" height="100" />
      <circle className="d-a amb-pulse" cx="64" cy="30" r="9" opacity=".9" />
      <path className="d-i" d="M0 62 L13 50 L21 56 L33 39 L45 53 L55 45 L69 57 L81 43 L100 57 V100 H0Z" opacity=".12" />
      <rect className="amb-drift" x="-10" y="58" width="80" height="5" fill={`url(#${id}mist)`} />
      <path className="d-i" d="M0 72 L17 58 L29 66 L43 53 L59 69 L75 59 L100 71 V100 H0Z" opacity=".26" />
      <rect className="amb-drift" style={delay(2)} x="30" y="70" width="80" height="6" fill={`url(#${id}mist)`} />
      <path className="d-i" d="M0 86 Q 30 74 52 81 T 100 79 V100 H0Z" opacity=".62" />
      <g className="d-i" transform="translate(41 78.4)">
        <path d="M-2.2 0 L0 -1.5 L2.2 0 Z" />
        <rect x="-.55" y="0" width="1.1" height="3" />
        <rect x=".5" y="-.6" width=".25" height="4.2" transform="rotate(28 .6 1.5)" />
      </g>
      <g className="d-i" opacity=".72">
        {[
          [0, 6, -30],
          [4, 2, -12],
          [10, 0, 8],
          [-2, 14, -48],
        ].map(([x, y, angle], index) => (
          <path key={index} transform={`translate(${x} ${y}) rotate(${angle})`} d="M0 0 Q 7 -2.4 15 0 Q 7 2 0 0 Z" />
        ))}
      </g>
      <g className="d-g" opacity=".75">
        {[
          [22, 30],
          [30, 44],
          [78, 24],
          [86, 36],
          [70, 48],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r=".45" />
        ))}
      </g>
    </>
  );
}

function Terminal({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={`${id}dot`} width="3.4" height="3.4" patternUnits="userSpaceOnUse">
          <circle cx="1.7" cy="1.7" r=".32" className="d-i" opacity=".22" />
        </pattern>
      </defs>
      <rect className="d-bg" width="100" height="100" />
      <rect width="100" height="100" fill={`url(#${id}dot)`} />
      <g className="amb-bob" style={delay(0.3)}>
        <g transform="rotate(-5 50 46)">
          <rect className="d-deep" x="23.4" y="27.6" width="56" height="40" rx="2.6" opacity=".12" />
          <rect className="d-s" x="22" y="26" width="56" height="40" rx="2.6" stroke="var(--da-ink)" strokeOpacity=".14" strokeWidth=".3" />
          <path className="d-i" d="M24.6 26 h50.8 a2.6 2.6 0 0 1 2.6 2.6 v3.4 h-56 v-3.4 a2.6 2.6 0 0 1 2.6 -2.6 Z" opacity=".06" />
          {[25.4, 28, 30.6].map((x) => (
            <circle key={x} className="d-i" cx={x} cy="29" r=".85" opacity=".22" />
          ))}
          <rect className="d-a" x="26" y="36" width="18" height="1.8" rx=".9" />
          <rect className="d-i" x="46" y="36" width="12" height="1.8" rx=".9" opacity=".3" />
          <rect className="d-i" x="26" y="40.6" width="28" height="1.8" rx=".9" opacity=".55" />
          <rect className="d-a2" x="26" y="45.2" width="10" height="1.8" rx=".9" />
          <rect className="d-i" x="38" y="45.2" width="20" height="1.8" rx=".9" opacity=".3" />
          <rect className="d-g" x="26" y="49.8" width="24" height="1.8" rx=".9" />
          <path d="M26.2 55.2 l1.6 1.4 -1.6 1.4" fill="none" stroke="var(--da-accent)" strokeWidth=".6" strokeLinecap="round" strokeLinejoin="round" />
          <rect className="d-a amb-blink" x="29.6" y="54.9" width="1" height="3.4" />
        </g>
      </g>
      <g className="amb-bob" style={delay(1.6)}>
        <g transform="rotate(4 71 74)">
          <rect className="d-deep" x="57" y="65" width="30" height="20" rx="2.6" opacity=".12" />
          <rect className="d-s" x="56" y="64" width="30" height="20" rx="2.6" stroke="var(--da-ink)" strokeOpacity=".14" strokeWidth=".3" />
          {[69, 74, 79].map((y) => (
            <g key={y}>
              <circle className="d-g" cx="60.4" cy={y} r="1.35" />
              <path d={`M59.7 ${y} l.55 .55 1 -1.05`} fill="none" stroke="var(--da-surface)" strokeWidth=".45" strokeLinecap="round" strokeLinejoin="round" />
              <rect className="d-i" x="63.2" y={y - 0.7} width={y === 74 ? 14 : 18} height="1.4" rx=".7" opacity=".5" />
            </g>
          ))}
        </g>
      </g>
      <rect className="d-a" x="38" y="14" width="24" height="5" rx="2.5" opacity=".9" />
      <rect className="d-s" x="41" y="15.9" width="12" height="1.2" rx=".6" opacity=".9" />
      <path
        className="d-i amb-bob"
        style={delay(0.9)}
        transform="translate(61 50)"
        d="M0 0 L0 7.4 L2 5.6 L3.4 8.6 L4.7 8 L3.3 5.1 L5.9 4.9 Z"
        stroke="var(--da-surface)"
        strokeWidth=".45"
        strokeLinejoin="round"
      />
    </>
  );
}

const SCENES: Record<DaUniverseId, (props: { id: string }) => ReactNode> = {
  heatwave: Heatwave,
  dunesday: Dunesday,
  liminal: Liminal,
  aero: Aero,
  y2016: Y2016,
  brutal: Brutal,
  ink: Ink,
  terminal: Terminal,
};

export function SceneArt({ universe, className }: { universe: DaUniverseId; className?: string }) {
  const id = `da${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const Scene = SCENES[universe];
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Scene id={id} />
    </svg>
  );
}
