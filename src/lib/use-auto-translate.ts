import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { translateContent } from "@/lib/translate.functions";
import { supabase } from "@/lib/supabase";
import type { Lang } from "@/lib/i18n";

export type TranslateItems = { key: string; text: string }[];

/**
 * Auto-translation for dashboard content.
 * Sends the base (English) values to the server and returns accurate
 * translations for the requested languages.
 */
export function useAutoTranslate() {
  const run = useServerFn(translateContent);
  const [pending, setPending] = useState(false);

  const translate = useCallback(
    async (
      items: TranslateItems,
      targets: Lang[],
      source: Lang = "en",
    ): Promise<Record<string, Record<string, string>> | null> => {
      const clean = items.filter((i) => i.text && i.text.trim() !== "");
      const wanted = targets.filter((l) => l !== source);
      if (clean.length === 0 || wanted.length === 0) return null;

      setPending(true);
      try {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error("Session expired. Please sign in again.");

        const result = await run({
          data: { accessToken, source, targets: wanted, items: clean },
        });
        return result as Record<string, Record<string, string>>;
      } catch (e) {
        toast.error((e as Error).message);
        return null;
      } finally {
        setPending(false);
      }
    },
    [run],
  );

  return { translate, pending };
}
