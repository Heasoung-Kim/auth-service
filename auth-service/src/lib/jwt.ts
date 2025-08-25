import { importPKCS8, importSPKI, SignJWT, jwtVerify, exportJWK } from "jose";

const ALG = "RS256";
const ISS = process.env.JWT_ISSUER!; // 예: https://api.example.com
const ACCESS_TTL_SEC = +(process.env.ACCESS_TTL_SEC ?? 1200); // 20m

// PEM 문자열을 env로 주입
const PRIVATE_PEM = process.env.AUTH_PRIVATE_KEY_PEM!;
const PUBLIC_PEM  = process.env.AUTH_PUBLIC_KEY_PEM!;

let _priv: CryptoKey | null = null;
let _pub: CryptoKey | null = null;

export async function getPrivateKey() {
  if (!_priv) _priv = await importPKCS8(PRIVATE_PEM, ALG);
  return _priv!;
}
export async function getPublicKey() {
  if (!_pub) _pub = await importSPKI(PUBLIC_PEM, ALG);
  return _pub!;
}

export async function signAccessToken(sub: string, roles: string[], tenant: string) {
  const now = Math.floor(Date.now()/1000);
  const jwt = await new SignJWT({ sub, roles, ten: tenant })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt(now)
    .setIssuer(ISS)
    .setExpirationTime(now + ACCESS_TTL_SEC)
    .sign(await getPrivateKey());
  return jwt;
}

export async function verifyAccess(token: string) {
  const { payload } = await jwtVerify(token, await getPublicKey(), { issuer: ISS });
  return payload as { sub: string; roles?: string[]; ten?: string; exp: number; iat: number };
}

export async function publicJwk() {
  const pub = await getPublicKey();
  const jwk = await exportJWK(pub);
  return { keys: [{ ...jwk, alg: ALG, use: "sig", kid: "auth-rs256-1", kty: "RSA" }] };
}
