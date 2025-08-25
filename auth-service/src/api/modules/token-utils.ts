import { jwtDecode } from "jwt-decode";

// in-memory access token (새로고침 시 sessionStorage로만 임시 복구)
let accessToken: string | null = null;
const KEY = "ACCESS_TOKEN_TMP";

export const getAccessToken = () => accessToken;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const saveForReload = () => {
  if (typeof window === "undefined") return;
  if (accessToken) sessionStorage.setItem(KEY, accessToken);
  else sessionStorage.removeItem(KEY);
};
export const restoreAfterReload = () => {
  if (typeof window === "undefined") return;
  const t = sessionStorage.getItem(KEY);
  if (t) accessToken = t;
};
export const removeToken = () => {
  accessToken = null;
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
};
export function isAccessValid(token?: string | null) {
  const t = token ?? accessToken;
  if (!t) return false;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(t);
    return !exp || Date.now() < exp * 1000;
  } catch { return false; }
}
export const isLoggedIn = () => isAccessValid();
