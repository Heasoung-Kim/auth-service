export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { q, SCHEMA } from "@/lib/db";
import { signAccessToken } from "@/lib/jwt";
import {
  issueRawRefresh, persistRefresh, putTokenSnapshot
} from "@/lib/refresh-store";

const RT = "rt";
const RTID = "rtid";
const cookieBase = { httpOnly: true, secure: true, sameSite: "strict", path: "/" } as const;
const withDomain = (opts: any = {}) => ({
  ...cookieBase,
  ...opts,
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
});

type LoginBody = {
  accountId: string;          // common_identity.account.id
  companyCode?: string;       // 테넌트 코드(권장)
  companyId?: string;         // 또는 회사 ID
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as LoginBody;
  const tenantHeader = req.headers.get("x-tenant-id") ?? undefined;
  const accountId = body.accountId?.trim();
  if (!accountId) return NextResponse.json({ message: "accountId required" }, { status: 400 });

  // 계정 조회
  const acc = (await q<{ id: string; company_id: string|null; company_code: string|null; role: string|null }>(
    `select id, company_id, company_code, "role"
       from ${SCHEMA}.account
      where id=$1 and is_deleted=false`,
    [accountId]
  ))[0];
  if (!acc) return NextResponse.json({ message: "account not found" }, { status: 404 });

  // 테넌트 결정 (우선순위: body.companyCode > account.company_code > body.companyId→company.code > header)
  let cd = body.companyCode ?? acc.company_code ?? "";
  let cId = acc.company_id ?? body.companyId ?? null;

  if (!cd && cId) {
    const comp = (await q<{ code: string }>(
      `select code from ${SCHEMA}.company where id=$1`,
      [cId]
    ))[0];
    if (comp) cd = comp.code;
  }
  if (!cd && tenantHeader) cd = tenantHeader;
  if (!cd) return NextResponse.json({ message: "companyCode required" }, { status: 400 });

  // 역할(스키마 상 user_role에 role_id가 없어서 account.role 사용)
  const roles = acc.role ? [acc.role] : [];

  // access 발급
  const access = await signAccessToken(acc.id, roles, cd);

  // refresh 발급 & 저장 (gateway_credential + token_snapshot)
  const { raw, hash, rtid, exp } = await issueRawRefresh();
  await persistRefresh(rtid, hash);
  await putTokenSnapshot(rtid, { acc: acc.id, cId, cd, role: acc.role ?? null, exp });

  // 마지막 로그인 타임 기록(선택)
  await q(`update ${SCHEMA}.account set last_login_at=now() where id=$1`, [acc.id]);

  const res = NextResponse.json({ access_token: access });
  res.cookies.set(RT,   raw,  withDomain({ maxAge: 60 * 60 * 24 * 14 }));
  res.cookies.set(RTID, rtid, withDomain({ maxAge: 60 * 60 * 24 * 14 }));
  return res;
}
