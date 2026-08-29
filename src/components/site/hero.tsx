import { ArrowRight, Facebook, Github, Globe2, Instagram, Linkedin, Mail, MessageCircle, Sparkles, TrendingUp, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useLiveTr } from "@/lib/live-translate";
import { useProfile, useSocialLinks } from "@/lib/portfolio";
import { emailHref, githubUrl, linkedinUrl } from "@/lib/links";

export function Hero() {
  const { t } = useI18n();
  const { tr } = useLocalized();
  const { ltr } = useLiveTr();
  const { data: profile } = useProfile();
  const { data: managedSocials = [] } = useSocialLinks();
  const iconFor = (icon: string | null, platform: string) => {
    const key = (icon || platform).toLowerCase();
    if (key.includes("github")) return Github;
    if (key.includes("linkedin")) return Linkedin;
    if (key.includes("whatsapp")) return MessageCircle;
    if (key.includes("instagram")) return Instagram;
    if (key.includes("facebook")) return Facebook;
    if (key.includes("youtube")) return Youtube;
    if (key.includes("mail") || key.includes("email")) return Mail;
    return Globe2;
  };
  const socials = managedSocials.length > 0
    ? managedSocials.map((item) => ({ href: item.url, label: item.platform, Icon: iconFor(item.icon, item.platform) }))
    : [
        { href: githubUrl(profile.github_url), label: "GitHub", Icon: Github },
        { href: linkedinUrl(profile.linkedin_url), label: "LinkedIn", Icon: Linkedin },
        { href: emailHref(profile.email), label: "Email", Icon: Mail },
      ];

  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        className="pointer-events-none absolute inset-0 dot-pattern opacity-30 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -top-24 end-[-6rem] h-72 w-72 rounded-full bg-mint/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="reveal is-visible">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-mint" aria-hidden="true" />
            {t("hero.eyebrow")}
          </p>

          <h1 className="text-[2.6rem] leading-[1.02] font-semibold sm:text-6xl lg:text-[4.25rem]">
            {tr(profile, "full_name")}
            <span className="text-mint">.</span>
          </h1>

          <p className="mt-5 font-display text-xl font-medium sm:text-2xl">
            <span className="text-foreground">{t("hero.role1")}</span>
            <span className="mx-2 text-border" aria-hidden="true">
              /
            </span>
            <span className="text-gradient">{t("hero.role2")}</span>
          </p>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {ltr(profile, "headline") || t("hero.tagline")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="group min-h-12 rounded-full px-6">
              <a href="#projects">
                {t("hero.cta.projects")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 rounded-full px-6">
              <a href="#contact">{t("hero.cta.contact")}</a>
            </Button>
          </div>

          <ul className="mt-9 flex items-center gap-2">
            {socials.map(({ href, label, Icon }) =>
              href ? (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-mint hover:text-mint-foreground"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </div>

        <HeroVisual profileImage={profile.profile_image} name={ltr(profile, "full_name")} />
      </div>
    </section>
  );
}

function HeroVisual({ profileImage, name }: { profileImage: string | null; name: string }) {
  const { t } = useI18n();
  const bars = [38, 56, 44, 72, 60, 88, 76];

  return (
    <div className="reveal is-visible relative mx-auto w-full max-w-md">
      {profileImage ? (
        <div className="relative mx-auto mb-6 h-44 w-44 overflow-hidden rounded-[2.25rem] border-4 border-card shadow-lift sm:h-52 sm:w-52">
          <img src={profileImage} alt={name || "Profile"} className="h-full w-full object-cover" loading="eager" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/25 to-transparent" aria-hidden="true" />
        </div>
      ) : null}
      <div className="absolute -inset-8 rounded-[3rem] bg-mint/20 blur-3xl" />

      <div className="relative ink-panel float-soft p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-navy-foreground/60">
              {t("hero.card.title")}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">MDA · 2026</p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-mint-foreground">
            <TrendingUp className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-7 flex h-32 items-end gap-2">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-full bg-navy-foreground/15"
              style={{
                height: `${h}%`,
                background: i >= bars.length - 2 ? "var(--gradient-accent)" : undefined,
              }}
            />
          ))}
        </div>

        <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-navy-foreground/15 pt-5 text-center">
          <div>
            <dt className="text-[0.62rem] uppercase tracking-wide text-navy-foreground/60">
              {t("hero.card.metric1")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">5+</dd>
          </div>
          <div>
            <dt className="text-[0.62rem] uppercase tracking-wide text-navy-foreground/60">
              {t("hero.card.metric2")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">BCM</dd>
          </div>
          <div>
            <dt className="text-[0.62rem] uppercase tracking-wide text-navy-foreground/60">
              {t("hero.card.metric3")}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold">5</dd>
          </div>
        </dl>
      </div>

      <div className="absolute -bottom-7 start-4 hidden max-w-[16rem] items-start gap-2 rounded-3xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-lift sm:flex">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
        <span>{t("hero.card.note")}</span>
      </div>
    </div>
  );
}
