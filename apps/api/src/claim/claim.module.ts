import { Module } from '@nestjs/common';
import { ClaimController } from './claim.controller.js';
import { ClaimService } from './claim.service.js';

@Module({
  controllers: [ClaimController],
  providers: [ClaimService],
})
export class ClaimModule {}