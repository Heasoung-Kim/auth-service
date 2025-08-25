"use client";

import { getAccessToken, setAccessToken } from "./auth";
import { getTenantId } from "./tenant";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];

async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // HttpOnly refresh 쿠키 전송
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data?.access_token || data?.accessToken;
    setAccessToken(newToken ?? null);
    return newToken ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  const tenant = getTenantId();
  const headers = new Headers(init.headers);

  // Bearer 토큰(있으면)
  const at = getAccessToken();
  if (at) headers.set("Authorization", `Bearer ${at}`);

  // 멀티테넌트 헤더
  if (tenant) headers.set("X-Tenant-Id", tenant);

  // CORS/쿠키
  const cfg: RequestInit = {
    ...init,
    headers,
    credentials: "include", // 필요 시 쿠키 전송
  };

  const res = await fetch(`${BASE}${input}`, cfg);
  if (res.status !== 401) return res;

  // 401 처리: 토큰 재발급 큐
  if (!refreshing) {
    refreshing = true;
    const newTok = await refreshToken();
    refreshing = false;
    waiters.forEach(fn => fn(newTok));
    waiters = [];
  } else {
    await new Promise<void>(resolve => waiters.push(() => resolve()));
  }

  const newToken = getAccessToken();
  if (!newToken) return res; // 재발급 실패 → 그대로 401 전달

  // 재시도(Authorization 갱신)
  headers.set("Authorization", `Bearer ${newToken}`);
  return fetch(`${BASE}${input}`, { ...cfg, headers });
}
