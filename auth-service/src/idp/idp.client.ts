import { Injectable } from '@nestjs/common';

export type IssueTokenBody = {
  sub: string;
  acc: string;
  cId?: string | number;
  cCd?: string;
  ad?: string;
  role?: string;
  ttl?: number; // 초. 미입력시 idp-mock 기본값 사용
};

@Injectable()
export class IdpClient {
  private readonly url = process.env.IDP_TOKEN_URL;

  async issueToken(body: IssueTokenBody): Promise<{ token: string }> {
    if (!this.url) {
      throw new Error('IDP_TOKEN_URL is not set');
    }

    // Node 18+ 글로벌 fetch 사용 (Nest 10 / Node 20+ 환경)
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 7_000); // 7초 타임아웃

    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
      signal: ac.signal,
    }).catch((e) => {
      throw new Error(`IdP request failed: ${e}`);
    }).finally(() => clearTimeout(t));

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`IdP issueToken failed (${res.status}) ${text}`);
    }

    return (await res.json()) as any; // { token }
  }
}
