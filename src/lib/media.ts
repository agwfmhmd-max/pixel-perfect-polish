import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const MEDIA_BUCKET = "media";

export type MediaAsset = {
  id: string;
  name: string;
  path: string;
  url: string;
  mime_type: string | null;
  size: number | null;
  alt_en: string | null;
  alt_fr: string | null;
  alt_ar: string | null;
  created_at: string;
};

/** All images stored in the Supabase media library, newest first. */
export function useMediaAssets() {
  return useQuery({
    queryKey: ["media_assets"],
    queryFn: async (): Promise<MediaAsset[]> => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaAsset[];
    },
  });
}

function safeName(name: string) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  return cleaned || "image";
}

/** Upload a file to Supabase Storage and register it in `media_assets`. */
export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<MediaAsset> => {
      const path = `${new Date().getFullYear()}/${Date.now()}-${safeName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      const row = {
        name: file.name,
        path,
        url: pub.publicUrl,
        mime_type: file.type || null,
        size: file.size,
      };
      const { data, error } = await supabase
        .from("media_assets")
        .insert(row as never)
        .select("*")
        .single();
      if (error) throw error;
      return data as MediaAsset;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["media_assets"] });
    },
  });
}

/** Remove a file from storage and from the media library table. */
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asset: MediaAsset) => {
      const { error: storageError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .remove([asset.path]);
      if (storageError) throw storageError;
      const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["media_assets"] });
    },
  });
}
