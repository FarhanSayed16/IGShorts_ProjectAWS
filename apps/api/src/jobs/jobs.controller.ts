import { Body, Controller, Headers, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ADMIN_ROLES } from '@igshorts/shared';
import { safeEqual } from '../common/crypto/safe-equal.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JobsService } from './jobs.service.js';

@Controller()
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly config: ConfigService,
  ) {}

  @Post('admin/jobs/run')
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLES.ADMIN)
  runFromAdmin(@Body() body?: { usernames?: string[] }) {
    return this.jobsService.runDailyPipeline(body?.usernames);
  }

  @Post('internal/jobs/daily')
  runFromScheduler(@Headers('x-jobs-secret') jobsSecret?: string) {
    const expected = this.config.get<string>('app.jobsSecret') || '';
    if (!expected || !jobsSecret || !safeEqual(jobsSecret, expected)) {
      throw new UnauthorizedException('Invalid jobs secret');
    }
    return this.jobsService.runDailyPipeline();
  }
}
