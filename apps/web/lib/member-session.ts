const TOKEN_KEY = 'igshorts.memberToken';

export function readMemberToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function writeMemberToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
  window.dispatchEvent(new Event('igshorts-member'));
}

export async function memberFetch(path: string, init: RequestInit = {}) {
  const token = readMemberToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`/api/v1${path}`, { ...init, headers });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw new Error('The account service is not available right now.');
    }
  }
  if (!response.ok) {
    const raw =
      data && typeof data === 'object' && 'message' in data
        ? (data as { message: unknown }).message
        : 'Request failed';
    const message = Array.isArray(raw) ? raw.join(' ') : String(raw);
    throw new Error(message);
  }
  return data;
}
