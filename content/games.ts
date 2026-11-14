import { l, type Figure, type Localized } from "./types";
import type { SocialId } from "./site";

/**
 * The three games of the studio, in showcase order:
 * One Piexel (full-width showcase), then Fastr and Iconic.
 * Texts come from the validated mockups (home page + game pages).
 */

export type GameSlug = "one-piexel" | "fastr" | "iconic";
/** Short key used by the skin classes (`.sk-op`, `.g-fa`, …). */
export type GameSkinKey = "op" | "fa" | "ic";
export type GameStatus = "released" | "beta" | "in-development";

export interface GameImage {
  src: string;
  width: number;
  height: number;
  alt: Localized;
  caption?: Localized;
}

export interface GameChallenge {
  title: Localized;
  body: Localized;
  figures: Figure[];
}

export interface Game {
  slug: GameSlug;
  skin: GameSkinKey;
  name: string;
  /** Public URL of the game and its display form. */
  url: string;
  domain: string;
  status: GameStatus;
  /** Status chip as written on the cards ("SORTI · V3 LE 14 NOV."). */
  statusLabel: Localized;
  /** Long status used in fact sheets. */
  statusDetail: Localized;
  /** Sub-title under the logo, home card and game page. */
  tagline: { card: Localized; page: Localized };
  genre: Localized;
  pitch: { card: Localized; page: Localized };
  /** Three figures on the home card. */
  cardStats: Figure[];
  /** Four KPIs on the game page. */
  kpis: Figure[];
  platforms: Localized<string[]>;
  /** Fact sheet of the game page (label → value). */
  facts: Array<{ label: Localized; value: Localized }>;
  pitchSection: { title: Localized; paragraphs: Localized<string[]> };
  challenge: { title: Localized; lede: Localized; items: GameChallenge[] };
  role: {
    title: Localized;
    body: Localized;
    items: Array<{ label: Localized; detail: Localized }>;
  };
  /** Stack by group; `key` marks the headline technologies. */
  stack: Array<{ group: Localized; items: Array<{ name: Localized | string; key?: boolean }> }>;
  /** Skin palette (also documented in src/styles/skins.css). */
  colors: {
    /** Dot colour for news tags and filters. */
    tag: string;
    background: string;
    text: string;
    accent: string;
    border: string;
    secondary: string;
  };
  media: {
    /** Poster of the game page hero. */
    poster: GameImage;
    /** Image(s) shown on the home card. */
    card: GameImage[];
    logo?: { src: string; width: number; height: number };
    trailer?: { src: string; duration: Localized; label: Localized };
    gallery: GameImage[];
    mini: string;
  };
  galleryTitle: Localized;
  callToAction: { title: Localized; text: Localized };
  /** Networks listed on the game page, in order. */
  socials: SocialId[];
  /** Legal note (fan game). */
  disclaimer?: { short: Localized; long: Localized };
  /** One-liner used when the game is listed among "other games". */
  teaser: Localized;
}

const img = (
  src: string,
  width: number,
  height: number,
  alt: Localized,
  caption?: Localized,
): GameImage => ({ src, width, height, alt, ...(caption ? { caption } : {}) });

const onePiexel: Game = {
  slug: "one-piexel",
  skin: "op",
  name: "One Piexel",
  url: "https://one-piexel.gg",
  domain: "one-piexel.gg",
  status: "released",
  statusLabel: l("SORTI · V3 LE 14 NOV.", "RELEASED · V3 ON NOV 14"),
  statusDetail: l("Sorti · V3 le 14 novembre 2026", "Released · V3 on November 14, 2026"),
  tagline: { card: l("FIGHTING GAME", "FIGHTING GAME"), page: l("FIGHTING GAME", "FIGHTING GAME") },
  genre: l("Versus fighting 2D en pixel art, fan game", "2D pixel art versus fighting, fan game"),
  pitch: {
    card: l(
      "Le jeu de combat One Piece sur navigateur, en pixel art. Du versus 2D en ligne, un mode classé avec matchmaking, et déjà des centaines d'heures de jeu cumulées.",
      "The One Piece fighting game in the browser, in pixel art. Online 2D versus, a ranked mode with matchmaking, and already hundreds of hours played.",
    ),
    page: l(
      "Le jeu de combat One Piece sur navigateur, en pixel art. 51 combattants, des ultimes à déclencher et une prime à faire grimper jusqu'au titre de Joy Boy.",
      "The One Piece fighting game in the browser, in pixel art. 51 fighters, ultimates to unleash and a bounty to raise all the way to the Joy Boy title.",
    ),
  },
  cardStats: [
    { value: "51", label: l("combattants", "fighters") },
    { value: "600+", label: l("parties classées", "ranked matches") },
    { value: l("100 %", "100%"), label: l("navigateur", "browser") },
  ],
  kpis: [
    {
      value: "600+",
      label: l("parties classées, des centaines d'heures de jeu", "ranked matches, hundreds of hours played"),
    },
    { value: "51", label: l("combattants jouables", "playable fighters") },
    { value: "9", label: l("paliers classés, jusqu'à Roi des Pirates", "ranked tiers, up to Pirate King") },
    { value: "60 Hz", label: l("de boucle de jeu fixe", "fixed game loop") },
  ],
  platforms: l(
    ["Navigateur, sans installation", "Ordinateur et mobile", "Clavier, tactile, manette", "Gratuit"],
    ["Browser, nothing to install", "Desktop and mobile", "Keyboard, touch, gamepad", "Free"],
  ),
  facts: [
    { label: l("GENRE", "GENRE"), value: l("Versus fighting 2D en pixel art, fan game", "2D pixel art versus fighting, fan game") },
    {
      label: l("EN LIGNE", "ONLINE"),
      value: l("Partie amicale, partie classée, salon à code, spectateurs", "Casual match, ranked match, room codes, spectators"),
    },
    {
      label: l("SOLO", "SOLO"),
      value: l(
        "Arcade, arcade HARDCORE, entraînement, versus ordinateur, tournoi",
        "Arcade, HARDCORE arcade, training, versus CPU, tournament",
      ),
    },
    { label: l("PLATEFORMES", "PLATFORMS"), value: l("Navigateur, ordinateur et mobile", "Browser, desktop and mobile") },
    { label: l("CONTRÔLES", "CONTROLS"), value: l("Clavier, tactile, manette", "Keyboard, touch, gamepad") },
    { label: l("LANGUES", "LANGUAGES"), value: l("Français, anglais", "French, English") },
  ],
  pitchSection: {
    title: l("Un vrai versus, sans rien installer.", "A real versus game, nothing to install."),
    paragraphs: l(
      [
        "One Piexel est un jeu de combat 2D en 1 contre 1, au meilleur des trois manches. Coups légers et lourds, spéciaux directionnels, chope, projection arrière, garde, parade, super armure, jauge, ultime et ultime max : la panoplie complète d'un versus sérieux.",
        "Une partie amicale se lance avec un code de salon ; une partie classée fait grimper une prime en berries. Pendant la recherche d'adversaire, l'arcade et l'entraînement restent jouables.",
      ],
      [
        "One Piexel is a 1-on-1 2D fighting game, best of three rounds. Light and heavy attacks, directional specials, grab, back throw, guard, parry, super armor, meter, ultimate and max ultimate: the full toolkit of a serious versus game.",
        "A casual match starts with a room code; a ranked match raises a bounty in berries. While searching for an opponent, arcade and training stay playable.",
      ],
    ),
  },
  challenge: {
    title: l("Un moteur de combat maison, dans un onglet.", "A home-made fighting engine, in a browser tab."),
    lede: l(
      "Un jeu de combat en ligne ne pardonne rien : une image de retard, et le coup ne sort pas. Trois chantiers pour que tout tienne dans un navigateur : le moteur, le matchmaking, l'équilibrage.",
      "An online fighting game forgives nothing: one frame late and the move does not come out. Three workstreams to make it all fit in a browser: the engine, matchmaking, balancing.",
    ),
    items: [
      {
        title: l(
          "Un moteur de combat déterministe, taillé pour le rollback",
          "A deterministic fighting engine, built for rollback",
        ),
        body: l(
          "Le moteur n'utilise ni Math.random, ni horloge, ni sinus : les trajectoires passent par des tables d'entiers. Le jeu peut donc prédire les entrées adverses, revenir jusqu'à 8 images en arrière et rejouer. La boucle tourne à 60 Hz fixe, même sur un écran 144 Hz.",
          "The engine uses no Math.random, no clock and no sine: trajectories go through integer tables. The game can therefore predict the opponent's inputs, roll back up to 8 frames and replay. The loop runs at a fixed 60 Hz, even on a 144 Hz display.",
        ),
        figures: [
          { value: l("0,01 ms", "0.01 ms"), label: l("par pas de simulation", "per simulation step") },
          { value: l("0,009 ms", "0.009 ms"), label: l("par clone d'état", "per state clone") },
        ],
      },
      {
        title: l("Un matchmaking classé par primes", "Ranked matchmaking driven by bounties"),
        body: l(
          "Le rang est une prime en berries : 5 parties de placement, un bouclier de palier, une recherche qui s'élargit quand l'attente dure. Côté serveur, la graine du combat est tirée par le serveur, la file se réserve par mises à jour conditionnelles et un abandon compte comme une défaite.",
          "Rank is a bounty in berries: 5 placement matches, a tier shield, a search that widens when the wait gets long. Server side, the fight seed is drawn by the server, the queue is reserved with conditional updates, and a forfeit counts as a loss.",
        ),
        figures: [
          { value: "9", label: l("paliers, jusqu'à Roi des Pirates", "tiers, up to Pirate King") },
          { value: l("3 / 24 h", "3 / 24 h"), label: l("classées max contre le même joueur", "ranked matches max against the same player") },
        ],
      },
      {
        title: l("51 combattants à intégrer, puis à équilibrer", "51 fighters to integrate, then to balance"),
        body: l(
          "Chaque combattant arrive avec ses sprites, ses voix, ses spéciaux et son ultime. Vient ensuite l'équilibrage, patch après patch : parade, super armure, brise-garde, ultimes max retouchés. Un test aléatoire fait s'affronter tout le roster sans trouver ni combat sans fin, ni valeur invalide.",
          "Each fighter comes with sprites, voices, specials and an ultimate. Then comes balancing, patch after patch: parry, super armor, guard break, reworked max ultimates. A randomized test pits the whole roster against itself without finding an endless fight or an invalid value.",
        ),
        figures: [
          { value: l("5 046", "5,046"), label: l("tests automatiques", "automated tests") },
          { value: "362", label: l("clips de voix intégrés", "voice clips integrated") },
        ],
      },
    ],
  },
  role: {
    title: l("Un seul auteur, du sprite au serveur.", "A single author, from sprite to server."),
    body: l(
      "Dylan a créé One Piexel seul : game design, direction artistique, développement. Le moteur de combat, le versus en ligne, le matchmaking et l'intégration de chaque combattant sortent du même clavier, et chaque patch note est livré avec ses tests.",
      "Dylan built One Piexel alone: game design, art direction, development. The fighting engine, online versus, matchmaking and the integration of every fighter come from the same keyboard, and every patch ships with its tests.",
    ),
    items: [
      { label: l("Game design", "Game design"), detail: l("mécaniques, modes, équilibrage", "mechanics, modes, balancing") },
      { label: l("Moteur de combat", "Fighting engine"), detail: l("déterministe, rendu Canvas 2D", "deterministic, Canvas 2D rendering") },
      { label: l("Versus en ligne", "Online versus"), detail: l("pair à pair, rollback, spectateurs", "peer-to-peer, rollback, spectators") },
      { label: l("Matchmaking et classement", "Matchmaking and ranking"), detail: l("primes, paliers, anti-triche", "bounties, tiers, anti-cheat") },
      { label: l("Design et sprites", "Design and sprites"), detail: l("intégration, icônes, interface arcade", "integration, icons, arcade interface") },
    ],
  },
  stack: [
    {
      group: l("JEU", "GAME"),
      items: [
        { name: "Canvas", key: true },
        { name: "Next.js", key: true },
        { name: "TypeScript" },
        { name: l("Moteur maison", "Custom engine") },
        { name: l("Atlas de sprites", "Sprite atlases") },
      ],
    },
    {
      group: l("EN LIGNE", "ONLINE"),
      items: [
        { name: "PeerJS", key: true },
        { name: l("Netcode rollback", "Rollback netcode") },
        { name: l("Salons à code", "Room codes") },
        { name: l("Mode spectateur", "Spectator mode") },
      ],
    },
    {
      group: l("SERVEUR", "SERVER"),
      items: [
        { name: "MongoDB", key: true },
        { name: l("Comptes et classement", "Accounts and leaderboard") },
        { name: l("Matchmaking classé", "Ranked matchmaking") },
      ],
    },
    {
      group: l("QUALITÉ", "QUALITY"),
      items: [
        { name: l("5 046 tests", "5,046 tests") },
        { name: l("Fuzz du roster", "Roster fuzzing") },
        { name: l("Outils Python (sprites)", "Python tooling (sprites)") },
      ],
    },
  ],
  colors: {
    tag: "#ffd23f",
    background: "#160912",
    text: "#ffffff",
    accent: "#ffd23f",
    border: "#3a1420",
    secondary: "#ff6b4a",
  },
  media: {
    poster: img(
      "/images/games/one-piexel/poster.jpg",
      1280,
      720,
      l(
        "Écran titre de One Piexel : le logo en pixel art au-dessus de tout le roster rassemblé",
        "One Piexel title screen: the pixel art logo above the whole roster",
      ),
    ),
    card: [
      img(
        "/images/games/one-piexel/op-52.jpg",
        640,
        360,
        l(
          "One Piexel : un combat en pixel art sur le pont du Baratie, attaque spéciale en cours",
          "One Piexel: a pixel art fight on the deck of the Baratie, special attack in progress",
        ),
      ),
      img(
        "/images/games/one-piexel/op-30.jpg",
        640,
        316,
        l("Écran d'entrée en scène d'un combattant", "A fighter's entrance screen"),
      ),
    ],
    trailer: {
      src: "/videos/one-piexel-trailer.mp4",
      duration: l("1 MIN 39", "1 MIN 39"),
      label: l("TRAILER", "TRAILER"),
    },
    gallery: [
      img(
        "/images/games/one-piexel/op-52.jpg",
        640,
        360,
        l("Combat sur le pont du Baratie, une attaque spéciale en cours", "Fight on the deck of the Baratie, a special attack in progress"),
        l("Un spécial en plein combo sur le pont du Baratie.", "A special mid-combo on the deck of the Baratie."),
      ),
      img(
        "/images/games/one-piexel/op-86.jpg",
        640,
        360,
        l("Un ultime déclenché à Water Seven, colonne de lumière jaune", "An ultimate unleashed in Water Seven, a column of yellow light"),
        l("Ultime max : jauge pleine, tout l'écran s'en souvient.", "Max ultimate: full meter, the whole screen remembers."),
      ),
      img(
        "/images/games/one-piexel/op-62.jpg",
        640,
        360,
        l("Barbe Blanche frappe à Marineford", "Whitebeard strikes at Marineford"),
        l("Marineford, 77 secondes au chrono, un coup lourd qui part.", "Marineford, 77 seconds on the clock, a heavy attack on its way."),
      ),
      img(
        "/images/games/one-piexel/op-30.jpg",
        640,
        316,
        l("Entrée en scène d'un combattant : portrait à gauche, sprite à droite", "A fighter's entrance: portrait on the left, sprite on the right"),
        l("Chaque combattant a son entrée en scène.", "Every fighter gets an entrance."),
      ),
      img(
        "/images/games/one-piexel/op-72.jpg",
        640,
        360,
        l("Duel à Arlong Park avec le bandeau Connexion fluide, mode spectateur", "Duel at Arlong Park with the smooth connection banner, spectator mode"),
        l("Versus en ligne à Arlong Park, avec le mode spectateur.", "Online versus at Arlong Park, with spectator mode."),
      ),
      img(
        "/images/games/one-piexel/classement.jpg", 1280, 720,
        l("Écran Classement : le top 10 des plus grosses primes et le titre Joy Boy", "Leaderboard screen: the top 10 bounties and the Joy Boy title"),
        l("Le top 10 des primes. Le numéro 1 porte le titre de Joy Boy.", "The top 10 bounties. Number 1 holds the Joy Boy title."),
      ),
    ],
    mini: "/images/games/one-piexel/mini.jpg",
  },
  galleryTitle: l("Le jeu, manette en main.", "The game, controller in hand."),
  callToAction: {
    title: l("PRÊT À COMBATTRE ?", "READY TO FIGHT?"),
    text: l(
      "Gratuit, sans installation. Le jeu s'ouvre dans un onglet, sur ordinateur comme sur mobile.",
      "Free, nothing to install. The game opens in a tab, on desktop and mobile alike.",
    ),
  },
  socials: ["tiktok", "youtube", "twitch", "x"],
  disclaimer: {
    short: l(
      "Fan game non officiel, non affilié aux ayants droit.",
      "Unofficial fan game, not affiliated with the rights holders.",
    ),
    long: l(
      "Fan game non officiel, non affilié. Projet de fan, sans lien avec les ayants droit de la licence dont il s'inspire.",
      "Unofficial, unaffiliated fan game. A fan project with no connection to the rights holders of the licence it is inspired by.",
    ),
  },
  teaser: l(
    "Le jeu de combat One Piece sur navigateur, en pixel art : 51 combattants, versus en ligne.",
    "The One Piece fighting game in the browser, in pixel art: 51 fighters, online versus.",
  ),
};

const fastr: Game = {
  slug: "fastr",
  skin: "fa",
  name: "Fastr",
  url: "https://fastr.gg",
  domain: "fastr.gg",
  status: "released",
  statusLabel: l("SORTI", "RELEASED"),
  statusDetail: l("Sorti", "Released"),
  tagline: {
    card: l("> course de mots multijoueur, en temps réel", "> multiplayer word race, in real time"),
    page: l("> course de mots, en temps réel", "> word race, in real time"),
  },
  genre: l("Course de mots multijoueur, party game", "Multiplayer word race, party game"),
  pitch: {
    card: l(
      "Une course multijoueur : trouver le plus vite possible des mots d'un thème, en 4 manches chronométrées. Bonus, malus et scoring en direct.",
      "A multiplayer race: find words on a theme as fast as possible, over 4 timed rounds. Bonuses, penalties and live scoring.",
    ),
    page: l(
      "Une course multijoueur : trouver le plus vite possible des mots d'un thème, en 4 manches chronométrées. Avec des malus pour saboter le clavier d'en face.",
      "A multiplayer race: find words on a theme as fast as possible, over 4 timed rounds. With penalties to sabotage the keyboard across the table.",
    ),
  },
  cardStats: [
    { value: "300+", label: l("parties jouées", "games played") },
    { value: l("175 000+", "175,000+"), label: l("mots", "words") },
    { value: "4", label: l("manches", "rounds") },
  ],
  kpis: [
    { value: "300+", label: l("parties jouées", "games played") },
    { value: l("175 000+", "175,000+"), label: l("mots dans les dictionnaires", "words in the dictionaries") },
    { value: "19", label: l("thèmes, de Pokémon à la mythologie", "themes, from Pokémon to mythology") },
    { value: "13", label: l("malus pour saboter la saisie", "penalties to sabotage typing") },
  ],
  platforms: l(
    ["Navigateur, sans installation", "Ordinateur et mobile", "Sans compte : un pseudo, un lien", "Jeu en français"],
    ["Browser, nothing to install", "Desktop and mobile", "No account: a nickname, a link", "Game in French"],
  ),
  facts: [
    { label: l("GENRE", "GENRE"), value: l("Course de mots multijoueur, party game", "Multiplayer word race, party game") },
    {
      label: l("FORMAT", "FORMAT"),
      value: l("4 manches de 120 s, objectif 20 mots par manche", "4 rounds of 120 s, goal of 20 words per round"),
    },
    { label: l("MÉCANIQUE", "MECHANICS"), value: l("Mots, malus, bonus de vitesse, scoring", "Words, penalties, speed bonus, scoring") },
    {
      label: l("THÈMES", "THEMES"),
      value: l(
        "Pokémon, One Piece, Star Wars, Disney, Marvel, Cuisine, Géographie… 19 au total",
        "Pokémon, One Piece, Star Wars, Disney, Marvel, Cooking, Geography… 19 in total",
      ),
    },
    { label: l("PLATEFORMES", "PLATFORMS"), value: l("Navigateur, ordinateur et mobile", "Browser, desktop and mobile") },
    { label: l("COMPTE", "ACCOUNT"), value: l("Aucun pour jouer", "None needed to play") },
  ],
  pitchSection: {
    title: l("Un thème, 4 manches, zéro pitié.", "One theme, 4 rounds, zero mercy."),
    paragraphs: l(
      [
        "Fastr est une course de mots en temps réel. Un thème, un lien de lobby à partager, puis 4 manches de 2 minutes. Chaque mot validé rapporte 100 points plus un bonus de vitesse, et un mot ne compte qu'une seule fois par partie, tous joueurs confondus.",
        "Tous les 3 mots validés, un malus part sur un adversaire. À 20 mots, la cible se choisit.",
      ],
      [
        "Fastr is a real-time word race. A theme, a lobby link to share, then 4 rounds of 2 minutes. Every validated word earns 100 points plus a speed bonus, and a word only counts once per game, across all players.",
        "Every 3 validated words, a penalty flies to an opponent. At 20 words, the target can be chosen.",
      ],
    ),
  },
  challenge: {
    title: l(
      "Un game design nerveux, des dictionnaires automatisés.",
      "Tense game design, automated dictionaries.",
    ),
    lede: l(
      "Deux problèmes à résoudre : rendre une liste de mots aussi tendue qu'une course, et alimenter 19 thèmes sans saisir 175 000 mots à la main.",
      "Two problems to solve: make a list of words as tense as a race, and feed 19 themes without typing 175,000 words by hand.",
    ),
    items: [
      {
        title: l("Un game design où chaque mot est une décision", "Game design where every word is a decision"),
        body: l(
          "100 points par mot, plus un bonus qui fond à chaque seconde. Un mot validé est perdu pour tous les autres joueurs. Tous les 3 mots, un malus part chez un adversaire : mur de briques, gel mental, clavier bègue, signal perdu… Treize façons de casser la saisie, chacune avec sa règle serveur et son effet 8 bits.",
          "100 points per word, plus a bonus that melts every second. A validated word is lost to every other player. Every 3 words, a penalty lands on an opponent: brick wall, brain freeze, stuttering keyboard, lost signal… Thirteen ways to break typing, each with its server rule and its 8-bit effect.",
        ),
        figures: [
          { value: "13", label: l("malus jouables", "playable penalties") },
          { value: "650 ms", label: l("de retard max sous le gel mental", "max delay under brain freeze") },
        ],
      },
      {
        title: l(
          "Des dictionnaires construits et améliorés automatiquement",
          "Dictionaries built and improved automatically",
        ),
        body: l(
          "Chaque thème passe par la même chaîne automatisée : collecte de sources, alias, validation, tests de comportement, import en base. La reconnaissance accepte accents, apostrophes, alias et fautes de frappe, avec une distance de Levenshtein de 1, ou 2 à partir de 12 lettres.",
          "Every theme goes through the same automated pipeline: source collection, aliases, validation, behaviour tests, database import. Matching accepts accents, apostrophes, aliases and typos, with a Levenshtein distance of 1, or 2 from 12 letters up.",
        ),
        figures: [
          { value: l("175 000+", "175,000+"), label: l("mots sur 19 thèmes", "words across 19 themes") },
          { value: l("19 018", "19,018"), label: l("entrées pour le seul thème Warcraft", "entries for the Warcraft theme alone") },
        ],
      },
      {
        title: l("Un serveur de jeu autoritaire en temps réel", "An authoritative real-time game server"),
        body: l(
          "Une machine à états pilote la partie : lobby, manche, transition, fin. Le serveur valide chaque mot, applique les malus et limite le débit de chaque socket avec un seau à jetons. Les écritures MongoDB sont groupées, puis vidées proprement à l'arrêt.",
          "A state machine drives the game: lobby, round, transition, end. The server validates every word, applies penalties and rate-limits each socket with a token bucket. MongoDB writes are batched, then flushed cleanly on shutdown.",
        ),
        figures: [
          { value: "8", label: l("réponses en rafale par socket", "burst answers per socket") },
          { value: "5 / s", label: l("ensuite, pas une de plus", "afterwards, not one more") },
        ],
      },
    ],
  },
  role: {
    title: l("Un seul auteur, des règles au serveur.", "A single author, from rules to server."),
    body: l(
      "Dylan a créé Fastr seul : game design, design d'interface, développement. Les règles de partie, le serveur temps réel, les malus, la fabrication des dictionnaires et le back-office viennent du même clavier.",
      "Dylan built Fastr alone: game design, interface design, development. Game rules, the real-time server, penalties, the dictionary pipeline and the back office come from the same keyboard.",
    ),
    items: [
      { label: l("Game design", "Game design"), detail: l("scoring, malus, rythme des manches", "scoring, penalties, round pacing") },
      { label: l("Serveur temps réel", "Real-time server"), detail: l("Socket.IO autoritaire, machine à états", "authoritative Socket.IO, state machine") },
      { label: l("Dictionnaires", "Dictionaries"), detail: l("chaîne automatisée, alias, tests par thème", "automated pipeline, aliases, per-theme tests") },
      { label: l("Interface", "Interface"), detail: l("borne 8 bits, 59 animations CSS", "8-bit cabinet, 59 CSS animations") },
      {
        label: l("Comptes et back-office", "Accounts and back office"),
        detail: l("administration, connexion par e-mail ou Google", "administration, sign-in by email or Google"),
      },
    ],
  },
  stack: [
    {
      group: l("FRONT", "FRONT"),
      items: [
        { name: "Next.js", key: true },
        { name: "React", key: true },
        { name: "TypeScript" },
        { name: "Tailwind CSS" },
        { name: "TanStack Store" },
      ],
    },
    {
      group: l("TEMPS RÉEL", "REAL TIME"),
      items: [
        { name: "WebSocket (Socket.IO)", key: true },
        { name: l("Serveur Node custom", "Custom Node server") },
        { name: "zod" },
        { name: l("Seau à jetons", "Token bucket") },
      ],
    },
    {
      group: l("DONNÉES", "DATA"),
      items: [
        { name: "MongoDB", key: true },
        { name: "better-auth" },
        { name: l("Écritures groupées", "Batched writes") },
      ],
    },
    {
      group: l("HÉBERGEMENT", "HOSTING"),
      items: [{ name: "Vercel" }, { name: l("Serveur Node persistant", "Persistent Node server") }],
    },
  ],
  colors: {
    tag: "#29d8ff",
    background: "#062172",
    text: "#f8fbff",
    accent: "#f7b90f",
    border: "#f7b90f",
    secondary: "#29d8ff",
  },
  media: {
    poster: img(
      "/images/games/fastr/poster.jpg",
      1280,
      720,
      l(
        "Affiche de Fastr : l'écran de jeu avec le mot Pikachu en cours de saisie, le classement, et le slogan Trouve les mots avant les autres",
        "Fastr poster: the game screen with the word Pikachu being typed, the leaderboard, and the tagline Find the words before the others",
      ),
    ),
    card: [
      img(
        "/images/games/fastr/fastr-55.jpg",
        640,
        360,
        l(
          "Fastr : une manche en cours, le malus Nuages envahissants recouvre la zone de saisie",
          "Fastr: a round in progress, the Creeping Clouds penalty covers the input area",
        ),
      ),
    ],
    trailer: {
      src: "/videos/fastr-trailer.mp4",
      duration: l("1 MIN 32", "1 MIN 32"),
      label: l("Trailer", "Trailer"),
    },
    gallery: [
      img(
        "/images/games/fastr/fastr-55.jpg",
        640,
        360,
        l("Une manche en cours : le malus Nuages envahissants recouvre les mots validés", "A round in progress: the Creeping Clouds penalty covers the validated words"),
      ),
      img(
        "/images/games/fastr/fastr-12.jpg",
        640,
        360,
        l("Écran de choix du thème de la partie, Disney sélectionné", "Theme selection screen, Disney selected"),
      ),
      img(
        "/images/games/fastr/fastr-22.jpg",
        640,
        360,
        l("Le lobby : pseudo, liste des joueurs et compte à rebours", "The lobby: nickname, player list and countdown"),
      ),
      img(
        "/images/games/fastr/fastr-46.jpg",
        640,
        360,
        l("Manche sur le thème Pokémon, un malus actif sur la zone de saisie", "A round on the Pokémon theme, a penalty active on the input area"),
      ),
      img(
        "/images/games/fastr/fastr-78.jpg",
        640,
        360,
        l("Fin de manche : 20 mots validés et la liste des mots trouvés", "End of round: 20 validated words and the list of words found"),
      ),
      img(
        "/images/games/fastr/fastr-70.jpg",
        640,
        360,
        l("Classement de la manche avant le round suivant", "Round ranking before the next round"),
      ),
    ],
    mini: "/images/games/fastr/mini.jpg",
  },
  galleryTitle: l("Une partie, du lobby au podium.", "A game, from lobby to podium."),
  callToAction: {
    title: l("UN LOBBY, UN LIEN", "ONE LOBBY, ONE LINK"),
    text: l(
      "Pas de compte à créer : un pseudo, un lien à partager, et la partie démarre sur le thème choisi.",
      "No account to create: a nickname, a link to share, and the game starts on the chosen theme.",
    ),
  },
  socials: ["youtube", "twitch", "x", "github"],
  teaser: l(
    "Une course de mots multijoueur : 19 thèmes, 13 malus, 4 manches chronométrées.",
    "A multiplayer word race: 19 themes, 13 penalties, 4 timed rounds.",
  ),
};

const iconic: Game = {
  slug: "iconic",
  skin: "ic",
  name: "Iconic",
  url: "https://iconic-game.gg",
  domain: "iconic-game.gg",
  status: "released",
  statusLabel: l("Sorti · nouveau set le 21 nov.", "Released · new set on Nov 21"),
  statusDetail: l("Sorti · nouveauté le 21 novembre", "Released · new content on November 21"),
  tagline: { card: l("Devine l'icône", "Guess the icon"), page: l("Quiz culture", "Culture quiz") },
  genre: l("Quiz culture, devinette d'icônes", "Culture quiz, icon guessing"),
  pitch: {
    card: l(
      "Une image, un objet culte, trois essais : deviner le personnage qui se cache derrière, et compléter la collection set après set.",
      "One image, one cult object, three tries: guess the character hiding behind it, and complete the collection set after set.",
    ),
    page: l(
      "Un quiz de culture pop : une image, un objet culte, trois essais pour retrouver le personnage qui se cache derrière. Chaque icône trouvée rejoint la collection.",
      "A pop culture quiz: one image, one cult object, three tries to find the character hiding behind it. Every icon found joins the collection.",
    ),
  },
  cardStats: [
    { value: "300+", label: l("icônes à trouver", "icons to find") },
    { value: l("1 000+", "1,000+"), label: l("visites", "visits") },
    { value: "100", label: l("comptes créés", "accounts created") },
  ],
  kpis: [
    { value: "300+", label: l("icônes à trouver, en 7 sets", "icons to find, across 7 sets") },
    { value: l("1 000+", "1,000+"), label: l("visites", "visits") },
    { value: "100", label: l("comptes créés", "accounts created") },
    { value: "3", label: l("essais par icône", "tries per icon") },
  ],
  platforms: l(
    ["Navigateur, sans installation", "Ordinateur et mobile", "Français, anglais", "3 sets gratuits"],
    ["Browser, nothing to install", "Desktop and mobile", "French, English", "3 free sets"],
  ),
  facts: [
    { label: l("GENRE", "GENRE"), value: l("Quiz culture, devinette d'icônes", "Culture quiz, icon guessing") },
    {
      label: l("SETS GRATUITS", "FREE SETS"),
      value: l(
        "Héros de jeux vidéo, Sportifs de légende, Stars de cinéma",
        "Video game heroes, Sports legends, Movie stars",
      ),
    },
    { label: l("SETS PAYANTS", "PAID SETS"), value: l("Méchants célèbres, Personnages de shonen", "Famous villains, Shonen characters") },
    { label: l("À VENIR", "COMING"), value: l("Figures de l'histoire, Icônes de la musique", "Historical figures, Music icons") },
    { label: l("PLATEFORMES", "PLATFORMS"), value: l("Navigateur, ordinateur et mobile", "Browser, desktop and mobile") },
    { label: l("LANGUES", "LANGUAGES"), value: l("Français, anglais", "French, English") },
  ],
  pitchSection: {
    title: l("Un objet culte, 3 essais, une collection.", "One cult object, 3 tries, one collection."),
    paragraphs: l(
      [
        "Iconic affiche une carte illustrée : un objet ou un symbole lié à un personnage. Reste à taper son nom. 3 essais par icône, des indices à débloquer, et une série de bonnes réponses qui multiplie les ICoins.",
        "Chaque icône trouvée rejoint la collection, et chaque set a ses propres succès à décrocher.",
      ],
      [
        "Iconic shows an illustrated card: an object or a symbol tied to a character. All that is left is to type their name. 3 tries per icon, hints to unlock, and a streak of right answers that multiplies ICoins.",
        "Every icon found joins the collection, and every set has its own achievements to earn.",
      ],
    ),
  },
  challenge: {
    title: l("Un jeu tout doux, trois sujets sérieux.", "A gentle game, three serious topics."),
    lede: l(
      "Ne jamais perdre une bonne réponse, ne jamais laisser fuiter la solution, et faire tourner une vraie économie de jeu. Le tout sans que ça se voie.",
      "Never lose a right answer, never leak the solution, and run a real game economy. All without it showing.",
    ),
    items: [
      {
        title: l("Une partie pilotée par une machine à états", "A game driven by a state machine"),
        body: l(
          "Chargement des cartes, filtrage de celles déjà trouvées, tirage, validation, sauvegarde des succès : tout passe par XState. Chaque sauvegarde a son état (en attente, synchronisé, échoué), et les cartes sont rendues côté serveur pour démarrer sans temps de chargement.",
          "Loading cards, filtering the ones already found, drawing, validating, saving achievements: everything goes through XState. Every save has its state (pending, synced, failed), and cards are server-rendered to start with no loading time.",
        ),
        figures: [
          { value: "XState 5", label: l("une seule source de vérité", "a single source of truth") },
          { value: l("3 états", "3 states"), label: l("de synchro par succès", "of sync per achievement") },
        ],
      },
      {
        title: l("Des images servies sans dévoiler la réponse", "Images served without revealing the answer"),
        body: l(
          "Les illustrations vivent dans un bucket S3 privé. Le serveur ne délivre qu'une URL signée, valable quelques minutes : rien à deviner dans l'adresse de l'image, rien à garder en cache pour plus tard.",
          "Illustrations live in a private S3 bucket. The server only hands out a signed URL, valid for a few minutes: nothing to guess from the image address, nothing to keep in cache for later.",
        ),
        figures: [
          { value: "5 min", label: l("de validité par URL signée", "of validity per signed URL") },
          { value: "0", label: l("image en accès public", "publicly accessible images") },
        ],
      },
      {
        title: l("Progression, sets et économie de jeu", "Progression, sets and game economy"),
        body: l(
          "Chaque bonne réponse rapporte des ICoins, multipliés par la série en cours. Un indice coûte cher et casse la série : au joueur d'arbitrer. Pour les sets payants, Stripe et son webhook débloquent l'achat côté serveur.",
          "Every right answer earns ICoins, multiplied by the current streak. A hint is expensive and breaks the streak: the player decides. For paid sets, Stripe and its webhook unlock the purchase server side.",
        ),
        figures: [
          { value: "25", label: l("ICoins par bonne réponse", "ICoins per right answer") },
          { value: "100", label: l("ICoins l'indice", "ICoins per hint") },
        ],
      },
    ],
  },
  role: {
    title: l("Un seul auteur, de la carte au paiement.", "A single author, from card to payment."),
    body: l(
      "Dylan a créé Iconic seul : game design, design, développement. Le jeu, les comptes, la boutique et la chaîne d'import des cartes sont pensés pour qu'un set entier s'ajoute sans toucher au code de la partie.",
      "Dylan built Iconic alone: game design, design, development. The game, accounts, shop and card import pipeline are designed so a whole set can be added without touching the game code.",
    ),
    items: [
      { label: l("Game design", "Game design"), detail: l("séries, indices, collection, succès", "streaks, hints, collection, achievements") },
      { label: l("Le jeu", "The game"), detail: l("machine à états XState, rendu serveur", "XState state machine, server rendering") },
      { label: l("Design", "Design"), detail: l("interface claire, cartes, animations", "light interface, cards, animations") },
      { label: l("Comptes et boutique", "Accounts and shop"), detail: l("Auth.js, Stripe, webhooks", "Auth.js, Stripe, webhooks") },
      { label: l("Import des cartes", "Card import"), detail: l("scripts vers S3, un set à la fois", "scripts to S3, one set at a time") },
    ],
  },
  stack: [
    {
      group: l("FRONT", "FRONT"),
      items: [
        { name: "React", key: true },
        { name: "Next.js", key: true },
        { name: "TypeScript" },
        { name: "Tailwind CSS" },
        { name: "Framer Motion" },
      ],
    },
    {
      group: l("JEU", "GAME"),
      items: [{ name: "XState", key: true }, { name: "react-hook-form" }, { name: "zod" }, { name: "next-intl" }],
    },
    {
      group: l("DONNÉES", "DATA"),
      items: [
        { name: "MongoDB", key: true },
        { name: "Mongoose" },
        { name: "Auth.js" },
        { name: l("AWS S3, URL signées", "AWS S3, signed URLs") },
      ],
    },
    {
      group: l("PAIEMENT ET HÉBERGEMENT", "PAYMENT AND HOSTING"),
      items: [{ name: "Stripe" }, { name: "Webhooks" }, { name: "Vercel" }],
    },
  ],
  colors: {
    tag: "#2CA6A4",
    background: "#f5f5f5",
    text: "#1E1E1E",
    accent: "#1f7f7d",
    border: "#ffffff",
    secondary: "#F7C873",
  },
  media: {
    poster: img(
      "/images/games/iconic/poster.jpg", 1600, 900,
      l(
        "Annonce Iconic : disponible le 21 novembre, set Figures de l'histoire et Tableau de mission, entourée de quatre cartes illustrées",
        "Iconic announcement: available November 21, Historical Figures set and Mission Board, surrounded by four illustrated cards",
      ),
    ),
    card: [
      img("/images/games/iconic/iconic-pharaon.jpg", 255, 255, l("", "")),
      img("/images/games/iconic/iconic-livre.jpg", 250, 255, l("", "")),
      img(
        "/images/games/iconic/iconic-chapeau.jpg",
        255,
        255,
        l(
          "Carte Iconic : un bicorne à cocarde, reste à deviner à qui il appartient",
          "Iconic card: a bicorne hat with a cockade, guess who it belongs to",
        ),
      ),
    ],
    logo: { src: "/images/games/iconic/iconic-logo.svg", width: 172, height: 36 },
    gallery: [
      img(
        "/images/games/iconic/iconic-29.jpg", 1600, 900,
        l("Écran de jeu : une carte montrant une vis aérienne, le champ de réponse et le Tableau de mission", "Game screen: a card showing an aerial screw, the answer field and the Mission Board"),
      ),
      img(
        "/images/games/iconic/iconic-41.jpg", 1600, 900,
        l("Une carte montrant un éléphant de guerre, série de 3 en cours avec multiplicateur 1,2", "A card showing a war elephant, a streak of 3 in progress with a 1.2 multiplier"),
      ),
      img(
        "/images/games/iconic/iconic-17.jpg", 1600, 900,
        l("Mauvaise réponse : la carte se couvre de corail avec une croix", "Wrong answer: the card turns coral with a cross"),
      ),
      img(
        "/images/games/iconic/iconic-11.jpg", 1600, 900,
        l("La boutique : aperçu du set Figures de l'histoire avec ses cartes à découvrir", "The shop: preview of the Historical Figures set and its cards to discover"),
      ),
      img(
        "/images/games/iconic/iconic-4.jpg", 1600, 900,
        l("Présentation du set Figures de l'histoire : six cartes illustrées", "Presentation of the Historical Figures set: six illustrated cards"),
      ),
      img(
        "/images/games/iconic/iconic-47.jpg",
        1000,
        563,
        l("Annonce : disponible le 21 novembre", "Announcement: available November 21"),
      ),
    ],
    mini: "/images/games/iconic/mini.jpg",
  },
  galleryTitle: l("Des cartes qui donnent envie de les garder.", "Cards worth keeping."),
  callToAction: {
    title: l("Une icône à deviner ?", "An icon to guess?"),
    text: l(
      "Trois sets gratuits pour commencer : héros de jeux vidéo, sportifs de légende, stars de cinéma.",
      "Three free sets to start with: video game heroes, sports legends, movie stars.",
    ),
  },
  socials: ["youtube", "twitch", "x", "github"],
  teaser: l(
    "Un quiz de culture pop : un objet culte, trois essais pour retrouver le personnage.",
    "A pop culture quiz: one cult object, three tries to find the character.",
  ),
};

/** Showcase order: One Piexel first (full width), then Fastr and Iconic. */
export const games: readonly Game[] = [onePiexel, fastr, iconic];

export const gameSlugs: readonly GameSlug[] = games.map((g) => g.slug);

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

export function isGameSlug(slug: string): slug is GameSlug {
  return games.some((g) => g.slug === slug);
}
