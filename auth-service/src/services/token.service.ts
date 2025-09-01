import { Injectable, OnModuleInit } from '@nestjs/common';
import { FLAGS } from '../config/flags';
import { verifyExternalToken } from '@lib/jwt';
import { SignJWT, jwtVerify, type KeyLike } from 'jose';
import { createPrivateKey, createPublicKey, type KeyObject } from 'crypto';
import { readFileSync } from 'fs';
import { upsertAccountFromClaims } from './account.service';
import { saveTokenSnapshot } from '@lib/refresh-store';

function readPem(): string {
  const f = process.env.PRIVATE_KEY_FILE;
  if (f) return readFileSync(f, 'utf8');
  const raw = process.env.PRIVATE_KEY_PEM || '';
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
}

@Injectable()
export class TokenService implements OnModuleInit {
  private priv!: KeyObject;
  private pub!: KeyObject;
  private kid = process.env.JWKS_KID ?? 'auth-service-key-1';
  private iss = 'auth-service';
  private aud = 'aicc';

  async loginWithExternalBearer(bearer: string, tenant?: string) {
    const token = bearer.replace(/^Bearer\s+/i, '');
    const { claims } = await verifyExternalToken(token);
    if (tenant && claims.ten && tenant !== claims.ten) {
      throw new Error('TENANT_MISMATCH');
    }
    const accountId = await upsertAccountFromClaims(claims);
    await saveTokenSnapshot({
      sub: String(claims.sub),
      ten: (claims as any).ten,
      roles: (claims as any).roles,
      iss: String(claims.iss),
      aud: (claims as any).aud,
      exp: typeof claims.exp === 'number' ? claims.exp : undefined,
    });
    return { ok: true, accountId, claims };
  }

  async onModuleInit() {
    const pem = readPem();
    if (!pem) throw new Error('PRIVATE_KEY_PEM or PRIVATE_KEY_FILE is missing');
    this.priv = createPrivateKey({ key: pem, format: 'pem', passphrase: process.env.PRIVATE_KEY_PASSPHRASE });
    this.pub  = createPublicKey(this.priv);
  }

  /** 외부(ECP) 토큰 → 내부 클레임 매핑 (필요 시 실제 검증으로 교체) */
  async verifyAndMapExternal(externalToken: string) {
    // 1) (선택) 외부 토큰이 JWT이면 payload를 파싱해서 사용
    let ext: any = {};
    try {
      if (externalToken.includes('.')) {
        const p = externalToken.split('.')[1];
        ext = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
      }
    } catch { /* dev 환경이면 무시 */ }

    // 2) 키 매핑 (가능한 모든 후보 키를 커버)
    const pick = <T=string>(...keys: string[]): T | undefined =>
      keys.map(k => ext?.[k]).find(v => v !== undefined && v !== null);

    const accountId   = pick<string>('account_id','usrId','userId','uid','sub','loginId','login_id');
    const companyCode = pick<string>('company_code','companyCode','Cd','cd','corpCode');
    const companyId   = pick<string>('company_id','companyId','clId','clientId','cid','corpId');
    let role          = pick<string>('role','roleName','role_code','roleCode') ?? (Array.isArray(ext?.roles) ? ext.roles[0] : undefined);

    // 3) 정규화/검증
    const norm = (s?: string) => (typeof s === 'string' ? s.trim() : undefined);
    const claims = {
      account_id: norm(accountId)!,
      company_code: norm(companyCode) ?? null,
      company_id: norm(companyId) ?? null,
      role: norm(role)?.toUpperCase() ?? 'USER',
    };

    if (!claims.account_id) throw new Error('account_id missing from external token');
    if (!claims.company_code && !claims.company_id) throw new Error('company_code or company_id is required');

    return claims;
  }

  /** access (15m) */
  private async issueAccess(claims: Record<string, any>) {
    return new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: this.kid })
      .setIssuer(this.iss)
      .setAudience(this.aud)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(this.priv as unknown as KeyLike);
  }

  /** refresh (7d) */
  private async issueRefresh(claims: Record<string, any>) {
    return new SignJWT({ ...claims, tok: 'refresh' })
      .setProtectedHeader({ alg: 'RS256', kid: this.kid })
      .setIssuer(this.iss)
      .setAudience(this.aud)
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(this.priv as unknown as KeyLike);
  }

  /** access+refresh 동시 발급 */
  async issuePair(claims: Record<string, any>) {
    const [access, refresh] = await Promise.all([this.issueAccess(claims), this.issueRefresh(claims)]);
    return { access_token: access, refresh_token: refresh, token_type: 'Bearer', expires_in: 900 };
  }

  /** refresh → 새 access */
  async refresh(refreshToken: string) {
    const { payload } = await jwtVerify(refreshToken, this.pub as unknown as KeyLike, {
      issuer: this.iss, audience: this.aud,
    });
    if (payload.tok !== 'refresh') throw new Error('invalid refresh token');
    const { tok, iat, exp, nbf, ...claims } = payload as any;
    const access = await this.issueAccess(claims);
    return { access_token: access, token_type: 'Bearer', expires_in: 900 };
  }

  private asAccessPayload(base: Record<string, any>) {
    return {
      sub: String(base.account_id),
      account_id: String(base.account_id),
      company_code: base.company_code ?? null,
      company_id: base.company_id ?? null,
      role: String(base.role ?? 'USER'),
    };
  }
/**
  private async issueAccess(claims: Record<string, any>) {
    const payload = this.asAccessPayload(claims);
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', kid: this.kid })
      .setIssuer(this.iss).setAudience(this.aud)
      .setIssuedAt().setExpirationTime('15m')
      .sign(this.priv as unknown as KeyLike);
  }

  private async issueRefresh(claims: Record<string, any>) {
    const payload = { ...this.asAccessPayload(claims), tok: 'refresh' };
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', kid: this.kid })
      .setIssuer(this.iss).setAudience(this.aud)
      .setIssuedAt().setExpirationTime('7d')
      .sign(this.priv as unknown as KeyLike);
  }
*/
  /** @deprecated 내부 액세스 토큰 발급(보관용). 플래그가 true일 때만 호출해서 쓸 것. */
  async issueInternalJwt(/* ... */) {
    if (!FLAGS.INTERNAL_ISSUER_ENABLED) {
      throw new Error('INTERNAL_ISSUER_DISABLED');
    }
    // 기존 로직 그대로 보관
  }

  /** @deprecated 내부 리프레시 회전(보관용). 플래그가 true일 때만 호출해서 쓸 것. */
  async rotateRefresh(/* ... */) {
    if (!FLAGS.REFRESH_ENABLED) {
      throw new Error('REFRESH_DISABLED');
    }
    // 기존 로직 그대로 보관
  }
}
