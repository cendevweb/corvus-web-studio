import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { site } from "@content/site";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { DocumentState } from "@/components/layout/DocumentState";
import { SvgDefs } from "@/components/ui/Icon";
import { CHROME_NAMESPACES, clientMessages } from "@/i18n/client-messages";
import { baseFontVariables } from "@/lib/fonts";
import { localeStaticParams, resolveLocale, type LocaleParams } from "@/lib/page";
import { THEME_COLORS, themeInitScript } from "@/lib/theme-script";
import "../globals.css";

export const generateStaticParams = localeStaticParams;

export const viewport: Viewport = {
  themeColor: THEME_COLORS.dark,
  colorScheme: "dark light",
};

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("home.title"), template: t("titleTemplate") },
    description: t("home.description"),
    applicationName: site.name,
    authors: [{ name: site.author.name }],
    creator: site.author.name,
    openGraph: { siteName: site.name, images: [site.ogImage] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "header" });
  const messages = await clientMessages(locale, CHROME_NAMESPACES);

  return (
    <html lang={locale} className={baseFontVariables} suppressHydrationWarning>
      <head>
        {/* Runs before first paint: restores the saved theme, flags JS for scroll reveals. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <DocumentState />
        <NextIntlClientProvider messages={messages}>
          <a className="skip" href="#contenu">
            {t("skip")}
          </a>
          <SvgDefs />
          <Header />
          <main id="contenu">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
