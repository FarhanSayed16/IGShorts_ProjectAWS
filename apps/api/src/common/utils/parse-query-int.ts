/** Parse a query string into a finite integer, or fall back when missing/invalid. */
export function parseQueryInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
