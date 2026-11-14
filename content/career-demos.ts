import type { WorkId } from "./career";
import { l, type Locale, type Localized } from "./types";

/**
 * Texts and fictional data of the six replayable demos of the career page.
 * One entry per achievement, rendered by the component of the same name in
 * `src/components/career/demos/`. Everything here is neutral, made-up data.
 */
export const careerDemos = {
  "screenshot-bot": {
    tweet: {
      name: "Corvus Web Studio",
      handle: "@corvus",
      time: l("2 h", "2h"),
      text: l(
        "Un bon outil, c'est celui qu'on oublie qu'on utilise.",
        "A good tool is one you forget you are using.",
      ),
    },
    stepsLabel: l("Étapes du pipeline", "Pipeline steps"),
    steps: l(["Récupérer", "Rendre", "Exporter"], ["Fetch", "Render", "Export"]),
    outputLabel: l(
      "Capture générée : le tweet recadré sur un fond dégradé",
      "Generated capture: the tweet cropped on a gradient background",
    ),
    formatLabel: l("Format de sortie", "Output format"),
    formats: { image: l("Image", "Image"), video: l("Vidéo", "Video") },
    files: { image: "tweet-capture.png", video: "tweet-capture.mp4" },
    run: l("Relancer la capture", "Run the capture again"),
  },

  "entity-builder": {
    rulesTitle: l("Règles", "Rules"),
    rulesHint: l("données →", "data →"),
    previewTitle: l("Aperçu live", "Live preview"),
    previewHint: l("données fictives", "fictional data"),
    ifLabel: l("SI", "IF"),
    thenLabel: l("ALORS", "THEN"),
    rules: {
      top: {
        condition: l("buts ≥ 10", "goals ≥ 10"),
        effect: l("badge « Top buteur » + contour", "\"Top scorer\" badge + outline"),
        toggle: l("Le joueur a marqué 10 buts ou plus", "The player scored 10 goals or more"),
      },
      live: {
        condition: l("match en cours", "match in progress"),
        effect: l("afficher le score en direct", "show the live score"),
        toggle: l("Un match est en cours", "A match is in progress"),
      },
      out: {
        condition: l("statut = blessé", "status = injured"),
        effect: l("griser la fiche + « Indisponible »", "grey out the card + \"Unavailable\""),
        toggle: l("Le joueur est blessé", "The player is injured"),
      },
    },
    player: {
      initials: "AM",
      name: "A. Morel",
      role: l("Attaquant · n° 9", "Striker · no. 9"),
      goals: { top: "12", base: "7" },
      stats: [
        { value: "5", label: l("passes D.", "assists") },
        { value: "21", label: l("matchs", "matches") },
      ],
      goalsLabel: l("buts", "goals"),
    },
    badges: { top: l("Top buteur", "Top scorer"), out: l("Indisponible", "Unavailable") },
    liveLabel: l("EN DIRECT 67'", "LIVE 67'"),
    liveScore: l("Domicile 2 – 1 Visiteur", "Home 2 – 1 Away"),
  },

  monorepo: {
    stateLabel: l("État du code", "State of the code"),
    before: l("Avant", "Before"),
    after: l("Après", "After"),
    note: l("noms fictifs", "fictional names"),
    diagramLabel: l(
      "Schéma : six dépôts séparés et reliés par des dépendances croisées convergent vers un monorepo rangé en apps et packages",
      "Diagram: six separate repositories linked by crossed dependencies converge into a monorepo organised in apps and packages",
    ),
    legendBefore: l(
      "N dépôts · N pipelines · versions désalignées",
      "N repositories · N pipelines · misaligned versions",
    ),
    legendAfter: l(
      "1 dépôt · 1 pipeline · 1 version par dépendance",
      "1 repository · 1 pipeline · 1 version per dependency",
    ),
  },

  "adtech-forms": {
    stepsLabel: l("Étapes du formulaire", "Form steps"),
    steps: l(["Ciblage", "Créas", "Réglages"], ["Targeting", "Creatives", "Settings"]),
    ages: { label: l("Tranches d'âge", "Age groups"), options: ["18-24", "25-34", "35-49", "50+"] },
    interests: {
      label: l("Centres d'intérêt", "Interests"),
      options: ["Running", "Trail", "Fitness", "Outdoor"],
    },
    audience: {
      label: l("Audience estimée", "Estimated audience"),
      empty: l("vide", "empty"),
      narrow: l("étroite", "narrow"),
      balanced: l("équilibrée", "balanced"),
      wide: l("large", "wide"),
    },
    ageError: l("Au moins une tranche d'âge est requise.", "At least one age group is required."),
    hook: {
      label: l("Accroche", "Headline"),
      options: l(
        ["Cours plus loin.", "Prêt pour dimanche ?", "La prochaine paire attend."],
        ["Run further.", "Ready for Sunday?", "The next pair is waiting."],
      ),
    },
    visual: {
      label: l("Visuel", "Visual"),
      options: [
        { gradient: "linear-gradient(135deg,#7C5CFF,#3DDC97)", name: l("Visuel violet et vert", "Purple and green visual") },
        { gradient: "linear-gradient(135deg,#FF8A3D,#E0457B)", name: l("Visuel orange et rose", "Orange and pink visual") },
        { gradient: "linear-gradient(135deg,#2C6BFF,#29D8FF)", name: l("Visuel bleu", "Blue visual") },
      ],
    },
    format: {
      label: l("Format", "Format"),
      square: l("Carré 1:1", "Square 1:1"),
      portrait: l("Portrait 4:5", "Portrait 4:5"),
    },
    budget: { label: l("Budget par jour", "Daily budget"), perDay: l("€/j", "€/day") },
    placements: {
      label: l("Placements", "Placements"),
      options: l(["Fil d'actualité", "Stories"], ["News feed", "Stories"]),
      none: l("Aucun placement", "No placement"),
    },
    placementError: l("Au moins un placement est requis.", "At least one placement is required."),
    action: {
      label: l("Bouton d'action", "Call to action"),
      options: l(["Acheter", "En savoir plus", "S'inscrire"], ["Shop now", "Learn more", "Sign up"]),
    },
    back: l("Retour", "Back"),
    next: l("Suivant", "Next"),
    restart: l("Recommencer", "Start over"),
    brand: l("Marque fictive", "Fictional brand"),
    sponsored: l("Sponsorisé", "Sponsored"),
    noAge: l("âge ?", "age?"),
    allInterests: l("tous intérêts", "all interests"),
  },

  "db-redesign": {
    stateLabel: l("État du schéma", "State of the schema"),
    before: l("Avant", "Before"),
    after: l("Après", "After"),
    note: l("survol : relations", "hover: relations"),
    beforeLabel: l(
      "Avant : une seule table users qui mélange identité, société, rôles et marques",
      "Before: a single users table mixing identity, company, roles and brands",
    ),
    afterLabel: l(
      "Après : six tables reliées. users, memberships, orgs, profiles, roles, brands",
      "After: six linked tables. users, memberships, orgs, profiles, roles, brands",
    ),
    warnings: l(
      ["société répétée par ligne", "1 colonne par rôle", "1 colonne par marque"],
      ["company repeated on every row", "1 column per role", "1 column per brand"],
    ),
  },

  serverless: {
    flowLabel: l(
      "Flux : un événement entre dans une queue, une Lambda le traite, puis un hook notifie les autres services. En cas d'échec, le message retourne dans la queue.",
      "Flow: an event enters a queue, a Lambda processes it, then a hook notifies the other services. On failure, the message goes back to the queue.",
    ),
    nodes: {
      event: { title: l("Événement", "Event"), sub: l("API sport", "Sports API") },
      queue: { title: l("Queue", "Queue"), sub: l("file d'attente", "waiting line") },
      lambda: { title: l("Lambda", "Lambda") },
      hook: { title: l("Hook", "Hook"), sub: l("notification", "notification") },
    },
    status: {
      idle: l("en attente", "idle"),
      processing: l("traitement…", "processing…"),
      failed: l("échec, on rejoue", "failed, replaying"),
      ok: l("ok", "ok"),
    },
    counters: { queued: l("En file", "Queued"), done: l("Traités", "Processed"), replayed: l("Rejoués", "Replayed") },
    send: l("Envoyer un événement", "Send an event"),
  },
} as const satisfies Record<WorkId, unknown>;

/** A content tree with every `Localized` leaf resolved for one locale. */
export type Resolved<T> = T extends { readonly fr: infer V; readonly en: unknown }
  ? V
  : T extends readonly (infer Item)[]
    ? ReadonlyArray<Resolved<Item>>
    : T extends object
      ? { readonly [K in keyof T]: Resolved<T[K]> }
      : T;

const isLocalized = (value: object): value is Localized<unknown> => {
  const keys = Object.keys(value);
  return keys.length === 2 && "fr" in value && "en" in value;
};

/** Resolves every `l("…", "…")` pair of a content tree for a locale. */
export function resolveContent<T>(value: T, locale: Locale): Resolved<T> {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      if (isLocalized(node)) return walk(node[locale]);
      return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, walk(child)]));
    }
    return node;
  };
  return walk(value) as Resolved<T>;
}

export type CareerDemoContent<Id extends WorkId> = Resolved<(typeof careerDemos)[Id]>;
