import { BadRequestException, Controller, Get, Headers, MethodNotAllowedException, Post, Req, Res, } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { TokenService } from '../services/token.service';
import { FLAGS } from '../config/flags';

@Controller()
export class TokenController {
  constructor(private readonly tokens: TokenService) {}

  @Post('login')
  async login(
    @Req() _req: FastifyRequest,
    @Res() res: FastifyReply,
    @Headers('authorization') auth?: string,
    @Headers('x-tenant-id') ten?: string,
  ) {
    if (!auth?.startsWith('Bearer ')) {
      throw new BadRequestException('Missing Bearer token');
    }
    const result = await this.tokens.loginWithExternalBearer(auth, ten);
    return res.code(200).send(result);
  }

  @Post('refresh')
  async refresh(@Res() res: FastifyReply) {
    if (!FLAGS.REFRESH_ENABLED) {
      throw new MethodNotAllowedException('Refresh disabled');
    }
    return res.code(501).send({ message: 'not implemented in external mode' });
  }

  @Post('logout')
  async logout(@Res() res: FastifyReply) {
    return res.code(204).send();
  }

  @Get('me')
  async me(
    @Res() res: FastifyReply,
    @Headers('authorization') auth?: string,
    @Headers('x-tenant-id') ten?: string,
  ) {
    if (!auth?.startsWith('Bearer ')) {
      throw new BadRequestException('Missing Bearer token');
    }
    const result = await this.tokens.loginWithExternalBearer(auth, ten);
    return res.code(200).send({ ok: true, claims: result.claims });
  }
}
