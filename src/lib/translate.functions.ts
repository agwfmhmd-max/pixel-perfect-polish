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
