import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Languages, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useI18n, type Lang } from "@/lib/i18n";
import { CONTENT_LANGS, LANG_LABEL, langColumn, localizedValue } from "@/lib/localized";
import { useAutoTranslate } from "@/lib/use-auto-translate";
import { ImageField } from "./image-field";

export type FieldType = "text" | "textarea" | "number" | "bool" | "tags" | "image" | "date";

export type FieldSpec = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  /** When true, the field is edited in the three languages (base + `_fr` + `_ar` columns). */
  i18n?: boolean;
};

type Row = Record<string, unknown> & { id: string };

const TARGET_LANGS: Lang[] = CONTENT_LANGS.filter((l) => l !== "en");

/** Every database column a field writes to. */
function fieldColumns(f: FieldSpec): string[] {
  return f.i18n ? CONTENT_LANGS.map((l) => langColumn(f.name, l)) : [f.name];
}

function emptyValues(fields: FieldSpec[]) {
  const out: Record<string, unknown> = {};
  fields.forEach((f) => {
    const initial =
      f.type === "bool" ? false : f.type === "number" ? 0 : f.type === "tags" ? [] : "";
    fieldColumns(f).forEach((col) => {
      out[col] = initial;
    });
  });
  return out;
}

export function CrudManager({
  table,
  title,
  fields,
  primaryField,
  secondaryField,
  orderBy = "sort_order",
}: {
  table: string;
  title: string;
  fields: FieldSpec[];
  primaryField: string;
  secondaryField?: string;
  orderBy?: string;
}) {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(emptyValues(fields));
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const { translate, pending: translating } = useAutoTranslate();
  const [bulkPending, setBulkPending] = useState(false);

  const i18nFields = fields.filter((f) => f.i18n);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", table] });
    void queryClient.invalidateQueries();
  };

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editing) {
        const { error } = await supabase.from(table).update(payload as never).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("admin.saved"));
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("admin.deleted"));
      setToDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startCreate() {
    setEditing(null);
    setValues(emptyValues(fields));
    setOpen(true);
  }

  function startEdit(row: Row) {
    const next: Record<string, unknown> = {};
    fields.forEach((f) => {
      fieldColumns(f).forEach((col) => {
        const v = row[col];
        next[col] =
          f.type === "tags"
            ? Array.isArray(v)
              ? (v as string[]).join(", ")
              : ""
            : (v ?? (f.type === "bool" ? false : ""));
      });
    });
    setValues(next);
    setEditing(row);
    setOpen(true);
  }

  /** Fills the French + Arabic inputs of the open form from the English values. */
  async function translateForm(only?: FieldSpec) {
    const source = only ? [only] : i18nFields;
    const items = source
      .map((f) => ({ key: f.name, text: String(values[f.name] ?? "").trim() }))
      .filter((i) => i.text !== "");
    if (items.length === 0) {
      toast.error(t("admin.translate.needBase"));
      return;
    }
    const result = await translate(items, TARGET_LANGS);
    if (!result) return;
    setValues((prev) => {
      const next = { ...prev };
      TARGET_LANGS.forEach((l) => {
        source.forEach((f) => {
          const value = result[l]?.[f.name];
          if (value) next[langColumn(f.name, l)] = value;
        });
      });
      return next;
    });
    toast.success(t("admin.translate.done"));
  }

  /** Fills every missing translation of every saved row of this table. */
  async function translateAllRows() {
    if (!data || data.length === 0 || i18nFields.length === 0) return;
    setBulkPending(true);
    try {
      const items: { key: string; text: string }[] = [];
      data.forEach((row) => {
        i18nFields.forEach((f) => {
          const base = String(row[f.name] ?? "").trim();
          if (!base) return;
          const missing = TARGET_LANGS.some(
            (l) => String(row[langColumn(f.name, l)] ?? "").trim() === "",
          );
          if (missing) items.push({ key: `${row.id}__${f.name}`, text: base });
        });
      });

      if (items.length === 0) {
        toast.success(t("admin.translate.allDone"));
        return;
      }

      const chunks: (typeof items)[] = [];
      for (let i = 0; i < items.length; i += 40) chunks.push(items.slice(i, i + 40));

      const merged: Record<string, Record<string, string>> = {};
      for (const chunk of chunks) {
        const res = await translate(chunk, TARGET_LANGS);
        if (!res) return;
        TARGET_LANGS.forEach((l) => {
          merged[l] = { ...(merged[l] ?? {}), ...(res[l] ?? {}) };
        });
      }

      const updates = new Map<string, Record<string, unknown>>();
      data.forEach((row) => {
        i18nFields.forEach((f) => {
          TARGET_LANGS.forEach((l) => {
            const col = langColumn(f.name, l);
            if (String(row[col] ?? "").trim() !== "") return;
            const value = merged[l]?.[`${row.id}__${f.name}`];
            if (!value) return;
            const patch = updates.get(row.id) ?? {};
            patch[col] = value;
            updates.set(row.id, patch);
          });
        });
      });

      for (const [id, patch] of updates) {
        const { error } = await supabase.from(table).update(patch as never).eq("id", id);
        if (error) throw error;
      }
      toast.success(t("admin.translate.done"));
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBulkPending(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      fieldColumns(f).forEach((col) => {
        const raw = values[col];
        if (f.type === "tags") {
          payload[col] = String(raw ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (f.type === "number") {
          payload[col] = raw === "" || raw === null ? null : Number(raw);
        } else if (f.type === "bool") {
          payload[col] = Boolean(raw);
        } else {
          payload[col] = raw === "" ? null : raw;
        }
      });
    });
    save.mutate(payload);
  }

  function renderControl(f: FieldSpec, col: string, id: string, dir?: "rtl" | "ltr") {
    const value = values[col];
    const set = (v: unknown) => setValues((prev) => ({ ...prev, [col]: v }));

    if (f.type === "textarea") {
      return (
        <Textarea
          id={id}
          rows={4}
          dir={dir}
          value={String(value ?? "")}
          required={f.required && col === f.name}
          onChange={(e) => set(e.target.value)}
        />
      );
    }
    if (f.type === "bool") {
      return (
        <div>
          <Switch id={id} checked={Boolean(value)} onCheckedChange={(c) => set(c)} />
        </div>
      );
    }
    if (f.type === "image") {
      return <ImageField id={id} value={String(value ?? "")} onChange={(val) => set(val)} />;
    }
    return (
      <Input
        id={id}
        dir={dir}
        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
        value={String(value ?? "")}
        required={f.required && col === f.name}
        placeholder={f.placeholder ?? (f.type === "tags" ? "React, Supabase" : undefined)}
        onChange={(e) => set(e.target.value)}
      />
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 break-words text-xl font-semibold sm:text-2xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {i18nFields.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void translateAllRows()}
              disabled={bulkPending || translating}
            >
              {bulkPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Languages className="h-4 w-4" />
              )}
              <span className="truncate">{t("admin.translate.missing")}</span>
            </Button>
          ) : null}
          <Button onClick={startCreate} size="sm">
            <Plus className="h-4 w-4" /> {t("admin.new")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {(error as Error).message}
        </p>
      ) : !data || data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {t("admin.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((row) => (
            <li
              key={row.id}
              className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="break-words font-medium">{localizedValue(row, primaryField, lang)}</p>
                {secondaryField ? (
                  <p className="break-words text-sm text-muted-foreground">
                    {localizedValue(row, secondaryField, lang)}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(row)}>
                  <Pencil className="h-4 w-4" /> {t("admin.edit")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  aria-label={t("admin.delete")}
                  onClick={() => setToDelete(row)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="break-words text-start">
              {editing ? `${t("admin.update")} — ${title}` : `${t("admin.create")} — ${title}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {i18nFields.length > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={translating}
                onClick={() => void translateForm()}
              >
                {translating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="h-4 w-4" />
                )}
                {t("admin.translate.all")}
              </Button>
            ) : null}

            {fields.map((f) => {
              const id = `${table}-${f.name}`;
              if (f.i18n) {
                return (
                  <div key={f.name} className="space-y-2 rounded-xl border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label className="min-w-0 break-words">{f.label}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={translating}
                        onClick={() => void translateForm(f)}
                      >
                        <Languages className="h-4 w-4" />
                        {t("admin.translate.field")}
                      </Button>
                    </div>
                    <Tabs defaultValue="en">
                      <TabsList className="mb-2 grid w-full grid-cols-3">
                        {CONTENT_LANGS.map((l) => (
                          <TabsTrigger key={l} value={l} className="truncate text-xs sm:text-sm">
                            {LANG_LABEL[l]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {CONTENT_LANGS.map((l) => {
                        const col = langColumn(f.name, l);
                        return (
                          <TabsContent key={l} value={l}>
                            {renderControl(f, col, `${id}-${l}`, l === "ar" ? "rtl" : "ltr")}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  </div>
                );
              }
              return (
                <div key={f.name} className="space-y-2">
                  <Label htmlFor={id} className="break-words">
                    {f.label}
                  </Label>
                  {renderControl(f, f.name, id)}
                </div>
              );
            })}
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="submit" className="w-full sm:w-auto" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">{t("admin.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {t("admin.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && remove.mutate(toDelete.id)}>
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
