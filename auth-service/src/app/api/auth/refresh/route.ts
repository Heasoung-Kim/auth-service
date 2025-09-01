export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { signAccessToken } from "@/lib/jwt";
import {
  getGatewayHash, compare, getSnapshot, rotateRefresh
} from "@/lib/refresh-store";

const RT = "rt";
const RTID = "rtid";
const cookieBase = { httpOnly: true, secure: true, sameSite: "strict", path: "/" } as const;
const withDomain = (opts: any = {}) => ({
  ...cookieBase,
  ...opts,
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
});

export async function POST(req: NextRequest) {
  const rt   = req.cookies.get(RT)?.value;
  const rtid = req.cookies.get(RTID)?.value;
  const tenant = req.headers.get("x-tenant-id") ?? undefined;

  if (!rt || !rtid) return NextResponse.json({ message: "no cookie" }, { status: 401 });

  // 해시 검증
  const gw = await getGatewayHash(rtid);
  if (!gw || !(await compare(rt, gw.token_hash))) {
    return NextResponse.json({ message: "invalid" }, { status: 401 });
  }

  // 스냅샷에서 계정/테넌트 정보 조회
  const snap = await getSnapshot(rtid);
  if (!snap) return NextResponse.json({ message: "invalid" }, { status: 401 });

  // 테넌트 헤더와 스냅샷의 회사코드가 다르면 거부(멀티테넌트 안전장치)
  if (tenant && snap.cd && tenant !== snap.cd) {
    return NextResponse.json({ message: "tenant mismatch" }, { status: 403 });
  }

  // refresh 회전(토큰 값만 교체, id는 유지) + access 재발급
  const { raw: newRt } = await rotateRefresh(rtid);
  const access = await signAccessToken(snap.acc, snap.role ? [snap.role] : [], snap.cd);

  const res = NextResponse.json({ access_token: access });
  res.cookies.set(RT,   newRt, withDomain({ maxAge: 60 * 60 * 24 * 14 }));
  res.cookies.set(RTID, rtid,  withDomain({ maxAge: 60 * 60 * 24 * 14 }));
  return res;
}
