import { useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useDeleteMedia, useMediaAssets, useUploadMedia, type MediaAsset } from "@/lib/media";

/** Grid of every image in the Supabase media library. */
function MediaGrid({
  selectedUrl,
  onSelect,
  onDelete,
}: {
  selectedUrl?: string | undefined;
  onSelect?: ((asset: MediaAsset) => void) | undefined;
  onDelete?: ((asset: MediaAsset) => void) | undefined;
}) {
  const { t } = useI18n();
  const { data, isLoading, error } = useMediaAssets();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
        {(error as Error).message}
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {t("admin.media.empty")}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {data.map((asset) => {
        const active = selectedUrl === asset.url;
        return (
          <li key={asset.id} className="group relative">
            <button
              type="button"
              onClick={() => onSelect?.(asset)}
              className={cn(
                "block w-full overflow-hidden rounded-xl border bg-card transition-all",
                active ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/40",
              )}
            >
              <img
                src={asset.url}
                alt={asset.alt_en ?? asset.name}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <span className="block truncate px-2 py-1.5 text-start text-xs text-muted-foreground">
                {asset.name}
              </span>
              {active ? (
                <span className="absolute top-2 end-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </button>
            <div className="absolute bottom-9 end-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-7 w-7"
                aria-label={t("admin.media.copy")}
                onClick={() => {
                  void navigator.clipboard.writeText(asset.url);
                  toast.success(t("admin.media.copied"));
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {onDelete ? (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7"
                  aria-label={t("admin.delete")}
                  onClick={() => onDelete(asset)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Upload button that pushes a file into Supabase Storage. */
function UploadButton({ onUploaded }: { onUploaded?: ((asset: MediaAsset) => void) | undefined }) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          upload.mutate(file, {
            onSuccess: (asset) => {
              toast.success(t("admin.saved"));
              onUploaded?.(asset);
            },
            onError: (err: Error) => toast.error(err.message),
          });
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {t("admin.media.uploading")}
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" /> {t("admin.media.upload")}
          </>
        )}
      </Button>
    </>
  );
}

/** Dialog used by image fields: pick an existing image, or upload a new one. */
export function MediaPicker({
  open,
  onOpenChange,
  value,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value?: string | undefined;
  onSelect: (url: string) => void;
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string | undefined>(value);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) setSelected(value);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("admin.media.pick")}</DialogTitle>
        </DialogHeader>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t("admin.media.hint")}</p>
          <UploadButton onUploaded={(asset) => setSelected(asset.url)} />
        </div>
        <MediaGrid selectedUrl={selected} onSelect={(a) => setSelected(a.url)} />
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (selected) onSelect(selected);
              onOpenChange(false);
            }}
          >
            {t("admin.media.select")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Full media library section of the dashboard. */
export function MediaManager() {
  const { t } = useI18n();
  const [toDelete, setToDelete] = useState<MediaAsset | null>(null);
  const remove = useDeleteMedia();

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.media")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.media.hint")}</p>
        </div>
        <UploadButton />
      </div>

      <MediaGrid onDelete={setToDelete} />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.deleteWarning")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!toDelete) return;
                remove.mutate(toDelete, {
                  onSuccess: () => {
                    toast.success(t("admin.media.deleted"));
                    setToDelete(null);
                  },
                  onError: (e: Error) => toast.error(e.message),
                });
              }}
            >
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
