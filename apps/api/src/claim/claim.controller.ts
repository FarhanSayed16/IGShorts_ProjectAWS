import { Body, Controller, Post, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { SubmitClaimDto } from './claim.dto.js';
import { ClaimService } from './claim.service.js';

@Controller('claim')
export class ClaimController {
  constructor(private readonly claims: ClaimService) {}

  @Post()
  async submit(@Body() body: SubmitClaimDto, @Req() request: FastifyRequest) {
    const forwarded = request.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : undefined) ||
      request.ip ||
      'unknown';
    return this.claims.submit(body, ip);
  }
}
