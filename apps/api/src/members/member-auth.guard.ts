import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MembersService } from './members.service.js';

export interface AuthenticatedMember {
  id: string;
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    memberUser?: AuthenticatedMember;
  }
}

@Injectable()
export class MemberAuthGuard implements CanActivate {
  constructor(private readonly members: MembersService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Sign in required');
    }
    const payload = this.members.verifyToken(authHeader.substring(7).trim());
    request.memberUser = { id: payload.sub, email: payload.email };
    return true;
  }
}
