import { NextResponse } from "next/server";
import { publicJwk } from "@/lib/jwt";
export async function GET() {
  return NextResponse.json(await publicJwk(), { headers: { "Cache-Control": "public, max-age=300" } });
}
