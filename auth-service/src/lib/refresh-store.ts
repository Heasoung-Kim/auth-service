import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { q, SCHEMA } from "./db";

const REFRESH_TTL_SEC = +(process.env.REFRESH_TTL_SEC ?? 60 * 60 * 24 * 14); // 14d

export function nowSec() { return Math.floor(Date.now()/1000); }

export async function issueRawRefresh() {
  const raw = randomBytes(48).toString("base64url");
  const hash = await bcrypt.hash(raw, 10);
  const rtid = randomUUID();
  const exp = nowSec() + REFRESH_TTL_SEC;
  return { raw, hash, rtid, exp };
}

// 최초 발급(또는 교체) 시 DB 반영
export async function persistRefresh(rtid: string, tokenHash: string) {
  await q(
    `insert into ${SCHEMA}.gateway_credential (id, token_hash)
     values ($1, $2)
     on conflict (id) do update set token_hash = excluded.token_hash, updated_at = now()`,
    [rtid, tokenHash]
  );
}

export async function putTokenSnapshot(rtid: string, {
  acc, cId, cd, role, exp
}: { acc: string; cId: string | null; cd: string; role: string | null; exp: number }) {
  await q(
    `insert into ${SCHEMA}.token_snapshot (id, alg, acc, "cId", cd, ad, "role", "exp")
     values ($1, 'RS256', $2, $3, $4, $5, $6, $7)
     on conflict (id) do update set "exp"=$7`,
    [rtid, acc, cId, cd, nowSec(), role, exp]
  );
}

export async function getGatewayHash(rtid: string) {
  const rows = await q<{ id: string; token_hash: string }>(
    `select id, token_hash from ${SCHEMA}.gateway_credential where id=$1`,
    [rtid]
  );
  return rows[0] ?? null;
}

export async function rotateRefresh(rtid: string) {
  const { raw, hash, exp } = await (async () => {
    const raw = randomBytes(48).toString("base64url");
    const hash = await bcrypt.hash(raw, 10);
    const exp = nowSec() + REFRESH_TTL_SEC;
    return { raw, hash, exp };
  })();
  await q(
    `update ${SCHEMA}.gateway_credential set token_hash=$2, updated_at=now() where id=$1`,
    [rtid, hash]
  );
  await q(
    `update ${SCHEMA}.token_snapshot set "exp"=$2 where id=$1`,
    [rtid, exp]
  );
  return { raw, exp };
}

export async function deleteRefresh(rtid: string) {
  await q(`delete from ${SCHEMA}.gateway_credential where id=$1`, [rtid]);
  await q(`delete from ${SCHEMA}.token_snapshot where id=$1`, [rtid]);
}

export async function compare(raw: string, hash: string) {
  return bcrypt.compare(raw, hash);
}

export async function getSnapshot(rtid: string) {
  const rows = await q<{ id: string; acc: string; cId: string|null; cd: string; role: string|null; exp: number }>(
    `select id, acc, "cId", cd, "role", "exp" from ${SCHEMA}.token_snapshot where id=$1`,
    [rtid]
  );
  return rows[0] ?? null;
}


/** 외부 토큰 메타 스냅샷만 유지 */
export async function saveTokenSnapshot(snap: {
  sub: string; ten?: string; roles?: string[]; iss: string; aud?: string; exp?: number;
}) {
  // 기존 INSERT ... ON CONFLICT 로직 보관/사용
}
