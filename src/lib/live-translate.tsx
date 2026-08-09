import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { translatePublicContent } from "@/lib/translate.functions";
import { useI18n, type Lang } from "@/lib/i18n";
import { localizedValue } from "@/lib/localized";

/**
 * Visitor-facing live translation layer.
 *
 * Content rows store translations in `<field>_fr` / `<field>_ar` columns. When a
 * translation is missing (the dashboard has not translated that field yet), the
 * site would previously fall back to the English text — so a French or Arabic
 * visitor saw English descriptions. This provider translates those missing
 * values on the fly, batches the requests, and caches results in localStorage so
 * each text is translated only once per language.
 */

const STORE_KEY = "mda:live-translations:v2";
const MAX_BATCH = 24;

function hashText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) h = (h * 33) ^ text.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function hasLetters(text: string): boolean {
  return /\p{L}{2,}/u.test(text);
}

type Ctx = {
  get: (lang: Lang, text: string) => string | undefined;
  request: (lang: Lang, text: string) => void;
};

const LiveTranslateContext = createContext<Ctx | null>(null);

function readStore(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function LiveTranslateProvider({ children }: { children: ReactNode }) {
  const run = useServerFn(translatePublicContent);
  const [cache, setCache] = useState<Record<string, string>>({});
  const queue = useRef<Map<string, { lang: Lang; text: string; key: string }>>(new Map());
  const inFlight = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    setCache(readStore());
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const persist = useCallback((next: Record<string, string>) => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* storage full or unavailable — memory cache still works */
    }
  }, []);

  const flush = useCallback(async () => {
    timer.current = null;
    const entries = Array.from(queue.current.values());
    if (entries.length === 0) return;
    queue.current.clear();

    // One request per target language.
    const byLang = new Map<Lang, { key: string; text: string }[]>();
    entries.forEach((e) => {
      const bucket = byLang.get(e.lang) ?? [];
      if (bucket.length < MAX_BATCH) bucket.push({ key: e.key, text: e.text });
      byLang.set(e.lang, bucket);
    });

    for (const [lang, items] of byLang) {
      items.forEach((i) => inFlight.current.add(`${lang}:${i.key}`));
      try {
        const result = (await run({ data: { target: lang, items } })) as Record<string, string>;
        if (!mounted.current) return;
        setCache((prev) => {
          const next = { ...prev };
          Object.entries(result ?? {}).forEach(([key, value]) => {
            if (typeof value === "string" && value.trim() !== "") next[`${lang}:${key}`] = value;
          });
          persist(next);
          return next;
        });
      } catch {
        /* keep the English fallback if translation is unavailable */
      } finally {
        items.forEach((i) => inFlight.current.delete(`${lang}:${i.key}`));
      }
    }
  }, [persist, run]);

  const request = useCallback(
    (lang: Lang, text: string) => {
      if (typeof window === "undefined") return;
      const key = hashText(text);
      const id = `${lang}:${key}`;
      if (inFlight.current.has(id) || queue.current.has(id)) return;
      queue.current.set(id, { lang, text, key });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void flush();
      }, 250);
    },
    [flush],
  );

  const value = useMemo<Ctx>(
    () => ({
      get: (lang, text) => cache[`${lang}:${hashText(text)}`],
      request,
    }),
    [cache, request],
  );

  return <LiveTranslateContext.Provider value={value}>{children}</LiveTranslateContext.Provider>;
}

/**
 * `ltr(row, field)` — like `tr(row, field)` but auto-translates the English
 * fallback into the active language when a stored translation is missing.
 */
export function useLiveTr() {
  const { lang } = useI18n();
  const ctx = useContext(LiveTranslateContext);

  const ltr = useCallback(
    (row: unknown, field: string): string => {
      const base = localizedValue(row, field, "en");
      if (lang === "en" || !ctx) return localizedValue(row, field, lang) || base;

      const stored = localizedValue(row, field, lang);
      // A stored translation exists when it differs from the English base.
      if (stored && stored !== base) return stored;
      if (!base || !hasLetters(base)) return base;

      const cached = ctx.get(lang, base);
      if (cached) return cached;
      ctx.request(lang, base);
      return base;
    },
    [ctx, lang],
  );

  /** Translate a plain string (not a row field). */
  const ltext = useCallback(
    (text: string): string => {
      if (lang === "en" || !ctx || !text || !hasLetters(text)) return text;
      const cached = ctx.get(lang, text);
      if (cached) return cached;
      ctx.request(lang, text);
      return text;
    },
    [ctx, lang],
  );

  return { lang, ltr, ltext };
}
