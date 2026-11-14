import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Each page owns its own namespace file in messages/<locale>/<namespace>.json
// so pages can be built in parallel without touching the shared file.
const PAGE_NAMESPACES = [
  "games",
  "career",
  "news",
  "nest",
  "services",
  "about",
  "contact",
  "legal",
] as const;

async function loadMessages(locale: string) {
  const base = (await import(`../../messages/${locale}.json`)).default;
  const pages = await Promise.all(
    PAGE_NAMESPACES.map(
      async (ns) => (await import(`../../messages/${locale}/${ns}.json`)).default,
    ),
  );
  return Object.assign({}, base, ...pages);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Europe/Paris",
  };
});
