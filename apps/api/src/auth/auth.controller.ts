import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string; apiKey?: string }) {
    return this.authService.login(body);
  }

  @Post('admin/login')
  async adminLoginAlias(@Body() body: { email?: string; password?: string; apiKey?: string }) {
    return this.authService.login(body);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async getMe(@Req() request: FastifyRequest) {
    if (!request.adminUser) {
      return { authenticated: false };
    }
    return this.authService.getMe(request.adminUser);
  }
}
