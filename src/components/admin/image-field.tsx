import { useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { MediaPicker } from "./media-picker";

/**
 * Image field backed by the Supabase media library.
 * The admin picks an existing image from the gallery (or uploads one inside the picker),
 * so no URL has to be typed by hand.
 */
export function ImageField({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2" id={id}>
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          <img src={value} alt="" loading="lazy" className="h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
          <ImageIcon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <ImageIcon className="h-4 w-4" />
          {value ? t("admin.media.change") : t("admin.media.choose")}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
            {t("admin.media.remove")}
          </Button>
        ) : null}
      </div>

      <MediaPicker open={open} onOpenChange={setOpen} value={value} onSelect={onChange} />
    </div>
  );
}
