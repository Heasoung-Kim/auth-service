export type NormalizedClaims = {
  account_id: string;
  company_id?: string | null;
  company_code?: string | null;
  roles: string[];           // 최소 1개
  email?: string;
  exp?: number;              // unix seconds
};

export interface IdPAdapter {
  verifyAndMap(token: string): Promise<NormalizedClaims>;
}

export const IDP_ADAPTER = Symbol('IDP_ADAPTER');
