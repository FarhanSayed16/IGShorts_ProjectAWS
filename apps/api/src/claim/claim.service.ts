import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { SubmitClaimDto } from './claim.dto.js';

type ClaimBucket = { timestamps: number[] };

@Injectable()
export class ClaimService {
  private readonly logger = new Logger(ClaimService.name);
  /** In-memory rate limit: max 5 claim submissions per IP per hour. */
  private readonly buckets = new Map<string, ClaimBucket>();
  private readonly maxPerHour = 5;
  private readonly windowMs = 60 * 60 * 1000;

  constructor(private readonly db: DatabaseService) {}

  async submit(dto: SubmitClaimDto, ip: string) {
    this.assertRateLimit(ip || 'unknown');

    const handle = dto.handle.replace(/^@/, '').toLowerCase().trim();
    const email = dto.email.trim().toLowerCase();

    // Meta live verification stays off until META_ACCESS_TOKEN + PROVIDER=meta.
    const row = await this.db.claimRequest.create({
      data: {
        handle,
        email,
        status: 'pending_verification',
        ip: ip || null,
      },
    });

    this.logger.log(`Claim ${row.id} pending verification for @${handle} (${email})`);

    return {
      id: row.id,
      status: 'pending_verification' as const,
      handle,
      email,
      timeline: 'Usually 1–3 business days',
      verification: 'could_not_verify' as const,
      message:
        'Could not verify Instagram ownership automatically. Meta live checks stay off until a Meta token is configured. Your request is queued for manual review.',
    };
  }

  private assertRateLimit(ip: string) {
    const now = Date.now();
    const bucket = this.buckets.get(ip) ?? { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < this.windowMs);
    if (bucket.timestamps.length >= this.maxPerHour) {
      throw new HttpException(
        'Too many claim requests from this IP. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    bucket.timestamps.push(now);
    this.buckets.set(ip, bucket);
  }
}
