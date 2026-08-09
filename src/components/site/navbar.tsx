import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { DeveloperLogin } from "./developer-login";

const SECTIONS = ["home", "about", "education", "experience", "skills", "projects", "contact"] as const;

const LANGS: Lang[] = ["en", "fr", "ar"];

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140;
      let current = SECTIONS[0] as string;
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s);
        if (el && el.offsetTop <= y) current = s;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setLoginOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleLogoClick() {
    const now = Date.now();
    clicks.current = [...clicks.current, now].filter((ts) => now - ts < 2500);
    if (clicks.current.length >= 5) {
      clicks.current = [];
      setLoginOpen(true);
    }
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-5">
        <nav
          aria-label="Main"
          className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:flex lg:justify-between"
        >
          <button
            type="button"
            onClick={handleLogoClick}
            className="pill-surface flex min-w-0 items-center gap-2 px-3 py-2 transition-transform duration-300 hover:-translate-y-0.5 sm:px-4"
            aria-label="Mohamed Dah Agove"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy font-display text-[0.7rem] font-bold text-navy-foreground">
              MDA
            </span>
            <span className="hidden truncate font-display text-sm font-semibold md:inline">
              Mohamed Dah&nbsp;<span className="text-primary">Agove.</span>
            </span>
          </button>

          <ul className="pill-surface hidden items-center gap-0.5 px-1.5 py-1.5 lg:flex">
            {SECTIONS.map((s) => (
              <li key={s}>
                <a
                  href={`#${s}`}
                  aria-current={active === s ? "true" : undefined}
                  className={cn(
                    "block rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300",
                    active === s
                      ? "bg-mint text-mint-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {t(`nav.${s}`)}
                </a>
              </li>
            ))}
          </ul>

          <div className="pill-surface flex shrink-0 items-center gap-1 px-1.5 py-1.5">
            <div className="flex items-center rounded-full bg-secondary/70 p-0.5" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={cn(
                    "rounded-full px-2 py-1 text-[11px] font-bold uppercase transition-all duration-300 sm:text-xs",
                    lang === l
                      ? "bg-mint text-mint-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={t("nav.theme")}
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full lg:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Button
              asChild
              size="sm"
              className="ms-1 hidden min-h-9 rounded-full px-4 lg:inline-flex"
            >
              <a href="#contact">{t("nav.talk")}</a>
            </Button>
          </div>
        </nav>

        {open ? (
          <div className="mx-3 mt-2 panel overflow-hidden p-2 lg:hidden">
            <ul>
              {SECTIONS.map((s) => (
                <li key={s}>
                  <a
                    href={`#${s}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {t(`nav.${s}`)}
                  </a>
                </li>
              ))}
              <li className="mt-1 px-2 pb-1">
                <Button asChild className="min-h-11 w-full rounded-full">
                  <a href="#contact" onClick={() => setOpen(false)}>
                    {t("nav.talk")}
                  </a>
                </Button>
              </li>
            </ul>
          </div>
        ) : null}
      </header>

      <DeveloperLogin open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
