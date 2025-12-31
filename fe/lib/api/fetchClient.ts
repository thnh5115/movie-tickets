const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function request(path: string, opts: RequestInit = {}, userId?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (userId) headers['X-User-Id'] = userId;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();

  if (!res.ok) {
    let message = text;
    try {
      const j = JSON.parse(text);
      message = j?.error?.message ?? j?.message ?? text;
    } catch {}
    throw new Error(message || res.statusText);
  }

  if (!text) return null;

  try {
    const j = JSON.parse(text);
    return j?.data ?? j;
  } catch {
    return text;
  }
}

export default { request };
