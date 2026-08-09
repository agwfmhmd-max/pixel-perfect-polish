import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAuthenticated, translateBatch, type TransLang } from "./translate.server";

const langs = z.enum(["en", "fr", "ar"]);

const schema = z.object({
  accessToken: z.string().min(10),
  source: langs.default("en"),
  targets: z.array(langs).min(1),
  items: z.array(z.object({ key: z.string().min(1), text: z.string().min(1) })).min(1).max(80),
});

export const translateContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    await assertAuthenticated(data.accessToken);
    return translateBatch(
      data.items,
      data.source as TransLang,
      data.targets as TransLang[],
    );
  });

/**
 * Public, unauthenticated translation used by the visitor-facing site to fill in
 * missing translations on the fly (e.g. a project description that only exists
 * in English). Deliberately small limits to keep the endpoint cheap and safe.
 */
const publicSchema = z.object({
  target: langs,
  items: z
    .array(z.object({ key: z.string().min(1).max(120), text: z.string().min(1).max(1600) }))
    .min(1)
    .max(24),
});

export const translatePublicContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => publicSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await translateBatch(data.items, "en", [data.target as TransLang]);
    return result[data.target] ?? {};
  });

