import { Reveal, SectionHeading } from "./section";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useLiveTr } from "@/lib/live-translate";
import { useEducation, useExperience, useProjects } from "@/lib/portfolio";

export function Journey() {
  const { t } = useI18n();
  const { tr } = useLocalized();
  const { ltr } = useLiveTr();
  const { data: education } = useEducation();
  const { data: experience } = useExperience();
  const { data: projects } = useProjects();

  const items = [
    ...education.map((e) => ({
      id: `edu-${e.id}`,
      year: e.current ? String(new Date().getFullYear()) : String(e.end_year ?? e.start_year ?? ""),
      title: `${tr(e, "degree")}${tr(e, "field") ? ` — ${tr(e, "field")}` : ""}`,
      subtitle: tr(e, "institution"),
    })),
    ...experience.map((x) => ({
      id: `exp-${x.id}`,
      year: x.start_date ? new Date(x.start_date).getFullYear().toString() : "",
      title: `${tr(x, "position")}${tr(x, "department") ? ` — ${tr(x, "department")}` : ""}`,
      subtitle: tr(x, "organization"),
    })),
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      year: "",
      title: tr(p, "title"),
      subtitle: ltr(p, "short_description") || ltr(p, "category"),
    })),
  ];

  return (
    <section className="section-pad">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("journey.kicker")} title={t("journey.title")} />

        <ol className="relative ms-2 border-s border-border ps-8">
          {items.map((item, i) => (
            <Reveal as="li" key={item.id} delay={i * 60} className="relative pb-8 last:pb-0">
              <span
                className="absolute -start-[2.15rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary"
                aria-hidden="true"
              />
              {item.year ? (
                <p className="font-mono text-xs font-semibold text-primary">{item.year}</p>
              ) : null}
              <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.subtitle}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
