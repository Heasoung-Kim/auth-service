import { NextRequest, NextResponse } from "next/server";
import { findValidRefresh, match, revokeByHash } from "@/lib/refresh-store";

export const runtime = "nodejs";
const RT = "rt";

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(RT)?.value;
  if (cookie) {
    const rec = await findValidRefresh("<<acc>>","<<tenant>>"); // 구현에 맞게
    if (rec && await match(cookie, rec.rt_hash)) await revokeByHash(rec.rt_hash);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(RT, "", { path: "/", maxAge: 0, ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}) });
  return res;
}
