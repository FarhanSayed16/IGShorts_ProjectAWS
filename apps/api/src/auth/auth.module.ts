import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [AuditModule],
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard, RolesGuard],
  exports: [AuthService, AdminAuthGuard, RolesGuard],
})
export class AuthModule {}
