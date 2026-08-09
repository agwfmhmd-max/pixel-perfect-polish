/**
 * Server-only helpers for the automatic translation feature.
 * Uses the Lovable AI Gateway; the key never reaches the browser.
 */

export type TransLang = "en" | "fr" | "ar";

const LANG_NAME: Record<TransLang, string> = {
  en: "English",
  fr: "French",
  ar: "Arabic",
};

/** Verifies the caller is a signed-in dashboard user before spending AI credits. */
export async function assertAuthenticated(accessToken: string) {
  const url = process.env["SUPABASE_URL"] ?? "https://nnbxziumubraxyeqkadn.supabase.co";
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "sb_publishable_NJa7gfPEeWIgxZTiAfmdxA_wEKxo846";

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
}

export async function translateBatch(
  items: { key: string; text: string }[],
  source: TransLang,
  targets: TransLang[],
): Promise<Record<string, Record<string, string>>> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Translation service is not configured.");

  const payload = Object.fromEntries(items.map((i) => [i.key, i.text]));

  const system = [
    "You are a professional translator for a personal portfolio / ERP website.",
    `Translate each value from ${LANG_NAME[source]} into: ${targets.map((l) => LANG_NAME[l]).join(", ")}.`,
    "Rules:",
    "- Preserve meaning exactly; produce natural, professional wording (not literal word-for-word).",
    "- Keep proper nouns, brand names, product names, acronyms and technology names unchanged (e.g. Supabase, React, TypeScript, ISCAE).",
    "- Keep URLs, emails, numbers, dates and punctuation placeholders intact.",
    "- Arabic must be correct Modern Standard Arabic with proper diacritic-free spelling and RTL-friendly punctuation.",
    "- Never add explanations, quotes or extra text.",
    'Answer with strict JSON of shape: {"<lang>": {"<key>": "<translation>"}} for every requested language and every key.',
  ].join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({ targetLanguages: targets, values: payload }),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429) throw new Error("Too many requests. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please top up your workspace.");
  if (!res.ok) throw new Error(`Translation failed (${res.status}).`);

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content ?? "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : {};
  }

  const out: Record<string, Record<string, string>> = {};
  targets.forEach((l) => {
    const bucket = (parsed as Record<string, unknown>)?.[l];
    const dict: Record<string, string> = {};
    if (bucket && typeof bucket === "object") {
      Object.entries(bucket as Record<string, unknown>).forEach(([k, v]) => {
        if (typeof v === "string" && v.trim() !== "") dict[k] = v.trim();
      });
    }
    out[l] = dict;
  });
  return out;
}
