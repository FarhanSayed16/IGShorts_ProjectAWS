import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { AuthService } from '../../auth/auth.service.js';
import { AuthenticatedAdmin } from '../../auth/auth.types.js';
import { safeEqual } from '../crypto/safe-equal.js';

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AuthenticatedAdmin;
  }
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers['authorization'];
    const apiKeyHeader = request.headers['x-admin-api-key'];
    const expectedApiKey = this.config.get<string>('app.adminApiKey') || '';

    if (
      typeof apiKeyHeader === 'string' &&
      expectedApiKey &&
      safeEqual(apiKeyHeader, expectedApiKey)
    ) {
      request.adminUser = {
        id: 'api-key',
        email: 'api-key@igshorts.local',
        role: 'admin',
      };
      return true;
    }

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const payload = this.authService.verifyToken(token);
      if (payload.role === 'member') {
        throw new UnauthorizedException('Admin authorization required');
      }
      request.adminUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    }

    throw new UnauthorizedException('Admin authorization required');
  }
}
