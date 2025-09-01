import Fastify from 'fastify';
import {
    generateKeyPair,
    exportJWK,
    calculateJwkThumbprint,
    SignJWT,
} from 'jose';

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT || 7002);

// RS256 키 1세트 메모리 생성 (서버 재기동 시 변경됨)
const { publicKey, privateKey } = await generateKeyPair('RS256');
const pubJwk = await exportJWK(publicKey);
(pubJwk as any).kid = await calculateJwkThumbprint(pubJwk);

// JWKS 공개
app.get('/.well-known/jwks.json', async () => ({ keys: [pubJwk] }));

/**
 * POST /token
 * 요청 바디(JSON): { sub, acc, cId, cd, ad, role, exp? }
 * - exp가 들어오면 그대로 사용(초 단위 epoch)
 * - exp가 없으면 now + TTL(기본 3600초)
 * 응답: { token }
 */
app.post('/token', async (req, reply) => {
    const b: any = req.body ?? {};

    // 필수 최소값 점검
    if (!b.sub) {
        return reply.code(400).send({ detail: "missing required field: 'sub'" });
    }
    // role 대문자 정규화(고객사가 고정값을 원하면 이 줄 제거)
    if (b.role) b.role = String(b.role).toUpperCase();

    // exp 결정: 제공된 exp(초) 우선, 없으면 TTL 적용
    const ttlSec = Number(process.env.TTL_SEC || 3600);
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec =
        b.exp != null
            ? Number(b.exp)
            : nowSec + (Number.isFinite(ttlSec) && ttlSec > 0 ? ttlSec : 3600);

    // 페이로드는 고객사 스펙 그대로(키 이름 유지)
    const payload: Record<string, any> = {
        sub: String(b.sub),
        acc: b.acc ?? null,
        cId: b.cId ?? null,
        cd: b.cd ?? null,
        ad: b.ad ?? null,
        role: b.role ?? 'USER',
        // jose의 setExpirationTime으로 exp를 헤더에 셋하지만,
        // 페이로드에도 동일 키를 노출해야 하면 아래 줄 유지.
        exp: expSec,
    };

    // JWT 생성
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'RS256', kid: (pubJwk as any).kid })
        // iat/nbf 등을 원치 않으면 이 두 줄은 생략 가능
        .setIssuedAt()
        .setExpirationTime(expSec) // epoch seconds 그대로
        .sign(privateKey);

    return { token };
});

app.listen({ port: PORT, host: '0.0.0.0' });