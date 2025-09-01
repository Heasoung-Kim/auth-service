import { IdPAdapter, NormalizedClaims } from '../idp.adapter';
import * as jose from 'jose';

export class RemoteJwtIdP implements IdPAdapter {
  private keyMode = (process.env.IDP_KEY_MODE || 'SPKI').toUpperCase(); // SPKI|JWKS
  private keyUrl  = process.env.IDP_KEY_URL!;
  private keyAuth = (process.env.IDP_KEY_AUTH || 'none').toLowerCase(); // none|external-bearer|static
  private keyAuthValue = process.env.IDP_KEY_AUTH_VALUE || '';

  private async fetchKey(externalToken: string) {
    const headers: Record<string, string> = {};
    if (this.keyAuth === 'external-bearer') headers.Authorization = `Bearer ${externalToken}`;
    if (this.keyAuth === 'static' && this.keyAuthValue) headers.Authorization = this.keyAuthValue;

    const res = await fetch(this.keyUrl, { headers });
    if (!res.ok) throw new Error(`key endpoint ${res.status}`);
    if (this.keyMode === 'JWKS') return res.json();
    return res.text(); // SPKI/PEM
  }

  async verifyAndMap(token: string): Promise<NormalizedClaims> {
    // 1) 키 취득
    const keyResp = await this.fetchKey(token);

    // 2) 검증
    let payload: any;
    if (this.keyMode === 'JWKS') {
      const jwks = jose.createRemoteJWKSet(new URL(this.keyUrl)); // (헤더 포함을 원하면 위 fetchKey를 응용)
      ({ payload } = await jose.jwtVerify(token, jwks));
    } else {
      const spki = typeof keyResp === 'string' ? keyResp : String(keyResp);
      const key  = await jose.importSPKI(spki, 'RS256');
      ({ payload } = await jose.jwtVerify(token, key));
    }

    // 3) 중립 스키마로 매핑 (키명은 환경에 따라 조정)
    const account_id   = String(payload.sub ?? payload.account_id);
    const company_id   = payload.company_id ?? null;
    const company_code = payload.company_code ?? null;
    const roles: string[] =
      Array.isArray(payload.roles) ? payload.roles.map(String)
        : [String(payload.role ?? 'USER')];

    if (!account_id || (!company_id && !company_code)) {
      throw new Error('invalid external claims');
    }
    return { account_id, company_id, company_code, roles, email: payload.email, exp: payload.exp };
  }
}
