import { getAccessToken, setAccessToken } from "./token-utils";
import { getTenantId } from "@lib/tenant";

const BASE = process.env.VITE_API_URL!; // = Kong 도메인
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];

async function refreshToken(): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // HttpOnly refresh 쿠키 전송
      headers: { "X-Tenant-Id": getTenantId() },
    });
    if (!r.ok) return null;
    const j = await r.json();
    const t = j.access_token ?? j.accessToken ?? null;
    setAccessToken(t);
    return t;
  } catch { return null; }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const at = getAccessToken();
  if (at) headers.set("Authorization", `Bearer ${at}`);
  headers.set("X-Tenant-Id", getTenantId());

  const cfg: RequestInit = { ...init, headers, credentials: "include" };
  const res = await fetch(`${BASE}${path}`, cfg);
  if (res.status !== 401) return res;

  // 401 처리(큐잉)
  if (!refreshing) {
    refreshing = true;
    const t = await refreshToken();
    refreshing = false;
    waiters.forEach(w => w(t)); waiters = [];
  } else {
    await new Promise<void>(resolve => waiters.push(() => resolve()));
  }
  const nt = getAccessToken();
  if (!nt) return res; // 재발급 실패 → 그대로 401

  headers.set("Authorization", `Bearer ${nt}`);
  return fetch(`${BASE}${path}`, { ...cfg, headers });
}
