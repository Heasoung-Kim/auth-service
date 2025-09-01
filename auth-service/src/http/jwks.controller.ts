import { Controller, Get, NotFoundException } from '@nestjs/common';
import { JwksService } from '../services/jwks.service';
import { FLAGS } from '../config/flags';

@Controller('.well-known')
export class JwksController {
  constructor(private readonly jwks: JwksService) {}

  @Get('jwks.json')
  getJwks() {
    if (!FLAGS.JWKS_ENABLED) throw new NotFoundException();
    return this.jwks.publicJwks();
  }
}
