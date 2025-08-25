// src/api/apis/authApi.ts
import { setAccessToken, removeToken, saveForReload } from "@api/modules/token-utils";
import { apiFetch } from "@api/modules/request";

export async function login(username: string, password: string) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("로그인 실패");
  const j = await res.json();
  setAccessToken(j.access_token || j.accessToken || null);
  saveForReload();
  return j;
}

export async function logout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    removeToken();
  }
}
