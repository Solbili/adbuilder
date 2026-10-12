import type { PhotoRow } from "./spec";

export function photoUrl(filePath: string | undefined | null) {
  if (!filePath) return undefined;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${filePath.split("/").map(encodeURIComponent).join("/")}`;
}

export function photoFor(photos: PhotoRow[], id: string) {
  return photos.find((p) => p.id === id);
}
