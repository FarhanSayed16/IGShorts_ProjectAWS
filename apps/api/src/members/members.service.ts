import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { preferredFollowerSnapshot } from '../common/db/snapshot-query.js';
import { DatabaseService } from '../database/database.service.js';

const MEMBER_TOKEN_TTL = '30d';
const MAX_TRACKS = 25;

export interface MemberTokenPayload {
  sub: string;
  email: string;
  role: 'member';
}

function bigintToNumber(value: bigint | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

@Injectable()
export class MembersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  private jwtSecret(): string {
    const secret = this.config.get<string>('app.adminJwtSecret') || '';
    if (!secret || secret.length < 16) {
      throw new ServiceUnavailableException(
        'ADMIN_JWT_SECRET is not configured. Set a secret of at least 16 characters.',
      );
    }
    return secret;
  }

  private normalizeUsername(username: string): string {
    return username.trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, '').replace(/\/+$/, '');
  }

  signToken(member: { id: string; email: string }): string {
    const payload: MemberTokenPayload = {
      sub: member.id,
      email: member.email,
      role: 'member',
    };
    return jwt.sign(payload, this.jwtSecret(), { expiresIn: MEMBER_TOKEN_TTL });
  }

  verifyToken(token: string): MemberTokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret());
      if (
        typeof decoded === 'string' ||
        !decoded.sub ||
        !decoded.email ||
        decoded.role !== 'member'
      ) {
        throw new UnauthorizedException('Invalid member session');
      }
      return {
        sub: String(decoded.sub),
        email: String(decoded.email),
        role: 'member',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired member session');
    }
  }

  async signup(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const existing = await this.db.member.findUnique({ where: { email: normalized } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const member = await this.db.member.create({
      data: { email: normalized, passwordHash },
    });
    return {
      accessToken: this.signToken(member),
      user: { email: member.email },
    };
  }

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const member = await this.db.member.findUnique({ where: { email: normalized } });
    if (!member) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(password, member.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      accessToken: this.signToken(member),
      user: { email: member.email },
    };
  }

  async getMe(memberId: string) {
    const member = await this.db.member.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new UnauthorizedException('Invalid member session');
    }
    return { authenticated: true, user: { email: member.email } };
  }

  async deleteAccount(memberId: string) {
    await this.db.member.delete({ where: { id: memberId } });
    return { deleted: true };
  }

  async listTracks(memberId: string) {
    const tracks = await this.db.profileTrack.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          include: {
            metricSnapshots: {
              where: { metricValue: { not: null } },
              orderBy: { observedAt: 'desc' },
              take: 8,
              include: { source: true },
            },
          },
        },
      },
    });
    return {
      tracks: tracks.map((track) => {
        const latest = preferredFollowerSnapshot(track.profile.metricSnapshots);
        return {
          username: track.profile.igUsername,
          displayName: track.profile.displayName,
          followerCount: bigintToNumber(latest?.metricValue),
          observedAt: latest?.observedAt?.toISOString() ?? null,
          trackedAt: track.createdAt.toISOString(),
        };
      }),
    };
  }

  async track(memberId: string, username: string) {
    const normalized = this.normalizeUsername(username);
    const profile = await this.db.creatorProfile.findUnique({
      where: { igUsername: normalized },
    });
    if (!profile || !profile.isListed || !profile.isActive) {
      throw new NotFoundException(
        'This handle is not in the saved list. A new handle is not looked up until a source is proven.',
      );
    }
    const existing = await this.db.profileTrack.findUnique({
      where: { memberId_profileId: { memberId, profileId: profile.id } },
    });
    if (existing) {
      return { tracked: true, username: profile.igUsername };
    }
    const count = await this.db.profileTrack.count({ where: { memberId } });
    if (count >= MAX_TRACKS) {
      throw new ConflictException(`Track is limited to ${MAX_TRACKS} saved profiles.`);
    }
    await this.db.profileTrack.create({
      data: { memberId, profileId: profile.id },
    });
    return { tracked: true, username: profile.igUsername };
  }

  async untrack(memberId: string, username: string) {
    const normalized = this.normalizeUsername(username);
    const profile = await this.db.creatorProfile.findUnique({
      where: { igUsername: normalized },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    await this.db.profileTrack.deleteMany({
      where: { memberId, profileId: profile.id },
    });
    return { tracked: false, username: profile.igUsername };
  }

  async report(memberId: string, username: string) {
    const normalized = this.normalizeUsername(username);
    const profile = await this.db.creatorProfile.findUnique({
      where: { igUsername: normalized },
      include: {
        metricSnapshots: {
          orderBy: { observedAt: 'desc' },
          take: 30,
          include: { source: true },
        },
        tracks: { where: { memberId }, take: 1 },
      },
    });
    if (!profile || !profile.isListed || !profile.isActive) {
      throw new NotFoundException('Profile not found');
    }
    const latest = preferredFollowerSnapshot(profile.metricSnapshots) ?? null;
    return {
      username: profile.igUsername,
      displayName: profile.displayName,
      followerCount: bigintToNumber(latest?.metricValue),
      observedAt: latest?.observedAt?.toISOString() ?? null,
      source: latest?.source?.code ?? null,
      tracked: profile.tracks.length > 0,
      history: profile.metricSnapshots.map((row) => ({
        observedAt: row.observedAt.toISOString(),
        followerCount: bigintToNumber(row.metricValue),
      })),
    };
  }
}
