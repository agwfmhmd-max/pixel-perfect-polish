import { Reveal, SectionHeading } from "./section";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useSkills } from "@/lib/portfolio";

export function Skills() {
  const { t } = useI18n();
  const { tr } = useLocalized();
  const { data: skills } = useSkills();

  const grouped = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[tr(s, "category")] ??= []).push(s);
    return acc;
  }, {});

  return (
    <section id="skills" className="section-pad">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("skills.kicker")} title={t("skills.title")} />

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(grouped).map(([category, items], i) => (
            <Reveal key={category} delay={i * 80}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-6 w-1 rounded-full bg-primary" aria-hidden="true" />
                  <h3 className="text-base font-semibold">{category}</h3>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {tr(s, "name")}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
