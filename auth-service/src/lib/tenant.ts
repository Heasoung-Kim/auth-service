"use client";

const KEY = "tenantId";

export function getTenantId() {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_DEFAULT_TENANT!;
  return localStorage.getItem(KEY) || process.env.NEXT_PUBLIC_DEFAULT_TENANT!;
}
export function setTenantId(tid: string) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, tid);
}
