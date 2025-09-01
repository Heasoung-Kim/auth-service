export async function upsertAccountFromClaims(claims: any): Promise<string> {
  const accountId = String(claims.sub);
  const email = claims.email as string | undefined;
  const companyCode = (claims.company_code ?? claims.ten) as string | undefined;
  const role = Array.isArray(claims.roles) ? claims.roles[0] : (claims.role as string | undefined);

  // 예시 upsert (pseudo)
  // await db.q`INSERT INTO common_identity.account(id, email, company_code, role, last_login_at)
  // VALUES (${accountId}, ${email}, ${companyCode}, ${role}, now())
  // ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, company_code=EXCLUDED.company_code,
  // role=EXCLUDED.role, last_login_at=now()`;

  return accountId;
}
