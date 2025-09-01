export const RT   = "rt";    // refresh token 값
export const RTID = "rtid";  // refresh 식별자(id)
/** @deprecated 외부 토큰 모드에서는 쿠키 RT/RTID 사용 안 함. 재활성 시 플래그로 분기해서 사용. */
export const RT_COOKIE_NAME = 'rt';
/** @deprecated */
export const RTID_COOKIE_NAME = 'rtid';
/** @deprecated */
//export function cookieOpts() { /* 기존 로직 보관 */ }

/** 모든 쿠키에 공통으로 적용할 보안 옵션 */
const base = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
};

/** 쿠키 옵션 헬퍼: 운영에선 COOKIE_DOMAIN 자동 추가 */
/**
export function cookieOpts(overrides: Partial<typeof base & { maxAge?: number }> = {}) {
  return {
    ...base,
    ...overrides,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}
*/
