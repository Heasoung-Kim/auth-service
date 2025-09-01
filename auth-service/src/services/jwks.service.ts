import { Injectable } from '@nestjs/common';
import { createPrivateKey, createPublicKey } from 'crypto';
import { exportJWK, type JWK } from 'jose';
import { readFileSync } from 'fs';

function readPemFromEnvOrFile(): string {
  const file = process.env.PRIVATE_KEY_FILE;
  if (file) return readFileSync(file, 'utf8');
  const raw = process.env.PRIVATE_KEY_PEM || '';
  return raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw;
}

@Injectable()
export class JwksService {
  private readonly kid = process.env.JWKS_KID ?? 'auth-service-key-1';
  private cache?: { keys: JWK[] };

  async publicJwks() {
    if (!this.cache) {
      const pem = readPemFromEnvOrFile();
      if (!pem) throw new Error('PRIVATE_KEY_PEM or PRIVATE_KEY_FILE is missing');

      // 프라이빗 키 → 퍼블릭 키 → JWK
      const pub = createPublicKey(
        createPrivateKey({
          key: pem,
          format: 'pem',
          passphrase: process.env.PRIVATE_KEY_PASSPHRASE,
        }),
      );

      const jwk = await exportJWK(pub);            // ← 여기서 n,e 생성됨 (RSA일 경우)
      (jwk as any).kid = this.kid;
      (jwk as any).alg = 'RS256';
      (jwk as any).use = 'sig';

      // 안전 확인: n/e가 없으면 오류
      if (jwk.kty === 'RSA' && !(jwk as any).n) {
        throw new Error('JWKS export missing modulus/exponent (n/e)');
      }

      this.cache = { keys: [jwk as JWK] };
    }
    return this.cache;
  }
}
