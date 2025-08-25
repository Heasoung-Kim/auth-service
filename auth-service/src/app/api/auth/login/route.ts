import { NextRequest, NextResponse } from "next/server";
import { signAccessToken } from "@/lib/jwt";
import { issueRawRefresh, saveRefreshHash } from "@/lib/refresh-store";

export const runtime = "nodejs";
const RT = "rt";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const tenant = req.headers.get("x-tenant-id") ?? "default";

  // TODO: 실제 사용자 검증 + roles 조합
  if (!username || !password) return NextResponse.json({ message: "invalid" }, { status: 401 });
  const roles = ["USER"];

  const access = await signAccessToken(username, roles, tenant);
  const { raw, hash } = await issueRawRefresh();
  await saveRefreshHash({ jti: crypto.randomUUID(), acc: username, tenant, rt_hash: hash });

  const res = NextResponse.json({ access_token: access });
  res.cookies.set(RT, raw, {
    httpOnly: true, secure: true, sameSite: "strict", path: "/",
    maxAge: 60 * 60 * 24 * 14,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})
  });
  return res;
}
