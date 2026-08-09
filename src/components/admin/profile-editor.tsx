import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { CONTENT_LANGS, LANG_LABEL, langColumn } from "@/lib/localized";
import { ImageField } from "./image-field";
import { useAutoTranslate } from "@/lib/use-auto-translate";
import type { Lang } from "@/lib/i18n";

type Field = {
  name: string;
  label: string;
  type?: "textarea" | "image";
  /** Edited in the three languages. */
  i18n?: boolean;
};

const FIELDS: Field[] = [
  { name: "full_name", label: "Full Name", i18n: true },
  { name: "headline", label: "Headline", i18n: true },
  { name: "bio", label: "Bio", type: "textarea", i18n: true },
  { name: "profile_image", label: "Profile Image", type: "image" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "location", label: "Location", i18n: true },
  { name: "github_url", label: "GitHub" },
  { name: "linkedin_url", label: "LinkedIn" },
  { name: "whatsapp_url", label: "WhatsApp" },
];

function columnsOf(f: Field) {
  return f.i18n ? CONTENT_LANGS.map((l) => langColumn(f.name, l)) : [f.name];
}

const ALL_COLUMNS = FIELDS.flatMap(columnsOf);

export function ProfileEditor() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as (Record<string, string | null> & { id: string }) | null;
    },
  });

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    ALL_COLUMNS.forEach((col) => {
      next[col] = (data[col] as string | null) ?? "";
    });
    setValues(next);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(
        ALL_COLUMNS.map((col) => [col, values[col] === "" ? null : (values[col] ?? null)]),
      );
      if (data?.id) {
        const { error } = await supabase.from("profile").update(payload as never).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profile").insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("admin.saved"));
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { translate, pending: translating } = useAutoTranslate();

  async function translateAll() {
    const items = FIELDS.filter((f) => f.i18n)
      .map((f) => ({ key: f.name, text: values[langColumn(f.name, "en")] ?? "" }))
      .filter((i) => i.text.trim() !== "");
    if (items.length === 0) {
      toast.error(t("admin.translate.needBase"));
      return;
    }
    const targets = CONTENT_LANGS.filter((l) => l !== "en") as Lang[];
    const result = await translate(items, targets);
    if (!result) return;
    setValues((prev) => {
      const next = { ...prev };
      items.forEach(({ key }) => {
        targets.forEach((l) => {
          const v = result[key]?.[l];
          if (v) next[langColumn(key, l)] = v;
        });
      });
      return next;
    });
    toast.success(t("admin.translate.done"));
  }

  function control(f: Field, col: string, id: string, dir?: "rtl" | "ltr") {
    const value = values[col] ?? "";
    const set = (v: string) => setValues((prev) => ({ ...prev, [col]: v }));
    if (f.type === "textarea") {
      return (
        <Textarea id={id} rows={4} dir={dir} value={value} onChange={(e) => set(e.target.value)} />
      );
    }
    if (f.type === "image") {
      return <ImageField id={id} value={value} onChange={set} />;
    }
    return <Input id={id} dir={dir} value={value} onChange={(e) => set(e.target.value)} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 break-words text-xl font-semibold sm:text-2xl">
          {t("admin.profile")}
        </h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={translating}
          onClick={() => void translateAll()}
        >
          {translating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {t("admin.translate.all")}
        </Button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="grid max-w-3xl gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-6"
      >
        {FIELDS.map((f) => (
          <div
            key={f.name}
            className={
              f.type === "textarea" || f.type === "image" || f.i18n
                ? "space-y-2 sm:col-span-2"
                : "space-y-2"
            }
          >
            {f.i18n ? (
              <div className="space-y-2 rounded-xl border border-border p-3">
                <Label>{f.label}</Label>
                <Tabs defaultValue="en">
                  <TabsList className="mb-2 w-full">
                    {CONTENT_LANGS.map((l) => (
                      <TabsTrigger key={l} value={l} className="flex-1">
                        {LANG_LABEL[l]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {CONTENT_LANGS.map((l) => (
                    <TabsContent key={l} value={l}>
                      {control(
                        f,
                        langColumn(f.name, l),
                        `profile-${f.name}-${l}`,
                        l === "ar" ? "rtl" : "ltr",
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <>
                <Label htmlFor={`profile-${f.name}`}>{f.label}</Label>
                {control(f, f.name, `profile-${f.name}`)}
              </>
            )}
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("admin.saveChanges")
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
