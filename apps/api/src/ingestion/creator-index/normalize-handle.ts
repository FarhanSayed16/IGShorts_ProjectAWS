const HANDLE = /^[a-z0-9._]{1,30}$/;

export interface HandleParse {
  username: string;
  valid: boolean;
  reason: string | null;
}

/**
 * Exact-handle normalization for open datasets.
 * A space is invalid. It is not removed, because that would invent a handle.
 */
export function parseHandle(value: unknown): HandleParse {
  let text = String(value ?? '').trim();
  text = text.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  text = text.split('?')[0]?.split('#')[0] ?? '';
  text = text.replace(/^\/+|\/+$/g, '').replace(/^@+/, '').trim().toLowerCase();

  if (!text) return { username: '', valid: false, reason: 'empty' };
  if (/\s/.test(text) || text.includes('/')) {
    return { username: '', valid: false, reason: 'malformed' };
  }
  if (!HANDLE.test(text)) return { username: '', valid: false, reason: 'malformed' };
  return { username: text, valid: true, reason: null };
}
