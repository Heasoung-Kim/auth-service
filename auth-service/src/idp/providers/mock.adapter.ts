import { IdPAdapter, NormalizedClaims } from '../idp.adapter';

const b64u = (s: string) => Buffer.from(s).toString('base64url');
export const makeDevToken = (p: Record<string, any>) =>
  `${b64u(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${b64u(JSON.stringify(p))}.`;

export class MockIdP implements IdPAdapter {
  async verifyAndMap(token: string): Promise<NormalizedClaims> {
    let payload: any = {};
    try {
      payload = token.includes('.') ? JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
        : JSON.parse(token);
    } catch { /* ignore */ }

    const account_id   = String(payload.sub ?? payload.account_id ?? 'demo_user');
    const company_id   = payload.company_id ?? null;
    const company_code = payload.company_code ?? null;
    const role         = String(payload.role ?? (payload.roles?.[0] ?? 'USER')).toUpperCase();

    if (!account_id || (!company_id && !company_code)) {
      throw new Error('invalid dev token: need account_id & (company_id|company_code)');
    }
    return { account_id, company_id, company_code, roles: [role], email: payload.email, exp: payload.exp };
  }
}
