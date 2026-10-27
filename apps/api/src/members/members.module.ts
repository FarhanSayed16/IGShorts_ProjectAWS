import { Module } from '@nestjs/common';
import { MemberAuthGuard } from './member-auth.guard.js';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';

@Module({
  controllers: [MembersController],
  providers: [MembersService, MemberAuthGuard],
  exports: [MembersService],
})
export class MembersModule {}
