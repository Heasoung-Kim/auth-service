import { Injectable } from '@nestjs/common';

@Injectable()
export class MockIdpClient {
  async getToken(): Promise<{ access_token: string; expires_in: number; token_type: string }> {
    return {
      access_token: 'mock-token-1234567890',
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }

  async introspect(token: string): Promise<any> {
    if (token === 'mock-token-1234567890') {
      return {
        sub: '537',
        acc: 'timbel_super2',
        cId: 26,
        cd: 'NICE',
        ad: '912697',
        role: 'SUPERVISOR',
        exp: 3533056532,
      };
    }
    return { active: false };
  }

  async getUserInfo(token: string): Promise<any> {
    if (token === 'mock-token-1234567890') {
      return {
        sub: '537',
        acc: 'timbel_super2',
        cId: 26,
        cd: 'NICE',
        ad: '912697',
        role: 'SUPERVISOR',
        exp: 3533056532,
      };
    }
    return {};
  }
}
