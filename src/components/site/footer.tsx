import { ArrowRight, Facebook, Globe2, Github, Instagram, Linkedin, Mail, MessageCircle, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./section";
import { useI18n } from "@/lib/i18n";
import { useLocalized } from "@/lib/localized";
import { useLiveTr } from "@/lib/live-translate";
import { useProfile, useSocialLinks } from "@/lib/portfolio";

const LINKS = ["home", "about", "education", "experience", "skills", "projects", "contact"] as const;

export function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="bg-navy py-20 text-navy-foreground">
      <Reveal className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">{t("cta.title")}</h2>
        <Button asChild size="lg" variant="secondary" className="mt-8 min-h-11 group">
          <a href="#contact">
            {t("cta.button")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </a>
        </Button>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  const { tr } = useLocalized();
  const { ltr } = useLiveTr();
  const { data: profile } = useProfile();

  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-base font-semibold">{tr(profile, "full_name")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{ltr(profile, "headline")}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LINKS.map((l) => (
              <li key={l}>
                <a
                  href={`#${l}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t(`nav.${l}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-8 w-full max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {tr(profile, "full_name")}. {t("footer.rights")}
      </p>
    </footer>
  );
}
