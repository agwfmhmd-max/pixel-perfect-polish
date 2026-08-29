import { useCallback } from "react";
import { useI18n, type Lang } from "@/lib/i18n";

/** Languages supported for content translation. English columns are the base columns. */
export const CONTENT_LANGS: Lang[] = ["en", "fr", "ar"];

export const LANG_LABEL: Record<Lang, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

/**
 * Column name holding the translation of `field` for `lang`.
 * English uses the original column (e.g. `title`), other languages use `title_fr` / `title_ar`.
 */
export function langColumn(field: string, lang: Lang): string {
  return lang === "en" ? field : `${field}_${lang}`;
}

/** Read a translated value from a row, falling back to the base (English) column. */
export function localizedValue(row: unknown, field: string, lang: Lang): string {
  if (!row || typeof row !== "object") return "";
  const record = row as Record<string, unknown>;
  const translated = record[langColumn(field, lang)];
  if (typeof translated === "string" && translated.trim() !== "") return translated;
  // Deliberately do not fall back to English for a selected non-English language.
  // This keeps the public interface linguistically consistent.
  if (lang !== "en") return "";
  const base = record[field];
  return typeof base === "string" ? base : base == null ? "" : String(base);
}

/** Hook returning a `tr(row, field)` helper bound to the active site language. */
export function useLocalized() {
  const { lang } = useI18n();
  const tr = useCallback(
    (row: unknown, field: string) => localizedValue(row, field, lang),
    [lang],
  );
  return { lang, tr };
}
