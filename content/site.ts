import { l, type Localized } from "./types";

/** Site-wide facts: identity, URLs, navigation, studio networks. */

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export const site = {
  name: "Corvus Web Studio",
  /** Canonical origin, without trailing slash. Set NEXT_PUBLIC_SITE_URL once the domain is known. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl ?? "http://localhost:3000").replace(/\/$/, ""),
  author: {
    name: "Dylan Tuna",
    jobTitle: l("Senior Fullstack Engineer", "Senior Fullstack Engineer"),
    city: "Nancy",
    country: "FR",
  },
  year: 2026,
  cv: "/cv/CV_Dylan_Tuna.pdf",
  ogImage: { url: "/og/default.png", width: 1200, height: 630 },
} as const;

export type NavKey = "games" | "services" | "news" | "career" | "nest" | "about" | "contact";

/** Main navigation, in display order. `href` is an internal (French) pathname, see src/i18n/routing.ts. */
export const mainNav = [
  { key: "games", href: "/jeux" },
  { key: "services", href: "/services" },
  { key: "news", href: "/news" },
  { key: "career", href: "/parcours" },
  { key: "nest", href: "/nid" },
  { key: "about", href: "/a-propos" },
  { key: "contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ key: NavKey; href: string }>;

export type SocialId = "github" | "youtube" | "linkedin" | "x" | "twitch" | "tiktok" | "instagram";

export interface Social {
  id: SocialId;
  label: string;
  /** `null` while the account is not public yet. */
  url: string | null;
  handle?: string;
  /** Short description shown next to highlighted networks. */
  note?: Localized;
  /** GitHub and YouTube are the studio's highlighted networks (header, big tiles). */
  featured?: boolean;
}

export const socials: readonly Social[] = [
  {
    id: "github",
    label: "GitHub",
    url: "https://github.com/cendevweb",
    handle: "@cendevweb",
    note: l("code source et composants", "source code and components"),
    featured: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    url: "https://www.youtube.com/@CorvusWebStudio",
    handle: "@CorvusWebStudio",
    note: l("trailers et devlogs vidéo", "trailers and video devlogs"),
    featured: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/dylan-tuna-635405a8/",
    handle: "Dylan Tuna",
  },
  { id: "x", label: "X", url: "https://x.com/DylanTuna", handle: "@DylanTuna" },
  { id: "twitch", label: "Twitch", url: "https://www.twitch.tv/Jiblou_", handle: "Jiblou_" },
  { id: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@one_piexel", handle: "@one_piexel" },
  { id: "instagram", label: "Instagram", url: null, note: l("à venir", "coming soon") },
];

export const featuredSocials = socials.filter((s) => s.featured);
export const getSocial = (id: SocialId): Social => socials.find((s) => s.id === id)!;
