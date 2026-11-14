import { l, type Localized } from "./types";

/**
 * The four services of the studio. Texts live in messages/<locale>/services.json
 * (`servicesPage.items.<id>`); only the facts that are not UI copy are here.
 */
export type ServiceId = "web" | "games" | "ai" | "components";

export interface Service {
  id: ServiceId;
  /** In-page anchor, shared by both languages (linked from the About page). */
  anchor: string;
  tags: ReadonlyArray<string | Localized>;
  /** Internal (French) pathname of the "see more" link. */
  href: "/parcours" | "/jeux" | "/contact" | "/nid";
}

export const services: readonly Service[] = [
  {
    id: "web",
    anchor: "web",
    tags: ["Next.js", "React", "TypeScript", "Node", "PostgreSQL", "MongoDB", "Stripe", "AWS"],
    href: "/parcours",
  },
  {
    id: "games",
    anchor: "jeux",
    tags: ["Canvas", "Socket.IO", "PeerJS", "XState", "Next.js", "MongoDB"],
    href: "/jeux",
  },
  {
    id: "ai",
    anchor: "ia",
    tags: ["MCP", "Skills", "Agents", l("API LLM", "LLM APIs"), l("Génération IA", "AI generation"), "Claude Code", "Codex"],
    href: "/contact",
  },
  {
    id: "components",
    anchor: "composants",
    tags: ["React", "Tailwind", "Tokens", "Motion", "WCAG AA"],
    href: "/nid",
  },
];
