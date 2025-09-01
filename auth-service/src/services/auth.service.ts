import { Injectable, BadGatewayException } from '@nestjs/common';

type IssueTokenBody =
  | { mode: 'claims'; payload: Record<string, any>; ttlSec?: number }
  | { mode: 'random'; tenant?: string; roles?: string[]; ttlSec?: number; seed?: string };

@Injectable()
export class AuthService {
  // 둘 중 하나로 설정해도 동작
  private readonly url =
    process.env.IDP_TOKEN_URL || process.env.IDP_MOCK_TOKEN_URL;

  /**
   * idp-mock에 요청해 토큰 발급
   * idp-mock 응답: { token: "<JWT>" }
   * 반환: { access_token, token_type, expires_in, claims }
   */
  async issueMockTokenViaIdpMock(body: IssueTokenBody | any) {
    if (!this.url) throw new BadGatewayException('IDP_TOKEN_URL not configured');

    const resp = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new BadGatewayException(`mock token endpoint error ${resp.status}: ${text}`);
    }

    // idp-mock은 { token: "..." } 형식
    const data: any = await resp.json();

    const access_token = data?.token;
    if (!access_token) {
      throw new BadGatewayException('mock token endpoint returned no token field');
    }

    const ttl = (body && (body as any).ttlSec) ? Number((body as any).ttlSec) : null;

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: ttl,
      // 개발 편의를 위해, claims는 요청 payload를 그대로 되돌려줌(랜덤 모드는 서버에서 생성된 값이 있을 수도)
      claims: (body && (body as any).payload) ? (body as any).payload : null,
    };
  }

  /**
   * 외부 토큰 검증 + 계정 업서트 (스텁)
   * 실제 검증/DB 로직을 연결하면 됨
   */
  async loginWithExternalBearer(authz: string, tenant?: string) {
    const token = authz.replace(/^Bearer\s+/i, '');
    // TODO: verify token (JWKS), upsert account, etc.
    return { ok: true, tenant, tokenUsed: token };
  }
}
