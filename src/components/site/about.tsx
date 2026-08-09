import { Banknote, Code2, GraduationCap, MapPin } from "lucide-react";
import { Reveal, SectionHeading } from "./section";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useLiveTr } from "@/lib/live-translate";
import { useProfile, useStats } from "@/lib/portfolio";

export function About() {
  const { t } = useI18n();
  const { tr } = useLocalized();
  const { ltr } = useLiveTr();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();

  const pillars = [
    { Icon: Banknote, label: "Banking · Finance · Insurance" },
    { Icon: Code2, label: "Software & Web Development" },
    { Icon: GraduationCap, label: "ISCAE · Banque et Assurance" },
  ];

  return (
    <section id="about" className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("about.kicker")} title={t("about.title")} />

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p className="text-lg text-foreground">{ltr(profile, "bio")}</p>
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <p>{t("about.p3")}</p>
            {tr(profile, "location") ? (
              <p className="flex items-center gap-2 pt-2 text-sm text-foreground">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                {tr(profile, "location")}
              </p>
            ) : null}
          </Reveal>

          <Reveal delay={120} className="space-y-3">
            {pillars.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="min-w-0 break-words text-sm font-medium">{label}</p>
              </div>
            ))}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.id} className="rounded-xl border border-border bg-card p-4">
                  <dt className="order-2 text-xs text-muted-foreground">{tr(s, "label")}</dt>
                  <dd className="font-display text-2xl font-semibold text-primary">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
