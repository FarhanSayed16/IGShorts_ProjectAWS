import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'node:fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { ENTITY_TYPES, EntityType } from '@igshorts/shared';

export interface SeedRowParsed {
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string | null;
  followerCount: bigint | null;
  entityType: EntityType;
  category: string | null;
  countryRegion: string | null;
  seedRank: number | null;
  seedConfidence: string | null;
  seedNotes: string | null;
  rankingSourceUrl: string | null;
  scope: 'india' | 'global';
  rawUsername: string;
  isBadUsername: boolean;
}

export interface SeedParseResult {
  indiaRows: SeedRowParsed[];
  globalRows: SeedRowParsed[];
  badUsernames: string[];
  totalParsed: number;
}

@Injectable()
export class ManualSeedAdapter {
  private readonly logger = new Logger(ManualSeedAdapter.name);
  readonly code = 'seed_xlsx';

  /**
   * Normalizes an Instagram username according to platform rules:
   * lowercase, remove leading @, remove whitespace, remove trailing slashes.
   */
  normalizeUsername(raw: string): string {
    if (!raw) return '';
    return raw
      .trim()
      .toLowerCase()
      .replace(/^@+/, '')
      .replace(/\s+/g, '') // Fixes issues like '@m cstan'
      .replace(/\/+$/, '');
  }

  /**
   * Validates if a normalized username conforms to Instagram handle rules
   */
  isValidUsername(username: string): boolean {
    if (!username || username.length > 30) return false;
    // Instagram usernames can contain letters, numbers, periods, and underscores
    return /^[a-z0-9._]{1,30}$/.test(username);
  }

  /**
   * Classifies entity type based on category, handle, and display name
   */
  classifyEntityType(category?: string | null, username?: string): EntityType {
    const handle = (username || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    // 1. Explicit platforms
    if (handle === 'instagram') return ENTITY_TYPES.PLATFORM;

    // 2. Explicit Brands
    if (
      cat.startsWith('brand') ||
      handle === 'zomato' ||
      handle === 'swiggyindia' ||
      handle === 'apple' ||
      handle === 'samsung' ||
      handle === 'nike' ||
      handle === 'adidas' ||
      handle === 'puma' ||
      handle === 'bmw'
    ) {
      return ENTITY_TYPES.BRAND;
    }

    // 3. Teams / Leagues / Music Groups / Duos
    if (
      cat.includes('sports team') ||
      cat.includes('sports league') ||
      cat.includes('music group') ||
      cat.includes('duo') ||
      handle === 'iplt20' ||
      handle === 'premierleague' ||
      handle === 'championsleague' ||
      handle === 'realmadrid' ||
      handle === 'fcbarcelona' ||
      handle === 'mumbaiindians' ||
      handle === 'chennaiipl' ||
      handle === 'royalchallengers.bengaluru' ||
      handle === 'indiancricketteam'
    ) {
      return ENTITY_TYPES.TEAM;
    }

    // 4. Media Channels / Organizations (Non-person entities)
    if (
      handle === 'natgeo' ||
      handle === 'nasa' ||
      handle === 'icc' ||
      handle === '433' ||
      handle === 'filmygyan' ||
      handle === 'instantbollywood' ||
      handle === 'bhajanmarg_official' ||
      cat === 'entertainment media' ||
      cat === 'sports media' ||
      cat === 'media / science' ||
      cat === 'spiritual media' ||
      cat === 'public agency / science' ||
      cat === 'sports organization'
    ) {
      return ENTITY_TYPES.OTHER;
    }

    // 5. Explicit Individual Professions (Comedians, Actors, Athletes, Musicians, Creators, Directors)
    if (
      cat.includes('comedian') ||
      cat.includes('actor') ||
      cat.includes('athlete') ||
      cat.includes('musician') ||
      cat.includes('creator') ||
      cat.includes('model') ||
      cat.includes('chef') ||
      cat.includes('dancer') ||
      cat.includes('dance') ||
      cat.includes('speaker') ||
      cat.includes('education') ||
      cat.includes('fashion') ||
      cat.includes('beauty')
    ) {
      return ENTITY_TYPES.PERSON;
    }

    return ENTITY_TYPES.PERSON;
  }

  /**
   * Parses follower count in millions into exact integer (BigInt) or null
   */
  parseFollowerCount(val: unknown): bigint | null {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
    if (isNaN(num) || num <= 0) return null;
    return BigInt(Math.round(num * 1_000_000));
  }

  /**
   * Parses the Excel research sheet
   */
  private resolveDefaultSeedPath(): string {
    const relative = 'docs/IGshorts_Instagram_Account_Research_and_Architecture.xlsx';
    const candidates = [
      path.resolve(process.cwd(), relative),
      path.resolve(process.cwd(), '..', '..', relative),
      path.resolve(process.cwd(), '..', relative),
    ];
    return candidates.find((candidate) => existsSync(candidate)) || candidates[0];
  }

  parseExcelFile(filePath?: string): SeedParseResult {
    const resolvedPath = filePath || this.resolveDefaultSeedPath();

    this.logger.log(`Reading seed Excel file from: ${resolvedPath}`);
    const workbook = xlsx.readFile(resolvedPath);

    const parseSheet = (sheetName: string, scope: 'india' | 'global'): SeedRowParsed[] => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found in Excel file`);
      }

      const rows: any[] = xlsx.utils.sheet_to_json(sheet);
      return rows.map((r) => {
        const rawUsername = String(r.username || '').trim();
        const normalized = this.normalizeUsername(rawUsername);
        const isValid = this.isValidUsername(normalized);

        const category = r.account_category ? String(r.account_category).trim() : null;
        const entityType = this.classifyEntityType(category, normalized);
        const followers = this.parseFollowerCount(r.follower_count_millions);

        return {
          username: normalized,
          displayName: String(r.account_name || normalized).trim(),
          profileUrl: normalized
            ? `https://www.instagram.com/${normalized}/`
            : String(r.profile_url || ''),
          avatarUrl: null, // Initial seed has no avatars; fetched or loaded later
          followerCount: followers,
          entityType,
          category,
          countryRegion: r.country_region ? String(r.country_region).trim() : null,
          seedRank: typeof r.rank === 'number' ? r.rank : null,
          seedConfidence: r.confidence ? String(r.confidence).trim() : null,
          seedNotes: r.notes ? String(r.notes).trim() : null,
          rankingSourceUrl: r.ranking_source_url ? String(r.ranking_source_url).trim() : null,
          scope,
          rawUsername,
          isBadUsername: !isValid,
        };
      });
    };

    const indiaRows = parseSheet('India 200', 'india');
    const globalRows = parseSheet('Global 200', 'global');

    const badUsernames = [
      ...indiaRows.filter((r) => r.isBadUsername).map((r) => `${r.rawUsername} (India)`),
      ...globalRows.filter((r) => r.isBadUsername).map((r) => `${r.rawUsername} (Global)`),
    ];

    return {
      indiaRows,
      globalRows,
      badUsernames,
      totalParsed: indiaRows.length + globalRows.length,
    };
  }
}
