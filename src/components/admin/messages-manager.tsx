import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import type { Message } from "@/data/types";

export function MessagesManager() {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["admin", "messages"] });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").update({ read: true } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("admin.messages.deleted"));
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section>
      <h1 className="mb-6 text-xl font-semibold sm:text-2xl">{t("admin.messages")}</h1>
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {(error as Error).message}
        </p>
      ) : !data || data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {t("admin.messages.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border bg-card p-4 data-[unread=true]:border-primary/50"
              data-unread={!m.read}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium">
                    {m.name} <span className="text-muted-foreground">· {m.email}</span>
                  </p>
                  {m.subject ? <p className="text-sm text-primary">{m.subject}</p> : null}
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {!m.read ? (
                    <Button size="sm" variant="outline" onClick={() => markRead.mutate(m.id)}>
                      <Check className="h-4 w-4" /> {t("admin.messages.read")}
                    </Button>
                  ) : null}
                  <Button size="sm" variant="destructive" onClick={() => remove.mutate(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
