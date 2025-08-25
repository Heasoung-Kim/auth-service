import { NextRequest, NextResponse } from "next/server";
import { signAccessToken } from "@/lib/jwt";
import { findValidRefresh, match, issueRawRefresh, saveRefreshHash, revokeByHash } from "@/lib/refresh-store";

export const runtime = "nodejs";
const RT = "rt";

export async function POST(req: NextRequest) {
  const tenant = req.headers.get("x-tenant-id") ?? "default";
  const cookie = req.cookies.get(RT)?.value;
  if (!cookie) return NextResponse.json({ message: "no cookie" }, { status: 401 });

  // TODO: acc/jti 저장 방식에 맞춰 조회
  const rec = await findValidRefresh("<<acc>>", tenant);
  if (!rec || rec.revoked) return NextResponse.json({ message: "invalid" }, { status: 401 });
  if (!(await match(cookie, rec.rt_hash))) return NextResponse.json({ message: "invalid" }, { status: 401 });

  await revokeByHash(rec.rt_hash);
  const { raw, hash } = await issueRawRefresh();
  await saveRefreshHash({ jti: crypto.randomUUID(), acc: rec.acc, tenant, rt_hash: hash });

  const access = await signAccessToken(rec.acc, ["USER"], tenant);
  const res = NextResponse.json({ access_token: access });
  res.cookies.set(RT, raw, {
    httpOnly: true, secure: true, sameSite: "strict", path: "/",
    maxAge: 60 * 60 * 24 * 14,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})
  });
  return res;
}
