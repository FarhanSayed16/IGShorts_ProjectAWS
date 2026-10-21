/** Strip tracking query params. Do not rewrite Wikimedia pixel sizes — those thumbs 404. */
export function portraitUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  return src.split('?')[0];
}
