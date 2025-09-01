export const FLAGS = {
  INTERNAL_ISSUER_ENABLED: process.env.AUTH_INTERNAL_ISSUER_ENABLED === 'true',
  REFRESH_ENABLED: process.env.AUTH_REFRESH_ENABLED === 'true',
  JWKS_ENABLED: process.env.JWKS_ENABLED === 'true',
  MOCK_GENERATE: process.env.MOCK_GENERATE === 'true',
} as const;
