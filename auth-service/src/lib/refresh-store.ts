import { randomUUID, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export type RefreshRecord = { id: string; acc: string; tenant: string; rt_hash: string; revoked: boolean; created_at: Date };

export async function issueRawRefresh(): Promise<{ raw: string; hash: string; jti: string }> {
  const raw = randomBytes(48).toString("base64url"); // 쿠키값
  const hash = await bcrypt.hash(raw, 10);
  const jti = randomUUID();
  return { raw, hash, jti };
}

// 아래 4개는 DB 연동해서 채우기
export async function saveRefreshHash(rec: { jti: string; acc: string; tenant: string; rt_hash: string }) { /* INSERT */ }
export async function findValidRefresh(acc: string, tenant: string): Promise<RefreshRecord | null> { /* SELECT latest */ return null; }
export async function revokeByHash(rt_hash: string) { /* UPDATE revoked=true WHERE rt_hash=... */ }
export async function match(raw: string, hashed: string) { return bcrypt.compare(raw, hashed); }
