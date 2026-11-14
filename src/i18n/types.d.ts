import type base from "../../messages/fr.json";
import type about from "../../messages/fr/about.json";
import type career from "../../messages/fr/career.json";
import type contact from "../../messages/fr/contact.json";
import type games from "../../messages/fr/games.json";
import type legal from "../../messages/fr/legal.json";
import type nest from "../../messages/fr/nest.json";
import type news from "../../messages/fr/news.json";
import type services from "../../messages/fr/services.json";
import type { routing } from "./routing";

// Shared strings + one file per page namespace (see PAGE_NAMESPACES in ./request.ts).
type Messages = typeof base &
  typeof about &
  typeof career &
  typeof contact &
  typeof games &
  typeof legal &
  typeof nest &
  typeof news &
  typeof services;

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: Messages;
  }
}
