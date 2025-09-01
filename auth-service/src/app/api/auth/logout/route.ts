export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getGatewayHash, compare, deleteRefresh } from "@/lib/refresh-store";

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

  if (rt && rtid) {
    const gw = await getGatewayHash(rtid);
    if (gw && await compare(rt, gw.token_hash)) {
      await deleteRefresh(rtid);
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(RT,   "", withDomain({ maxAge: 0 }));
  res.cookies.set(RTID, "", withDomain({ maxAge: 0 }));
  return res;
}
