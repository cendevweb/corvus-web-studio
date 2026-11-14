import { l, type Localized } from "./types";
import type { GameSlug } from "./games";

/**
 * The "Nid" (nest): small interactive experiments taken from the studio's games.
 * Each one ships a playable demo, how it works, and its code under the MIT licence.
 * The demo components live in src/components/nest/ and are looked up by `demo`.
 */

export type ExperimentId = "crow-follow" | "round-timer" | "icon-grid" | "rollback" | "brick-wall" | "typo-tolerance";
export type ExperimentDemo = "crow-follow" | "round-timer" | "icon-grid";

export interface Experiment {
  id: ExperimentId;
  number: string;
  status: "playable" | "soon";
  /** Which game it comes from (`null`: the studio itself). */
  from: GameSlug | null;
  /** Wording of the origin on a playable card ("Tiré de Fastr"). Defaults to the game's name. */
  origin?: Localized;
  title: { card: Localized; page: Localized };
  description: { card: Localized; page: Localized };
  /** Tags on the home card, and the fuller list on the Nid page. */
  tags: { card: Localized<string[]>; page: Localized<string[]> };
  /** How it works, in three steps. Backticks mark inline code. */
  how?: Localized<string[]>;
  demo?: ExperimentDemo;
  /** Copyable snippet (MIT). `short` is the home-page version. */
  code?: { filename: string; language: "js" | "css"; short: string; full: string };
}

const springShort = `// Ressort : garde son élan, dépasse un peu sa cible (MIT)
const spring = (apply, k = .06, d = .86) => {
  let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, raf = 0;
  const step = () => {
    vx = (vx + (tx - x) * k) * d; vy = (vy + (ty - y) * k) * d;
    x += vx; y += vy; apply(x, y, vx, vy);
    raf = Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) > .01 ? requestAnimationFrame(step) : 0;
  };
  return { to(a, b) { tx = a; ty = b; if (!raf) raf = requestAnimationFrame(step); } };
};`;

const springFull = `// Un ressort à deux réglages : raideur (k) et amortissement (d).
// Pas de durée : il s'arrête quand il n'a plus d'élan.
const spring = (apply, k = 0.06, d = 0.86) => {
  let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, raf = 0;

  const step = () => {
    vx = (vx + (tx - x) * k) * d;
    vy = (vy + (ty - y) * k) * d;
    x += vx; y += vy;
    apply(x, y, vx, vy);

    const moving = Math.abs(vx) + Math.abs(vy)
      + Math.abs(tx - x) + Math.abs(ty - y) > 0.01;
    raf = moving ? requestAnimationFrame(step) : 0;
  };

  return {
    to(a, b) { tx = a; ty = b; if (!raf) raf = requestAnimationFrame(step); }
  };
};

// La vitesse horizontale incline le corbeau et choisit son profil.
const crow = spring((x, y, vx) => {
  const tilt = Math.max(-14, Math.min(14, vx * 1.6));
  bird.style.transform = \`translate(\${x}px, \${y}px) rotate(\${tilt}deg)\`;
  bird.classList.toggle('flip', vx < 0);
});

sky.addEventListener('pointermove', e => crow.to(e.offsetX, e.offsetY));`;

const timerShort = `// Timer de manche : le temps restant dérive de l'horloge, pas d'un setInterval (MIT)
const roundTimer = (total, onTick) => {
  let left = total, last = performance.now();
  const loop = t => {
    left = Math.max(0, left - (t - last) / 1000); last = t;
    onTick(left, left <= 10);
    if (left > 0) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};`;

const timerFull = `// Le temps restant vient de l'horloge, pas d'un compteur d'images :
// un onglet ralenti ne fait pas durer la manche plus longtemps.
const ROUND = 120, SEGMENTS = 24;
let left = ROUND, last = 0, running = false, speed = 8;

const loop = now => {
  if (!running) return;
  left = Math.max(0, left - (now - last) / 1000 * speed);
  last = now;
  if (left === 0) running = false;
  paint();
  if (running) requestAnimationFrame(loop);
};

const paint = () => {
  const s = Math.ceil(left);
  clock.textContent =
    String(Math.floor(s / 60)).padStart(2, '0') + ':' +
    String(s % 60).padStart(2, '0');
  const lit = Math.ceil(left / ROUND * SEGMENTS);
  segments.forEach((el, i) => el.classList.toggle('off', i >= lit));
  box.classList.toggle('danger', left > 0 && left <= 10);
};

// Règle de score : 100 points + un bonus qui baisse à chaque mot.
let words = 0, score = 0;
const validate = () => {
  score += 100 + Math.max(0, 119 - words);
  words += 1;
  if (words % 3 === 0) sendMalus(); // tous les 3 mots
};`;

const flipShort = `/* Carte à retourner : deux faces, une rotation (MIT) */
.card{position:relative;transform-style:preserve-3d;transition:transform 420ms cubic-bezier(.23,1,.32,1)}
.card[aria-pressed=true]{transform:rotateY(180deg)}
.card span{position:absolute;inset:0;backface-visibility:hidden}
.card .back{transform:rotateY(180deg)}`;

const flipFull = `/* Une carte = un bouton. L'état vit dans aria-pressed :
   le style et l'accessibilité lisent la même source. */
.grid { perspective: 800px; }

.card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 420ms cubic-bezier(.23, 1, .32, 1);
}
.card[aria-pressed='true'] { transform: rotateY(180deg); }
.card:active { transform: scale(.95); }

.face {
  position: absolute; inset: 0;
  backface-visibility: hidden;
}
.face.answer { transform: rotateY(180deg); }

/* Mouvement réduit : la carte change de face sans tourner. */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}

// Côté script, un seul écouteur pour toute la grille.
grid.addEventListener('click', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  const on = card.getAttribute('aria-pressed') !== 'true';
  card.setAttribute('aria-pressed', on);
});`;

export const experiments: readonly Experiment[] = [
  {
    id: "crow-follow",
    number: "01",
    status: "playable",
    from: null,
    origin: l("Le studio", "The studio"),
    title: {
      card: l("Le corbeau qui suit le curseur", "The crow that follows the cursor"),
      page: l("Le corbeau qui suit le curseur", "The crow that follows the cursor"),
    },
    description: {
      card: l(
        "Un ressort, pas une interpolation : il garde son élan et dépasse un peu sa cible, comme un vrai.",
        "A spring, not an interpolation: it keeps its momentum and slightly overshoots its target, like a real one.",
      ),
      page: l(
        "Un ressort, pas une interpolation : le corbeau garde son élan, dépasse un peu sa cible et se repose quand il n'a plus rien à faire. Les graines et les deux réglages changent son caractère.",
        "A spring, not an interpolation: the crow keeps its momentum, slightly overshoots its target and rests when it has nothing left to do. Seeds and the two settings change its temper.",
      ),
    },
    tags: {
      card: l(["spring", "rAF", "pixel art"], ["spring", "rAF", "pixel art"]),
      page: l(["animation", "pixel art", "spring", "rAF"], ["animation", "pixel art", "spring", "rAF"]),
    },
    how: l(
      [
        "À chaque image, la vitesse est tirée vers la cible (raideur), puis freinée (amortissement).",
        "La vitesse horizontale incline le sprite et choisit son profil, gauche ou droite.",
        "Sous un seuil de mouvement, la boucle s'arrête : aucun calcul au repos.",
      ],
      [
        "On every frame, velocity is pulled towards the target (stiffness), then slowed down (damping).",
        "Horizontal velocity tilts the sprite and picks its profile, left or right.",
        "Below a movement threshold the loop stops: no computation at rest.",
      ],
    ),
    demo: "crow-follow",
    code: { filename: "spring.js", language: "js", short: springShort, full: springFull },
  },
  {
    id: "round-timer",
    number: "02",
    status: "playable",
    from: "fastr",
    origin: l("Tiré de Fastr", "From Fastr"),
    title: {
      card: l("Timer de manche, façon Fastr", "Round timer, Fastr style"),
      page: l("Timer de manche, façon Fastr", "Round timer, Fastr style"),
    },
    description: {
      card: l(
        "120 secondes par manche, les dix dernières dans le rouge. Accéléré ×8 ici, pour épargner l'attente.",
        "120 seconds per round, the last ten in the red. Sped up ×8 here, to spare the wait.",
      ),
      page: l(
        "120 secondes par manche, quatre manches, les dix dernières secondes dans le rouge. Chaque mot validé rapporte 100 points plus un bonus de vitesse qui fond : 119 pour le premier, 118 pour le suivant. Tous les trois mots, un malus part chez l'adversaire.",
        "120 seconds per round, four rounds, the last ten seconds in the red. Every validated word earns 100 points plus a melting speed bonus: 119 for the first, 118 for the next. Every three words, a penalty flies to the opponent.",
      ),
    },
    tags: {
      card: l(["React", "Socket.IO", "8 bits"], ["React", "Socket.IO", "8-bit"]),
      page: l(["temps réel", "UI de jeu", "rAF", "8 bits"], ["real time", "game UI", "rAF", "8-bit"]),
    },
    how: l(
      [
        "Le temps restant est calculé depuis l'horloge, pas en comptant les images.",
        "24 segments s'éteignent un à un ; sous 10 secondes, tout passe au rouge.",
        "Le score suit la règle du jeu : 100 points, plus un bonus qui baisse à chaque mot.",
      ],
      [
        "Remaining time is computed from the clock, not by counting frames.",
        "24 segments switch off one by one; under 10 seconds, everything turns red.",
        "Scoring follows the game's rule: 100 points, plus a bonus that drops with every word.",
      ],
    ),
    demo: "round-timer",
    code: { filename: "round-timer.js", language: "js", short: timerShort, full: timerFull },
  },
  {
    id: "icon-grid",
    number: "03",
    status: "playable",
    from: "iconic",
    origin: l("Tiré d'Iconic", "From Iconic"),
    title: {
      card: l("Grille d'icônes, façon Iconic", "Icon grid, Iconic style"),
      page: l("Grille d'icônes à retourner", "Flip-card icon grid"),
    },
    description: {
      card: l(
        "Retourner les cartes une à une. Dans le vrai jeu, il faut d'abord trouver à qui appartient l'objet.",
        "Flip the cards one by one. In the real game, the owner of the object has to be found first.",
      ),
      page: l(
        "Huit cartes, une rotation en CSS pur et un état que le clavier et les lecteurs d'écran comprennent. Dans le vrai jeu, il faut d'abord deviner à qui appartient l'objet : ici, chaque carte retournée rapporte 25 ICoins, comme une bonne réponse.",
        "Eight cards, a pure CSS rotation and a state that keyboards and screen readers understand. In the real game, the owner of the object has to be guessed first: here, every flipped card earns 25 ICoins, like a right answer.",
      ),
    },
    tags: {
      card: l(["CSS 3D", "XState", "a11y"], ["CSS 3D", "XState", "a11y"]),
      page: l(["CSS 3D", "a11y", "UI de jeu", "aria-pressed"], ["CSS 3D", "a11y", "game UI", "aria-pressed"]),
    },
    how: l(
      [
        "Chaque carte est un bouton dont l'état vit dans `aria-pressed`.",
        "Le CSS lit ce même attribut pour faire tourner la carte en 3D.",
        "Un seul écouteur gère toute la grille, clavier et lecteur d'écran compris.",
      ],
      [
        "Every card is a button whose state lives in `aria-pressed`.",
        "CSS reads that same attribute to rotate the card in 3D.",
        "A single listener handles the whole grid, keyboard and screen reader included.",
      ],
    ),
    demo: "icon-grid",
    code: { filename: "flip-card.css", language: "css", short: flipShort, full: flipFull },
  },
  {
    id: "rollback",
    number: "04",
    status: "soon",
    from: "one-piexel",
    title: {
      card: l("Le rollback, image par image", "Rollback, frame by frame"),
      page: l("Le rollback, image par image", "Rollback, frame by frame"),
    },
    description: {
      card: l(
        "Le moteur prédit les entrées de l'adversaire, puis revient jusqu'à 8 images en arrière pour rejouer.",
        "The engine predicts the opponent's inputs, then rolls back up to 8 frames to replay.",
      ),
      page: l(
        "Le moteur prédit les entrées de l'adversaire, puis revient jusqu'à 8 images en arrière pour rejouer. À venir : un curseur pour régler le retard et voir la correction se faire.",
        "The engine predicts the opponent's inputs, then rolls back up to 8 frames to replay. Coming: a slider to set the delay and watch the correction happen.",
      ),
    },
    tags: {
      card: l(["temps réel", "algo", "netcode"], ["real time", "algo", "netcode"]),
      page: l(["temps réel", "algo", "netcode"], ["real time", "algo", "netcode"]),
    },
  },
  {
    id: "brick-wall",
    number: "05",
    status: "soon",
    from: "fastr",
    title: {
      card: l("Le mur de briques", "The brick wall"),
      page: l("Le mur de briques", "The brick wall"),
    },
    description: {
      card: l(
        "Un des 13 malus de Fastr : quatre caractères maximum dans la zone de saisie, le temps que le mur tombe.",
        "One of Fastr's 13 penalties: four characters at most in the input area until the wall comes down.",
      ),
      page: l(
        "Un des 13 malus de Fastr : quatre caractères maximum dans la zone de saisie, le temps que le mur tombe. À subir sur son propre clavier.",
        "One of Fastr's 13 penalties: four characters at most in the input area until the wall comes down. To be endured on your own keyboard.",
      ),
    },
    tags: {
      card: l(["UI de jeu", "animation", "malus"], ["game UI", "animation", "penalty"]),
      page: l(["UI de jeu", "animation", "malus"], ["game UI", "animation", "penalty"]),
    },
  },
  {
    id: "typo-tolerance",
    number: "06",
    status: "soon",
    from: "fastr",
    title: {
      card: l("La tolérance aux fautes de frappe", "Typo tolerance"),
      page: l("La tolérance aux fautes de frappe", "Typo tolerance"),
    },
    description: {
      card: l(
        "Fastr pardonne une faute par mot, deux à partir de 12 lettres.",
        "Fastr forgives one typo per word, two from 12 letters up.",
      ),
      page: l(
        "Fastr pardonne une faute par mot, deux à partir de 12 lettres. Un champ pour taper, la distance de Levenshtein calculée en direct.",
        "Fastr forgives one typo per word, two from 12 letters up. A field to type in, the Levenshtein distance computed live.",
      ),
    },
    tags: {
      card: l(["algo", "UI de jeu", "Levenshtein"], ["algo", "game UI", "Levenshtein"]),
      page: l(["algo", "UI de jeu", "Levenshtein"], ["algo", "game UI", "Levenshtein"]),
    },
  },
];

export const playableExperiments = experiments.filter((e) => e.status === "playable");
export const getExperiment = (id: ExperimentId): Experiment => experiments.find((e) => e.id === id)!;

/** Filter chips of the Nid page. */
export const experimentFilters = l(
  ["animation", "pixel art", "temps réel", "UI de jeu", "CSS 3D", "a11y", "algo"],
  ["animation", "pixel art", "real time", "game UI", "CSS 3D", "a11y", "algo"],
);
