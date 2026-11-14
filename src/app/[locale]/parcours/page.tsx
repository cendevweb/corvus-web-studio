import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { education, skills } from "@content/career";
import { site } from "@content/site";
import {
  CareerContact,
  CareerEducation,
  CareerIntro,
  CareerProductAi,
  CareerSkills,
  CareerTimeline,
  CareerWorks,
} from "@/components/career/CareerSections";
import { JsonLd } from "@/components/ui/JsonLd";
import type { Locale } from "@/i18n/routing";
import { personJsonLd } from "@/lib/jsonld";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import "@/styles/pages/career.css";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.career" });
  return buildMetadata({ locale, href: "/parcours", title: t("title"), description: t("description") });
}

/** schema.org Person, extended with what this page states: skills, certification, schools, CV. */
function careerPersonJsonLd(locale: Locale, description: string) {
  const certification = education.find((item) => item.certification);
  return {
    ...personJsonLd(locale),
    description,
    mainEntityOfPage: absoluteUrl("/parcours", locale),
    knowsAbout: skills.flatMap((group) => group.items),
    alumniOf: education
      .filter((item) => !item.certification)
      .map((item) => ({ "@type": "EducationalOrganization", name: item.title[locale] })),
    ...(certification
      ? {
          hasCredential: {
            "@type": "EducationalOccupationalCredential",
            name: certification.title[locale],
            credentialCategory: "certification",
          },
        }
      : {}),
    subjectOf: { "@type": "DigitalDocument", name: "CV", encodingFormat: "application/pdf", url: `${site.url}${site.cv}` },
  };
}

/** Career page ("/parcours"), integrated from the validated mockup (pages-a/parcours). */
export default async function CareerPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const meta = await getTranslations({ locale, namespace: "meta.career" });

  return (
    <div className="career">
      <JsonLd data={careerPersonJsonLd(locale, meta("description"))} />
      <CareerIntro />
      <CareerWorks />
      <CareerProductAi />
      <CareerTimeline />
      <CareerSkills />
      <CareerEducation />
      <CareerContact />
    </div>
  );
}
