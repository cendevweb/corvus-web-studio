import { getMessages } from "next-intl/server";
import type { Locale } from "./routing";

type MessageTree = { [key: string]: MessageTree | string };

/**
 * Subset of the messages to hand to `NextIntlClientProvider`.
 * Whatever the provider receives is serialized into the HTML of every page it wraps, so client
 * components only get the namespaces they read (`"header"`, or a nested one: `"contactPage.form"`).
 */
export async function clientMessages(locale: Locale, namespaces: readonly string[]): Promise<MessageTree> {
  const all = (await getMessages({ locale })) as MessageTree;
  const picked: MessageTree = {};
  for (const namespace of namespaces) {
    const keys = namespace.split(".");
    let source: MessageTree | string | undefined = all;
    for (const key of keys) source = typeof source === "object" ? source[key] : undefined;
    if (source === undefined) throw new Error(`Unknown message namespace "${namespace}" (${locale})`);
    let target = picked;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) target[key] = source as MessageTree | string;
      else target = (target[key] ??= {}) as MessageTree;
    });
  }
  return picked;
}

/** Namespaces read by the client components of the site chrome and of the shared demos. */
export const CHROME_NAMESPACES = ["nav", "header", "palette", "common", "demos"] as const;
