import { useLocale, useTranslations } from "next-intl";
import { playableExperiments } from "@content/nest";
import { experimentDemos } from "@/components/nest/demos";
import { Tags } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";

/** Home section 04: three playable experiments from the Nid, with copyable MIT code. */
export function NestSection() {
  const t = useTranslations("home.nest");
  const common = useTranslations("common");
  const locale = useLocale();
  const copyLabels = { idle: common("copyCode"), copied: common("copied"), failed: common("copyFailed") };

  return (
    <section className="sec" id="nid">
      <div className="wrap">
        <SectionHeading
          kicker={t("kicker")}
          title={t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
          aside={
            <Reveal>
              <Link className="link" href="/nid">
                {t("link")}
                <Icon name="arrow" />
              </Link>
            </Reveal>
          }
        />
        <div className="lab">
          {playableExperiments.map((experiment, index) => {
            const Demo = experiment.demo ? experimentDemos[experiment.demo] : null;
            return (
              <Reveal as="article" className="t" key={experiment.id} delay={index * 60}>
                {Demo && <Demo />}
                <div className="t-b">
                  <h3>{experiment.title.card[locale]}</h3>
                  <p>{experiment.description.card[locale]}</p>
                  <div className="t-foot">
                    <Tags items={experiment.tags.card[locale]} />
                    {experiment.code && <CopyButton text={experiment.code.short} labels={copyLabels} note="MIT" />}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
