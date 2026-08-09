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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/85 backdrop-blur-xl shadow-soft"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6"
        >
          <button
            type="button"
            onClick={handleLogoClick}
            className="group flex min-w-0 items-center gap-2 rounded-md"
            aria-label="Mohamed Dah Agove"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy font-display text-sm font-bold tracking-tight text-navy-foreground transition-transform duration-300 group-hover:scale-105">
              MDA
            </span>
            <span className="hidden truncate font-display text-sm font-semibold md:inline">
              Mohamed Dah Agove
            </span>
          </button>

          <ul className="hidden items-center gap-1 lg:flex">
            {SECTIONS.map((s) => (
              <li key={s}>
                <a
                  href={`#${s}`}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {t(`nav.${s}`)}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div
              className="flex items-center rounded-lg border border-border p-0.5"
              role="group"
              aria-label="Language"
            >
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={cn(
                    "rounded-md px-1.5 py-1 text-[11px] font-semibold uppercase transition-colors sm:px-2 sm:text-xs",
                    lang === l
                      ? "bg-primary text-primary-foreground"
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
              className="h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        {open ? (
          <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
            <ul className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
              {SECTIONS.map((s) => (
                <li key={s}>
                  <a
                    href={`#${s}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 text-base text-foreground transition-colors hover:bg-secondary"
                  >
                    {t(`nav.${s}`)}
                  </a>
                </li>
              ))}
              <li className="mt-2 flex gap-2 px-3 pb-2">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={cn(
                      "min-h-10 flex-1 rounded-md border border-border text-sm font-semibold uppercase",
                      lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </li>
            </ul>
          </div>
        ) : null}
      </header>

      <DeveloperLogin open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
