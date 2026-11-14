import { l, type Localized } from "./types";

/**
 * Career content ("Parcours"): six in-company achievements shown as feature cards,
 * then the timeline, skills and education. Texts come from the validated mockups.
 * `result` and timeline `body` accept light markup (see src/components/career/RichText.tsx):
 * `**bold**`, `[label](#anchor)` / `[label](/route)` links, and `[… à confirmer]` markers.
 * Visuals are neutral reproductions (no company logo or screenshot): see `visual`.
 */

export type WorkId =
  | "screenshot-bot"
  | "entity-builder"
  | "monorepo"
  | "adtech-forms"
  | "db-redesign"
  | "serverless";

export interface Work {
  id: WorkId;
  /** Anchor on the career page (#cas-1 …). */
  anchor: string;
  title: Localized;
  /** Compact card (home page). */
  card: { company: string; tag: Localized; summary: Localized };
  /** Entry of the page index: short title and company. */
  short: { title: Localized; company: string };
  /** Longer heading of the case study when it differs from `title`. */
  fullTitle?: Localized;
  /** Full case study (career page). */
  company: Localized;
  period: Localized;
  pitch: Localized;
  problem: Localized;
  contribution: Localized;
  keyChoice: Localized;
  /** `[chiffre à confirmer]` markers are kept on purpose until Dylan confirms the numbers. */
  result: Localized;
  stack: string[];
  /** What is still to be confirmed in the stack list. */
  stackNote?: Localized;
  visual: WorkVisualSlot;
}

/**
 * Visual slot of a case study. While `media` is absent the career page shows the replayable
 * demo registered for the work (src/components/career/demos) with a "visual to come" label.
 * To publish the real visual, drop the file in `public/images/career/` and fill `media`:
 * the demo and the placeholder caption are replaced, nothing else changes.
 * To swap in a custom component instead, replace the work's entry in the demo registry.
 */
export interface WorkVisualSlot {
  kind: Localized;
  /** Expected ratio, "16:9" style. */
  ratio: string;
  /** Brief of the visual to produce (shown under the slot until `media` is set). */
  brief: Localized;
  media?: WorkMedia;
}

export interface WorkMedia {
  type: "image" | "video";
  src: string;
  width: number;
  height: number;
  alt: Localized;
  /** Poster image of a video. */
  poster?: string;
}

export const works: readonly Work[] = [
  {
    id: "screenshot-bot",
    anchor: "cas-1",
    title: l("Bot de screenshots Twitter/X", "Twitter/X screenshot bot"),
    card: {
      company: "TweetHunter",
      tag: l("2023-24", "2023-24"),
      summary: l(
        "Un tweet entre, une capture propre sort : pipeline image et vidéo.",
        "A tweet goes in, a clean capture comes out: image and video pipeline.",
      ),
    },
    short: { title: l("Bot de screenshots Twitter/X", "Twitter/X screenshot bot"), company: "TweetHunter" },
    company: l("Lempire · TweetHunter", "Lempire · TweetHunter"),
    period: l("avr. 2023 – août 2024", "Apr 2023 – Aug 2024"),
    pitch: l(
      "Un tweet en entrée, une image ou une vidéo prête à publier en sortie.",
      "A tweet as input, a ready-to-publish image or video as output.",
    ),
    problem: l(
      "Les créateurs recyclent leurs meilleurs tweets sur d'autres réseaux. À la main : une capture d'écran recadrée à chaque fois, et jamais deux fois au même format.",
      "Creators recycle their best tweets on other networks. By hand: a cropped screenshot every time, and never twice in the same format.",
    ),
    contribution: l(
      "Construction du pipeline de bout en bout : récupération du tweet, rendu dans un gabarit propre, export en image et en vidéo, puis mise à disposition automatique.",
      "Built the pipeline end to end: fetching the tweet, rendering it in a clean template, exporting as image and video, then automatic delivery.",
    ),
    keyChoice: l(
      "Reconstruire le tweet à partir de ses données dans un gabarit maîtrisé, plutôt que photographier la page de X : le rendu ne dépend plus d'une interface tierce.",
      "Rebuild the tweet from its data in a controlled template rather than photographing the X page: rendering no longer depends on a third-party interface.",
    ),
    result: l(
      "[chiffre à confirmer] captures et vidéos générées chaque mois, sans intervention manuelle.",
      "[figure to be confirmed] captures and videos generated every month, with no manual intervention.",
    ),
    stack: ["TypeScript", "Node.js", "React", "AWS S3", "CI/CD"],
    stackNote: l("stack à confirmer", "stack to be confirmed"),
    visual: {
      kind: l("Démo illustrative", "Illustrative demo"),
      ratio: "16:9",
      brief: l(
        "Reproduction neutre du bot : tweet d'origine et capture générée côte à côte, ou courte vidéo du rendu. Sans logo ni capture d'entreprise. 16:9, 1920 × 1080.",
        "Neutral reproduction of the bot: original tweet and generated capture side by side, or a short video of the render. No company logo or screenshot. 16:9, 1920 × 1080.",
      ),
    },
  },
  {
    id: "entity-builder",
    anchor: "cas-2",
    title: l("Builder d'entités conditionnel", "Conditional entity builder"),
    card: {
      company: "SportsDynamics",
      tag: l("2025-26", "2025-26"),
      summary: l(
        "Des règles si/alors qui modifient un aperçu en direct.",
        "If/then rules that update a live preview.",
      ),
    },
    short: { title: l("Builder d'entités conditionnel", "Conditional entity builder"), company: "SportsDynamics" },
    company: l("SportsDynamics", "SportsDynamics"),
    period: l("juil. 2025 – juil. 2026", "Jul 2025 – Jul 2026"),
    pitch: l(
      "Des règles si/alors posées sans développeur, et un aperçu qui réagit en direct.",
      "If/then rules set up without a developer, and a preview that reacts live.",
    ),
    problem: l(
      "Chaque club et chaque compétition demandait ses propres fiches : un joueur blessé ne s'affiche pas comme un titulaire. Chaque variante passait par un développeur.",
      "Every club and every competition wanted its own cards: an injured player is not displayed like a starter. Every variant went through a developer.",
    ),
    contribution: l(
      "Conception du « conditional entity studio » : un éditeur de règles branché sur les données des APIs sport, et un aperçu recalculé à chaque modification.",
      "Designed the \"conditional entity studio\": a rule editor plugged into sports API data, and a preview recomputed on every change.",
    ),
    keyChoice: l(
      "Des règles stockées comme des données et évaluées par un seul moteur, dans l'aperçu comme en production : l'aperçu du studio correspond exactement à ce qui sera publié.",
      "Rules stored as data and evaluated by a single engine, in the preview and in production alike: the studio preview matches exactly what gets published.",
    ),
    result: l(
      "[chiffre à confirmer] types d'entités configurés par les équipes métier, sans ticket de développement.",
      "[figure to be confirmed] entity types configured by business teams, with no development ticket.",
    ),
    stack: ["TypeScript", "React", "Next.js", "Tailwind", "Web Workers"],
    stackNote: l("stack à confirmer", "stack to be confirmed"),
    visual: {
      kind: l("Démo interactive", "Interactive demo"),
      ratio: "16:10",
      brief: l(
        "Reproduction neutre du studio : éditeur de règles à gauche, aperçu à droite, données fictives. Sans logo ni capture d'entreprise. 16:10, 1600 × 1000.",
        "Neutral reproduction of the studio: rule editor on the left, preview on the right, fictional data. No company logo or screenshot. 16:10, 1600 × 1000.",
      ),
    },
  },
  {
    id: "monorepo",
    anchor: "cas-3",
    title: l("Migration multi-repo → monorepo", "Multi-repo → monorepo migration"),
    card: {
      company: "Weblib",
      tag: l("2021-23", "2021-23"),
      summary: l(
        "N dépôts qui convergent, une CI, un seul temps de build.",
        "N repositories converging, one CI, a single build time.",
      ),
    },
    short: { title: l("Migration multi-repo → monorepo", "Multi-repo → monorepo migration"), company: "Weblib" },
    company: l("Weblib", "Weblib"),
    period: l("déc. 2021 – avr. 2023", "Dec 2021 – Apr 2023"),
    pitch: l(
      "N dépôts qui dérivaient chacun de leur côté, réunis en un seul, sans arrêter de livrer.",
      "N repositories each drifting their own way, merged into one, without ever stopping shipping.",
    ),
    problem: l(
      "Le produit vivait dans plusieurs dépôts : dépendances désynchronisées, code partagé recopié, et une PR par dépôt pour la moindre évolution transverse.",
      "The product lived in several repositories: out-of-sync dependencies, copy-pasted shared code, and one PR per repository for any cross-cutting change.",
    ),
    contribution: l(
      "Migration menée de bout en bout : inventaire, plan par étapes, regroupement des dépôts, CI unifiée, modernisation du code legacy au passage.",
      "Led the migration end to end: inventory, step-by-step plan, merging the repositories, unified CI, modernising legacy code along the way.",
    ),
    keyChoice: l(
      "Migrer dépôt par dépôt plutôt que tout basculer d'un coup : à chaque étape, l'équipe continuait à livrer.",
      "Migrate repository by repository rather than switching everything at once: at every step, the team kept shipping.",
    ),
    result: l(
      "Un seul dépôt, une seule CI. Dépôts réunis : [chiffre à confirmer]. Durée de build : [chiffre à confirmer].",
      "One repository, one CI. Repositories merged: [figure to be confirmed]. Build time: [figure to be confirmed].",
    ),
    stack: ["TypeScript", "Node.js", "React", "CI/CD"],
    stackNote: l("outil monorepo à confirmer", "monorepo tool to be confirmed"),
    visual: {
      kind: l("Schéma animé", "Animated diagram"),
      ratio: "16:9",
      brief: l(
        "Schéma générique de l'arborescence avant/après (noms neutres), avec les chiffres confirmés : nombre de dépôts, durée de build. 16:9, 1920 × 1080.",
        "Generic before/after tree diagram (neutral names), with the confirmed figures: number of repositories, build time. 16:9, 1920 × 1080.",
      ),
    },
  },
  {
    id: "adtech-forms",
    anchor: "cas-4",
    title: l("Formulaires avancés adTech", "Advanced adTech forms"),
    card: {
      company: "Paragone / MakeMeReach",
      tag: l("2019-21", "2019-21"),
      summary: l(
        "Ciblage d'audience, studio de créas, réglages de campagnes.",
        "Audience targeting, creative studio, campaign settings.",
      ),
    },
    short: { title: l("Formulaires avancés adTech", "Advanced adTech forms"), company: "Paragone, ex-MakeMeReach" },
    company: l("Paragone, ex-MakeMeReach", "Paragone, formerly MakeMeReach"),
    period: l("avr. 2019 – mai 2021", "Apr 2019 – May 2021"),
    pitch: l(
      "Ciblage, création des créas, réglages avancés : trois étapes, et un aperçu d'annonce qui suit chaque choix.",
      "Targeting, creative building, advanced settings: three steps, and an ad preview that follows every choice.",
    ),
    problem: l(
      "Créer une campagne social ads, ce sont des dizaines de champs interdépendants : un choix de ciblage change les formats possibles, qui changent les réglages. Et les APIs des réseaux refusent la moindre incohérence.",
      "Creating a social ads campaign means dozens of interdependent fields: a targeting choice changes the available formats, which change the settings. And the networks' APIs reject the slightest inconsistency.",
    ),
    contribution: l(
      "Développement des parcours de ciblage d'audience, du studio de créas et des réglages avancés de campagne, branchés sur les APIs des réseaux sociaux.",
      "Built the audience targeting flows, the creative studio and the advanced campaign settings, plugged into the social networks' APIs.",
    ),
    keyChoice: l(
      "Valider à chaque étape avec les mêmes règles que l'API en bout de chaîne : l'erreur apparaît au bon champ, dans le formulaire, pas au moment de publier.",
      "Validate at every step with the same rules as the API at the end of the chain: the error shows up on the right field, in the form, not at publish time.",
    ),
    result: l(
      "[chiffre à confirmer] campagnes créées via ces parcours, par des équipes qui gèrent des budgets publicitaires au quotidien.",
      "[figure to be confirmed] campaigns created through these flows, by teams managing advertising budgets every day.",
    ),
    stack: ["JavaScript / TypeScript", "React", "Node.js", "APIs social ads"],
    stackNote: l("stack à confirmer", "stack to be confirmed"),
    visual: {
      kind: l("Démo interactive", "Interactive demo"),
      ratio: "4:3",
      brief: l(
        "Reproduction neutre du formulaire en trois étapes (ciblage, créas, réglages) avec marque fictive. Sans logo ni capture d'entreprise. 4:3, 1600 × 1200.",
        "Neutral reproduction of the three-step form (targeting, creatives, settings) with a fictional brand. No company logo or screenshot. 4:3, 1600 × 1200.",
      ),
    },
  },
  {
    id: "db-redesign",
    anchor: "cas-5",
    title: l("Refonte de structure de BDD", "Database structure redesign"),
    card: {
      company: "Paragone · Pernod Ricard",
      tag: l("ETL + reporting", "ETL + reporting"),
      summary: l(
        "Un nouveau schéma sous un module à plus d'un million d'euros de campagnes.",
        "A new schema under a module tracking over a million euros of campaigns.",
      ),
    },
    short: { title: l("Refonte de structure de BDD", "Database structure redesign"), company: "Paragone · Pernod Ricard" },
    company: l("Paragone · Pernod Ricard", "Paragone · Pernod Ricard"),
    period: l("2018 – 2021", "2018 – 2021"),
    pitch: l(
      "Deux bases qui avaient grandi par couches, remises à plat sans couper le service.",
      "Two databases that had grown in layers, flattened out without interrupting service.",
    ),
    problem: l(
      "Deux contextes, le même symptôme : un schéma construit par ajouts successifs. Colonnes en double, table fourre-tout, reporting long à produire.",
      "Two contexts, the same symptom: a schema built by successive additions. Duplicate columns, a catch-all table, reporting that was slow to produce.",
    ),
    contribution: l(
      "Chez Pernod Ricard : refonte de la base utilisateurs d'une plateforme data connectée à un data lake. Chez Paragone : reprise des schémas et des traitements ETL qui alimentent le reporting.",
      "At Pernod Ricard: redesign of the user database of a data platform connected to a data lake. At Paragone: rework of the schemas and ETL jobs feeding the reporting.",
    ),
    keyChoice: l(
      "Normaliser le modèle d'abord, puis migrer les données par lots vérifiés, plutôt qu'une bascule en une nuit.",
      "Normalise the model first, then migrate the data in verified batches, rather than an overnight switch.",
    ),
    result: l(
      "Un module de reporting qui suit plus de **1 M€** de campagnes. Gain sur les temps de requête : [chiffre à confirmer].",
      "A reporting module tracking over **€1M** of campaigns. Query time improvement: [figure to be confirmed].",
    ),
    stack: ["PostgreSQL", "MongoDB", "Node.js", "ETL", "Data lake"],
    stackNote: l("stack à confirmer", "stack to be confirmed"),
    visual: {
      kind: l("Schéma illustratif", "Illustrative diagram"),
      ratio: "16:9",
      brief: l(
        "ERD générique avant et après, tables et colonnes renommées. Aucune donnée ni nom d'entreprise. 16:9, 1920 × 1080, un visuel par état.",
        "Generic before and after ERD, tables and columns renamed. No company data or name. 16:9, 1920 × 1080, one visual per state.",
      ),
    },
  },
  {
    id: "serverless",
    anchor: "cas-6",
    title: l("Serverless : Lambdas, queues, hooks", "Serverless: Lambdas, queues, hooks"),
    card: {
      company: "SportsDynamics",
      tag: l("AWS", "AWS"),
      summary: l(
        "Événement, file, lambda, hook : un flux qui encaisse les pics.",
        "Event, queue, lambda, hook: a flow that absorbs traffic spikes.",
      ),
    },
    short: { title: l("Système serverless", "Serverless system"), company: "SportsDynamics" },
    fullTitle: l("Système serverless : Lambdas, queues, hooks", "Serverless system: Lambdas, queues, hooks"),
    company: l("SportsDynamics", "SportsDynamics"),
    period: l("juil. 2025 – juil. 2026", "Jul 2025 – Jul 2026"),
    pitch: l(
      "Un événement arrive, il est mis en file, traité, puis notifié. En cas d'échec, il repasse.",
      "An event comes in, it is queued, processed, then notified. If it fails, it runs again.",
    ),
    problem: l(
      "Les données sport arrivent par rafales depuis des APIs tierces : presque rien en semaine, tout en même temps les soirs de match. Les traitements devaient suivre sans intervention.",
      "Sports data arrives in bursts from third-party APIs: almost nothing during the week, everything at once on match nights. Processing had to keep up with no intervention.",
    ),
    contribution: l(
      "Mise en place de la chaîne d'automatisation : événements mis en file, traités par des Lambdas, puis notifiés aux autres services par des hooks. Côté navigateur, les calculs lourds partent dans des Web Workers.",
      "Set up the automation chain: events queued, processed by Lambdas, then notified to other services through hooks. In the browser, heavy computations go to Web Workers.",
    ),
    keyChoice: l(
      "Une queue entre chaque étape : si un traitement échoue, le message est rejoué au lieu d'être perdu, et un pic de trafic s'absorbe sans rien casser.",
      "A queue between every step: if a job fails, the message is replayed instead of lost, and a traffic spike is absorbed without breaking anything.",
    ),
    result: l(
      "[chiffre à confirmer] événements traités par jour, sans serveur à surveiller.",
      "[figure to be confirmed] events processed per day, with no server to watch.",
    ),
    stack: ["AWS Lambda", "Queues", "AWS S3", "Node.js", "TypeScript", "Web Workers"],
    stackNote: l("services à confirmer", "services to be confirmed"),
    visual: {
      kind: l("Flux animé", "Animated flow"),
      ratio: "21:9",
      brief: l(
        "Diagramme d'architecture générique (événements, queues, Lambdas, hooks), sans nom de service interne. Bandeau 21:9, 2520 × 1080.",
        "Generic architecture diagram (events, queues, Lambdas, hooks), with no internal service name. 21:9 banner, 2520 × 1080.",
      ),
    },
  },
];

export const getWork = (id: WorkId): Work => works.find((w) => w.id === id)!;

/** "Product AI" block of the career page. */
export const productAi = {
  title: l("L'IA dans le produit, et dans la façon de livrer.", "AI in the product, and in the way of shipping."),
  cards: [
    {
      kicker: l("Dans le produit · TweetHunter, 2023-24", "In the product · TweetHunter, 2023-24"),
      title: l("GPT-4 au service de l'écriture, pas à sa place.", "GPT-4 serving the writing, not replacing it."),
      body: l(
        "Intégration de GPT-4 dans l'éditeur de TweetHunter. Trois gestes, chacun avec ses prompts système, pensés pour que l'auteur garde la main.",
        "Integration of GPT-4 in the TweetHunter editor. Three actions, each with its system prompts, designed so the author stays in control.",
      ),
      points: [
        { label: l("Compléter", "Complete"), detail: l("terminer un tweet commencé, dans le ton de l'auteur.", "finish a tweet in progress, in the author's tone.") },
        { label: l("Corriger", "Fix"), detail: l("fautes et tournures, sans réécrire l'idée.", "typos and phrasing, without rewriting the idea.") },
        { label: l("Optimiser", "Optimise"), detail: l("resserrer, accrocher, proposer des variantes.", "tighten, hook, suggest variants.") },
      ],
    },
    {
      kicker: l("Dans la méthode · au quotidien", "In the method · every day"),
      title: l("Un workflow agentique, cadré comme une équipe.", "An agentic workflow, framed like a team."),
      body: l(
        "Claude Code et Codex, pilotés comme des coéquipiers : un brief clair, des skills réutilisables, des hooks qui vérifient, et une relecture humaine avant chaque merge.",
        "Claude Code and Codex, steered like teammates: a clear brief, reusable skills, hooks that verify, and a human review before every merge.",
      ),
      points: [
        { label: l("Skills", "Skills"), detail: l("le savoir-faire du projet, écrit une fois, rejoué partout.", "the project's know-how, written once, replayed everywhere.") },
        { label: l("Hooks", "Hooks"), detail: l("lint, tests et captures lancés automatiquement.", "lint, tests and screenshots run automatically.") },
        { label: l("Relecture", "Review"), detail: l("rien ne part en production sans relecture humaine.", "nothing ships to production without a human review.") },
      ],
    },
  ],
  studio: {
    title: l("Côté studio : implémentation et services IA", "Studio side: AI implementation and services"),
    body: l(
      "Le même savoir-faire, proposé en mission : brancher un modèle sur un produit existant, outiller une équipe, industrialiser la génération.",
      "The same know-how, offered as a service: plugging a model into an existing product, equipping a team, industrialising generation.",
    ),
    services: l(
      ["Serveurs MCP", "Skills sur mesure", "Génération IA", "Intégration LLM"],
      ["MCP servers", "Custom Skills", "AI generation", "LLM integration"],
    ),
  },
} as const;

export interface TimelineEntry {
  period: Localized;
  title: Localized;
  body: Localized;
  current?: boolean;
  /** Related case studies. */
  works?: WorkId[];
}

export const timeline: readonly TimelineEntry[] = [
  {
    period: l("En continu", "Ongoing"),
    title: l("Corvus Web Studio", "Corvus Web Studio"),
    body: l(
      "Le studio indé de Dylan Tuna : trois jeux web sortis, [One Piexel, Fastr et Iconic](/jeux).",
      "Dylan Tuna's indie studio: three web games released, [One Piexel, Fastr and Iconic](/jeux).",
    ),
    current: true,
  },
  {
    period: l("juil. 2025 – juil. 2026", "Jul 2025 – Jul 2026"),
    title: l("SportsDynamics · Senior Fullstack", "SportsDynamics · Senior Fullstack"),
    body: l(
      "SaaS sport : interfaces riches en données, APIs sport tierces, [conditional entity studio](#cas-2), [automatisation AWS Lambda et Web Workers](#cas-6).",
      "Sports SaaS: data-rich interfaces, third-party sports APIs, [conditional entity studio](#cas-2), [AWS Lambda and Web Workers automation](#cas-6).",
    ),
    works: ["entity-builder", "serverless"],
  },
  {
    period: l("avr. 2023 – août 2024", "Apr 2023 – Aug 2024"),
    title: l("Lempire, TweetHunter · Senior Fullstack", "Lempire, TweetHunter · Senior Fullstack"),
    body: l(
      "GPT-4 dans le produit, automatisation de contenu, [pipelines de screenshots et de vidéos Twitter/X](#cas-1), CI/CD et observabilité.",
      "GPT-4 in the product, content automation, [Twitter/X screenshot and video pipelines](#cas-1), CI/CD and observability.",
    ),
    works: ["screenshot-bot"],
  },
  {
    period: l("déc. 2021 – avr. 2023", "Dec 2021 – Apr 2023"),
    title: l("Weblib · Fullstack", "Weblib · Fullstack"),
    body: l(
      "[Migration multi-repo vers monorepo](#cas-3) de bout en bout, modernisation du legacy.",
      "End-to-end [multi-repo to monorepo migration](#cas-3), legacy modernisation.",
    ),
    works: ["monorepo"],
  },
  {
    period: l("avr. 2019 – mai 2021", "Apr 2019 – May 2021"),
    title: l("Paragone, ex-MakeMeReach · Fullstack", "Paragone, formerly MakeMeReach · Fullstack"),
    body: l(
      "Plateforme ad-tech : [ciblage d'audience, studio de créas](#cas-4), analytics, [refonte de schémas BDD](#cas-5), ETL et reporting.",
      "Ad-tech platform: [audience targeting, creative studio](#cas-4), analytics, [database schema redesign](#cas-5), ETL and reporting.",
    ),
    works: ["adtech-forms", "db-redesign"],
  },
  {
    period: l("mars 2018 – mars 2019", "Mar 2018 – Mar 2019"),
    title: l("Pernod Ricard · Consultant", "Pernod Ricard · Consultant"),
    body: l(
      "Plateforme data connectée à un data lake, [refonte de la BDD utilisateurs](#cas-5).",
      "Data platform connected to a data lake, [user database redesign](#cas-5).",
    ),
    works: ["db-redesign"],
  },
  {
    period: l("déc. 2016 – déc. 2017", "Dec 2016 – Dec 2017"),
    title: l("Formiris", "Formiris"),
    body: l("CMS et site public responsive.", "CMS and responsive public website."),
  },
  {
    period: l("2015", "2015"),
    title: l("Vivaneo · Stage", "Vivaneo · Internship"),
    body: l("Première expérience en entreprise.", "First professional experience."),
  },
];

export const skills: ReadonlyArray<{ group: Localized; items: string[] }> = [
  { group: l("Front", "Front"), items: ["TypeScript", "React", "Next.js", "Tailwind"] },
  { group: l("Back", "Back"), items: ["Node.js", "NestJS", "GraphQL", "Auth.js", "Socket.IO", "Stripe"] },
  { group: l("Données", "Data"), items: ["PostgreSQL", "MongoDB", "Prisma"] },
  { group: l("Cloud", "Cloud"), items: ["AWS Lambda", "AWS S3", "Vercel"] },
  { group: l("Agentic", "Agentic"), items: ["Claude Code", "Codex", "Skills", "Hooks"] },
];

export const education: ReadonlyArray<{
  period: Localized;
  title: Localized;
  body: Localized;
  certification?: boolean;
}> = [
  {
    period: l("2019 – 2022 · Certification", "2019 – 2022 · Certification"),
    title: l("AWS Certified Developer, Associate", "AWS Certified Developer, Associate"),
    body: l(
      "Lambda, S3, files d'attente, déploiement : le socle du travail serverless.",
      "Lambda, S3, queues, deployment: the foundation of serverless work.",
    ),
    certification: true,
  },
  {
    period: l("2017 · Diplôme", "2017 · Degree"),
    title: l("L'École Multimédia", "L'École Multimédia"),
    body: l("Master en développement mobile.", "Master's degree in mobile development."),
  },
  {
    period: l("2015 · Diplôme", "2015 · Degree"),
    title: l("INFA", "INFA"),
    body: l("Intitulé du diplôme : [à confirmer]", "Degree title: [to be confirmed]"),
  },
];
