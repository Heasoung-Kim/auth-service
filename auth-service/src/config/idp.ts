export type IdpProvider = 'keycloak' | 'auth0' | 'cognito' | 'azuread' | 'generic';

export interface IdpConfig {
  provider: IdpProvider;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
  audience?: string;
}

function inferProvider(url: string): IdpProvider {
  const u = url.toLowerCase();
  if (u.includes('/protocol/openid-connect/token')) return 'keycloak';
  if (u.includes('auth0.com/oauth/token')) return 'auth0';
  if (u.includes('amazoncognito.com/oauth2/token')) return 'cognito';
  if (u.includes('login.microsoftonline.com') && u.includes('/oauth2/v2.0/token')) return 'azuread';
  return 'generic';
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env: ${name}`);
  return v.trim();
}

/** Load & validate IDP env for client_credentials grant. Throws on invalid. */
export function loadIdpConfig(): IdpConfig {
  const tokenUrl = requireEnv('IDP_TOKEN_URL');
  const clientId = requireEnv('IDP_CLIENT_ID');
  const clientSecret = requireEnv('IDP_CLIENT_SECRET');
  const scope = (process.env.IDP_SCOPE || '').trim() || undefined;
  const audience = (process.env.IDP_AUDIENCE || '').trim() || undefined;

  const provider = inferProvider(tokenUrl);

  // Provider-specific minimal rules
  switch (provider) {
    case 'auth0':
      if (!audience) {
        throw new Error('Auth0 requires IDP_AUDIENCE (your API Identifier, e.g. https://api.example.com)');
      }
      break;
    case 'azuread':
      if (!scope) {
        throw new Error('Azure AD v2.0 requires IDP_SCOPE (e.g. api://<app-id>/.default)');
      }
      break;
    case 'keycloak':
    case 'cognito':
    case 'generic':
      // scope/audience optional
      break;
  }

  return { provider, tokenUrl, clientId, clientSecret, scope, audience };
}

/** Returns yes/no style validity without throwing. */
export function isIdpConfigValid(): 'yes' | 'no' {
  try {
    loadIdpConfig();
    return 'yes';
  } catch {
    return 'no';
  }
}
