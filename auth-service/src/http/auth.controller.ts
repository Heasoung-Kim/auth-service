import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Headers,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/auth.service';
import { FLAGS } from '../config/flags';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {
    // 주입 확인(필요 없으면 제거)
    // @ts-ignore
    console.log('[AuthController] injected?', !!this.auth, this.auth?.constructor?.name);
  }

  @Post('login')
  async login(
    @Res() res: FastifyReply,
    @Headers('authorization') authz?: string,
    @Headers('x-tenant-id') ten?: string,
  ) {
    if (!authz?.startsWith('Bearer ')) {
      throw new BadRequestException('Missing Bearer token');
    }
    const r = await this.auth.loginWithExternalBearer(authz, ten);
    return res.code(200).send(r);
  }

  /**
   * 개발용: idp-mock을 호출하여 토큰을 발급하고, 표준 구조로 반환
   * 요청 예시:
   * {
   *   "mode": "claims",
   *   "payload": { "sub": "537", "acc": "timbel_super2", "cId": 26, "cd": "NICE", "ad": "912697", "role": "SUPERVISOR" },
   *   "ttlSec": 900
   * }
   */
  @Post('token')
  async issueToken(
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    if (!FLAGS.MOCK_GENERATE) {
      throw new ForbiddenException('mock token disabled');
    }

    const body = (req.body as any) ?? {};
    const raw = await this.auth.issueMockTokenViaIdpMock(body);

    // services에서 이미 { access_token, token_type, expires_in, claims }로 표준화함
    const { access_token, token_type, expires_in, claims } = raw ?? {};

    if (!access_token) {
      return res.code(502).send({ ok: false, error: 'mock token missing', raw });
    }

    return res.code(200).send({
      ok: true,
      token: { access_token, token_type, expires_in },
      claims: claims ?? null,
    });
  }
}
