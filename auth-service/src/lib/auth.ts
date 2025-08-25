"use client";

let accessToken: string | null = null; // 새로고침 전용 in-memory
export const getAccessToken = () => accessToken;
export const setAccessToken = (t: string | null) => { accessToken = t; };

// 쿠키 읽기(클라이언트) – refresh는 HttpOnly라 프론트에서 못 읽음(의도된 보안)
export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
};
