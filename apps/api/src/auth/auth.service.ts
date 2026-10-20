import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { safeEqual } from '../common/crypto/safe-equal.js';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { AdminTokenPayload, AuthenticatedAdmin } from './auth.types.js';

const JWT_EXPIRES_IN = '12h';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.bootstrapAdminIfNeeded();
  }

  private jwtSecret(): string {
    const secret = this.config.get<string>('app.adminJwtSecret') || '';
    if (!secret || secret.length < 16) {
      throw new ServiceUnavailableException(
        'ADMIN_JWT_SECRET is not configured. Set a secret of at least 16 characters.',
      );
    }
    return secret;
  }

  private async bootstrapAdminIfNeeded() {
    const existing = await this.db.adminUser.count();
    if (existing > 0) {
      return;
    }

    const email = (this.config.get<string>('app.adminBootstrapEmail') || '').trim().toLowerCase();
    const password = this.config.get<string>('app.adminBootstrapPassword') || '';
    if (!email || !password || password.length < 8) {
      this.logger.warn(
        'No admin users exist. Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD (>= 8 chars) to create the first admin.',
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await this.db.adminUser.create({
      data: {
        email,
        passwordHash,
        role: 'admin',
        isActive: true,
      },
    });
    this.logger.log(`Bootstrapped first admin user: ${email}`);
  }

  signToken(admin: AuthenticatedAdmin): string {
    const payload: AdminTokenPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };
    return jwt.sign(payload, this.jwtSecret(), { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token: string): AdminTokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret());
      if (typeof decoded === 'string' || !decoded.sub || !decoded.email) {
        throw new UnauthorizedException('Invalid admin session');
      }
      return {
        sub: String(decoded.sub),
        email: String(decoded.email),
        role: String(decoded.role || 'editor'),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired admin session');
    }
  }

  async login(credentials: { email?: string; password?: string; apiKey?: string }) {
    const { email, password, apiKey } = credentials;
    const configuredApiKey = this.config.get<string>('app.adminApiKey') || '';

    if (apiKey) {
      if (!configuredApiKey || !safeEqual(apiKey, configuredApiKey)) {
        throw new UnauthorizedException('Invalid admin API key');
      }
      const admin = await this.db.adminUser.findFirst({
        where: { isActive: true, role: 'admin' },
        orderBy: { createdAt: 'asc' },
      });
      if (!admin) {
        throw new UnauthorizedException('No active admin user is configured');
      }
      await this.audit.logEvent({
        actor: admin.email,
        action: 'login',
        entityType: 'admin_user',
        entityId: admin.id,
        afterSummary: 'Admin authenticated via API key',
      });
      const token = this.signToken({ id: admin.id, email: admin.email, role: admin.role });
      return {
        accessToken: token,
        user: { email: admin.email, role: admin.role },
      };
    }

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const admin = await this.db.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid admin email or password');
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid admin email or password');
    }

    await this.audit.logEvent({
      actor: admin.email,
      action: 'login',
      entityType: 'admin_user',
      entityId: admin.id,
      afterSummary: 'Admin authenticated via password',
    });

    const token = this.signToken({ id: admin.id, email: admin.email, role: admin.role });
    return {
      accessToken: token,
      user: { email: admin.email, role: admin.role },
    };
  }

  async getMe(admin: AuthenticatedAdmin) {
    return {
      authenticated: true,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}
