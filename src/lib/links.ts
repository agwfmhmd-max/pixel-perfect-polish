import type { Lang } from "@/lib/i18n";

/**
 * Turns whatever the admin typed into a real, absolute href.
 * Accepts phone numbers, bare domains, usernames or full URLs.
 */

const PLACEHOLDER_RE = /^\[.*\]$/;

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v || PLACEHOLDER_RE.test(v)) return null;
  return v;
}

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

/** Absolute URL for any external link (adds https:// when missing). */
export function externalUrl(value: string | null | undefined): string | null {
  const v = clean(value);
  if (!v) return null;
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  if (v.startsWith("//")) return `https:${v}`;
  if (v.startsWith("www.") || v.includes(".")) return `https://${v}`;
  return `https://${v}`;
}

/** WhatsApp: accepts +222 20 47 99 62, 22220479962, wa.me/... or a full URL. */
export function whatsappUrl(value: string | null | undefined): string | null {
  const v = clean(value);
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(v)) return `https://${v}`;
  const digits = digitsOnly(v);
  if (digits.length >= 7) return `https://wa.me/${digits}`;
  return null;
}

export function linkedinUrl(value: string | null | undefined): string | null {
  const v = clean(value);
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.includes(".")) return externalUrl(v);
  return `https://www.linkedin.com/in/${v.replace(/^@/, "")}`;
}

export function githubUrl(value: string | null | undefined): string | null {
  const v = clean(value);
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.includes(".")) return externalUrl(v);
  return `https://github.com/${v.replace(/^@/, "")}`;
}

export function emailHref(value: string | null | undefined): string | null {
  const v = clean(value);
  if (!v) return null;
  return v.startsWith("mailto:") ? v : `mailto:${v}`;
}

export function emailLabel(value: string | null | undefined): string | null {
  return clean(value);
}

/** Stable locale per language so server and client render identical dates. */
export const LOCALES: Record<Lang, string> = {
  en: "en-GB",
  fr: "fr-FR",
  ar: "ar-MA",
};

export function formatMonthYear(value: string | null | undefined, lang: Lang) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(LOCALES[lang] ?? "en-GB", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
