import { ArrowRight, Github, Linkedin, Mail, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useProfile } from "@/lib/portfolio";
import { emailHref, githubUrl, linkedinUrl } from "@/lib/links";

export function Hero() {
  const { t } = useI18n();
  const { tr } = useLocalized();
  const { data: profile } = useProfile();

  const socials = [
    { href: githubUrl(profile.github_url), label: "GitHub", Icon: Github },
    { href: linkedinUrl(profile.linkedin_url), label: "LinkedIn", Icon: Linkedin },
    { href: emailHref(profile.email), label: "Email", Icon: Mail },
  ];

  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div
        className="pointer-events-none absolute inset-0 grid-pattern opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="reveal is-visible">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
            {t("hero.eyebrow")}
          </p>

          <h1 className="text-4xl font-semibold leading-[1.05] sm:text-6xl">
            {tr(profile, "full_name")}
          </h1>

          <p className="mt-4 font-display text-lg font-medium sm:text-xl">
            <span className="text-foreground">{t("hero.role1")}</span>
            <span className="mx-2 text-border" aria-hidden="true">
              /
            </span>
            <span className="text-gradient">{t("hero.role2")}</span>
          </p>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.tagline")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="min-h-11 group">
              <a href="#projects">
                {t("hero.cta.projects")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-11">
              <a href="#contact">{t("hero.cta.contact")}</a>
            </Button>
          </div>

          <ul className="mt-8 flex items-center gap-2">
            {socials.map(({ href, label, Icon }) =>
              href ? (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  const { t } = useI18n();
  const bars = [38, 56, 44, 72, 60, 88, 76];

  return (
    <div className="reveal is-visible relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
      <div className="relative rounded-2xl border border-border bg-card/90 p-6 shadow-lift backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t("hero.card.title")}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">MDA · 2026</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/15 text-teal">
            <TrendingUp className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-6 flex h-28 items-end gap-2">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-sm bg-primary/25"
              style={{
                height: `${h}%`,
                background:
                  i === bars.length - 1 ? "var(--gradient-accent)" : undefined,
              }}
            />
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center">
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              {t("hero.card.metric1")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">5+</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              {t("hero.card.metric2")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">BCM</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              {t("hero.card.metric3")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">5</dd>
          </div>
        </dl>
      </div>

      <div className="absolute -bottom-6 start-2 hidden max-w-[15rem] rounded-xl border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground shadow-soft sm:block">
        {t("hero.card.note")}
      </div>
    </div>
  );
}
