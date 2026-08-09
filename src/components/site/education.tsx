import { GraduationCap } from "lucide-react";
import { Reveal, SectionHeading } from "./section";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useEducation } from "@/lib/portfolio";
import { formatMonthYear } from "@/lib/links";

export function Education() {
  const { t, lang } = useI18n();
  const { tr } = useLocalized();
  const { data: education } = useEducation();

  return (
    <section id="education" className="section-pad">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("education.kicker")} title={t("education.title")} />

        <ul className="space-y-4">
          {education.map((item, i) => (
            <Reveal as="li" key={item.id} delay={i * 80}>
              <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
                <span className="absolute inset-y-0 start-0 w-1 bg-primary/70" aria-hidden="true" />
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-snug break-words sm:text-lg">
                        {tr(item, "institution")}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {tr(item, "degree")}
                        {tr(item, "field") ? ` — ${tr(item, "field")}` : ""}
                      </p>
                      {tr(item, "level") ? (
                        <p className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {tr(item, "level")}
                        </p>
                      ) : null}
                      {tr(item, "description") ? (
                        <p className="mt-2 text-sm text-muted-foreground">{tr(item, "description")}</p>
                      ) : null}
                      {tr(item, "location") ? (
                        <p className="mt-2 text-xs text-muted-foreground">{tr(item, "location")}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {item.start_date ? formatMonthYear(item.start_date, lang) : (item.start_year ?? "")}
                    {item.start_date || item.start_year ? " — " : ""}
                    {item.current
                      ? t("education.current")
                      : item.end_date
                        ? formatMonthYear(item.end_date, lang)
                        : (item.end_year ?? "")}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
