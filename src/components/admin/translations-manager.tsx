import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Languages, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import {
  TRANSLATIONS_UPDATED_EVENT,
  defaultDicts,
  translationKeys,
  useI18n,
  type Lang,
} from "@/lib/i18n";
import { LANG_LABEL } from "@/lib/localized";
import { useAutoTranslate } from "@/lib/use-auto-translate";

type Row = { key: string; en: string | null; fr: string | null; ar: string | null };

const LANGS: Lang[] = ["en", "fr", "ar"];

/** Editor for every interface string of the site, in the three languages. */
export function TranslationsManager() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, Record<Lang, string>>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "ui_translations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ui_translations").select("key,en,fr,ar");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  useEffect(() => {
    const overrides = new Map((data ?? []).map((r) => [r.key, r]));
    const next: Record<string, Record<Lang, string>> = {};
    translationKeys.forEach((key) => {
      const row = overrides.get(key);
      next[key] = {
        en: row?.en ?? defaultDicts.en[key] ?? "",
        fr: row?.fr ?? defaultDicts.fr[key] ?? "",
        ar: row?.ar ?? defaultDicts.ar[key] ?? "",
      };
    });
    setValues(next);
  }, [data]);

  const visibleKeys = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return translationKeys;
    return translationKeys.filter(
      (key) =>
        key.toLowerCase().includes(q) ||
        LANGS.some((l) => (values[key]?.[l] ?? "").toLowerCase().includes(q)),
    );
  }, [search, values]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = translationKeys
        .filter((key) =>
          LANGS.some((l) => (values[key]?.[l] ?? "") !== (defaultDicts[l][key] ?? "")),
        )
        .map((key) => ({
          key,
          en: values[key]?.en ?? "",
          fr: values[key]?.fr ?? "",
          ar: values[key]?.ar ?? "",
        }));
      if (rows.length === 0) return;
      const { error } = await supabase
        .from("ui_translations")
        .upsert(rows as never, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("admin.saved"));
      void queryClient.invalidateQueries({ queryKey: ["admin", "ui_translations"] });
      window.dispatchEvent(new Event(TRANSLATIONS_UPDATED_EVENT));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { translate, pending: translating } = useAutoTranslate();

  async function translateMissing() {
    const missing = translationKeys.filter(
      (key) =>
        (values[key]?.en ?? "").trim() !== "" &&
        (["fr", "ar"] as Lang[]).some((l) => (values[key]?.[l] ?? "").trim() === ""),
    );
    if (missing.length === 0) {
      toast.info(t("admin.translate.allDone"));
      return;
    }
    const result = await translate(
      missing.map((key) => ({ key, text: values[key]?.en ?? "" })),
      ["fr", "ar"],
    );
    if (!result) return;
    setValues((prev) => {
      const next = { ...prev };
      missing.forEach((key) => {
        const row = { ...(next[key] as Record<Lang, string>) };
        (["fr", "ar"] as Lang[]).forEach((l) => {
          if ((row[l] ?? "").trim() === "" && result[key]?.[l]) row[l] = result[key][l];
        });
        next[key] = row;
      });
      return next;
    });
    toast.success(t("admin.translate.done"));
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">{t("admin.texts.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.texts.sub")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void translateMissing()} disabled={translating}>
            {translating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            {t("admin.translate.missing")}
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.saveChanges")}
          </Button>
        </div>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.texts.search")}
          className="ps-9"
          aria-label={t("admin.texts.search")}
        />
      </div>

      <ul className="space-y-4">
        {visibleKeys.map((key) => (
          <li key={key} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{key}</code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setValues((v) => ({
                    ...v,
                    [key]: {
                      en: defaultDicts.en[key] ?? "",
                      fr: defaultDicts.fr[key] ?? "",
                      ar: defaultDicts.ar[key] ?? "",
                    },
                  }))
                }
              >
                {t("admin.texts.reset")}
              </Button>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {LANGS.map((l) => {
                const id = `tr-${key}-${l}`;
                const val = values[key]?.[l] ?? "";
                const long = val.length > 60;
                return (
                  <div key={l} className="space-y-1.5">
                    <Label htmlFor={id} className="text-xs text-muted-foreground">
                      {LANG_LABEL[l]}
                    </Label>
                    {long ? (
                      <Textarea
                        id={id}
                        rows={3}
                        dir={l === "ar" ? "rtl" : "ltr"}
                        value={val}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [key]: { ...(v[key] as Record<Lang, string>), [l]: e.target.value },
                          }))
                        }
                      />
                    ) : (
                      <Input
                        id={id}
                        dir={l === "ar" ? "rtl" : "ltr"}
                        value={val}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [key]: { ...(v[key] as Record<Lang, string>), [l]: e.target.value },
                          }))
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
