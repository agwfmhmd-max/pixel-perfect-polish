import { Building2 } from "lucide-react";
import { Reveal, SectionHeading } from "./section";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useLiveTr } from "@/lib/live-translate";
import { useExperience } from "@/lib/portfolio";
import { formatMonthYear } from "@/lib/links";

export function Experience() {
  const { t, lang } = useI18n();
  const { tr } = useLocalized();
  const { ltr } = useLiveTr();
  const { data: experience } = useExperience();

  return (
    <section id="experience" className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("experience.kicker")} title={t("experience.title")} />

        <ol className="relative ms-3 space-y-6 border-s border-border ps-6 sm:ms-4 sm:space-y-8 sm:ps-8">
          {experience.map((item, i) => (
            <Reveal as="li" key={item.id} delay={i * 90} className="relative">
              <span
                className="absolute -start-[2.1rem] top-1.5 flex h-8 w-8 sm:-start-[2.6rem] items-center justify-center rounded-full border border-border bg-card text-primary shadow-soft"
                aria-hidden="true"
              >
                <Building2 className="h-4 w-4" />
              </span>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {formatMonthYear(item.start_date, lang)}
                  {item.start_date ? " — " : ""}
                  {item.current ? t("education.current") : formatMonthYear(item.end_date, lang)}
                </p>
                <h3 className="mt-2 break-words text-base font-semibold sm:text-lg">{tr(item, "organization")}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{tr(item, "position")}</p>
                {tr(item, "department") ? (
                  <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                    <span className="font-semibold">{t("experience.department")}: </span>
                    {tr(item, "department")}
                  </p>
                ) : null}
                {tr(item, "description") ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {ltr(item, "description")}
                  </p>
                ) : null}
                {tr(item, "location") ? (
                  <p className="mt-3 text-xs text-muted-foreground">{tr(item, "location")}</p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
