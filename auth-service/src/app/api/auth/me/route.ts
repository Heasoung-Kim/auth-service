export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyAccess } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return NextResponse.json({ message: "no token" }, { status: 401 });
  try {
    const claims = await verifyAccess(auth.slice(7));
    const tenant = req.headers.get("x-tenant-id") ?? undefined;
    if (tenant && claims.ten && tenant !== claims.ten) {
      return NextResponse.json({ message: "tenant mismatch" }, { status: 403 });
    }
    return NextResponse.json({ ok: true, claims });
  } catch {
    return NextResponse.json({ message: "invalid" }, { status: 401 });
  }
}
