import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

const WIKI_UA =
  'IGshorts/0.1 (public-figures watchlist; wikipedia portraits; not Instagram scraping)';
const DELAY_MS = 180;

interface WikiSearchResult {
  query?: { search?: Array<{ title: string; snippet?: string }> };
}

interface WikiSummary {
  type?: string;
  title?: string;
  extract?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
}

export interface EnrichmentReport {
  scanned: number;
  portraits: number;
  bios: number;
  skipped: number;
  failed: number;
}

@Injectable()
export class WikipediaEnrichmentService {
  private readonly logger = new Logger(WikipediaEnrichmentService.name);

  constructor(private readonly db: DatabaseService) {}

  async enrichWithoutPublishedCount(): Promise<EnrichmentReport> {
    const rows = await this.db.$queryRaw<Array<{ id: string }>>`
      SELECT p.id
      FROM creator_profiles p
      LEFT JOIN LATERAL (
        SELECT s.metric_value
        FROM metric_snapshots s
        WHERE s.profile_id = p.id
          AND s.metric_name = 'follower_count'
          AND s.metric_value IS NOT NULL
        LIMIT 1
      ) lat ON TRUE
      WHERE p.is_listed = TRUE
        AND p.is_active = TRUE
        AND lat.metric_value IS NULL
      ORDER BY p.display_name ASC
    `;
    const profiles = rows.length
      ? await this.db.creatorProfile.findMany({
          where: { id: { in: rows.map((row) => row.id) } },
        })
      : [];
    const byId = new Map(profiles.map((profile) => [profile.id, profile]));
    const ordered = rows.map((row) => byId.get(row.id)).filter((profile) => profile != null);
    await this.clearMismatchedLeads(ordered);
    const refreshed = ordered.length
      ? await this.db.creatorProfile.findMany({ where: { id: { in: ordered.map((profile) => profile.id) } } })
      : [];
    return this.enrichProfiles(refreshed);
  }

  async enrichListedPeople(limit?: number): Promise<EnrichmentReport> {
    const profiles = await this.db.creatorProfile.findMany({
      where: {
        isListed: true,
        isActive: true,
        entityType: 'person',
      },
      include: {
        metricSnapshots: {
          where: { metricValue: { not: null } },
          orderBy: { observedAt: 'desc' },
          take: 1,
          select: { metricValue: true },
        },
      },
      take: limit,
    });
    profiles.sort((a, b) => {
      const av = a.metricSnapshots[0]?.metricValue ?? -1n;
      const bv = b.metricSnapshots[0]?.metricValue ?? -1n;
      if (av === bv) return a.displayName.localeCompare(b.displayName);
      return av > bv ? -1 : 1;
    });

    return this.enrichProfiles(profiles);
  }

  private async enrichProfiles(
    profiles: Array<{
      id: string;
      igUsername: string;
      displayName: string;
      category: string | null;
      avatarUrl: string | null;
      shortBio: string | null;
    }>,
  ): Promise<EnrichmentReport> {
    const report: EnrichmentReport = {
      scanned: profiles.length,
      portraits: 0,
      bios: 0,
      skipped: 0,
      failed: 0,
    };

    let index = 0;
    for (const profile of profiles) {
      index += 1;
      if (index === 1 || index % 25 === 0) {
        this.logger.log(`Wikipedia enrich ${index}/${profiles.length}: @${profile.igUsername}`);
      }
      if (profile.avatarUrl && profile.shortBio) {
        report.skipped += 1;
        continue;
      }
      try {
        const hit = await this.lookupPerson(
          profile.displayName,
          profile.category,
          profile.igUsername,
        );
        await this.sleep(DELAY_MS);
        if (!hit) {
          report.skipped += 1;
          continue;
        }

        const data: { avatarUrl?: string; avatarSource?: string; shortBio?: string } = {};
        if (!profile.avatarUrl && hit.image) {
          data.avatarUrl = hit.image;
          data.avatarSource = 'wikipedia';
          report.portraits += 1;
        }
        if (!profile.shortBio && hit.extract) {
          data.shortBio = hit.extract.slice(0, 600);
          report.bios += 1;
        }
        if (Object.keys(data).length === 0) {
          report.skipped += 1;
          continue;
        }
        await this.db.creatorProfile.update({
          where: { id: profile.id },
          data,
        });
      } catch (error) {
        report.failed += 1;
        this.logger.warn(
          `Wikipedia enrich failed for @${profile.igUsername}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }

    this.logger.log(
      `Wikipedia enrich complete: ${report.portraits} portraits, ${report.bios} bios, ${report.skipped} skipped, ${report.failed} failed`,
    );
    return report;
  }

  private async lookupPerson(
    displayName: string,
    category: string | null,
    username: string,
  ): Promise<{ image: string | null; extract: string | null } | null> {
    const queries = this.buildQueries(displayName, category, username);
    for (const query of queries) {
      const direct = await this.fetchSummary(query);
      if (direct && this.isUsableSummary(direct, displayName, username)) {
        return this.fromSummary(direct);
      }
      const titles = await this.searchTitles(query);
      for (const title of titles) {
        const summary = await this.fetchSummary(title);
        await this.sleep(DELAY_MS);
        if (!summary || !this.isUsableSummary(summary, displayName, username)) continue;
        return this.fromSummary(summary);
      }
    }
    return null;
  }

  private fromSummary(summary: WikiSummary): { image: string | null; extract: string | null } {
    const raw = summary.originalimage?.source || summary.thumbnail?.source || null;
    const clean = raw ? raw.split('?')[0] : null;
    const image = clean;
    return {
      image,
      extract: summary.extract?.trim() || null,
    };
  }

  private isUsableSummary(summary: WikiSummary, displayName: string, _username: string): boolean {
    if (!summary || summary.type === 'disambiguation') return false;
    const image = summary.thumbnail?.source || summary.originalimage?.source || null;
    const extract = summary.extract?.trim() || null;
    if (!image && !extract) return false;
    if (extract && !this.leadMentions(displayName, extract)) return false;
    return this.namesAlign(displayName, summary.title || '');
  }

  private leadMentions(displayName: string, extract: string): boolean {
    const lead = extract.slice(0, 180).toLowerCase();
    const tokens = displayName
      .toLowerCase()
      .split(/[\s.'’-]+/)
      .filter((token) => token.length > 2);
    if (tokens.length === 0) return lead.includes(displayName.toLowerCase());
    return tokens.some((token) => lead.includes(token));
  }

  private async clearMismatchedLeads(
    profiles: Array<{
      id: string;
      displayName: string;
      shortBio: string | null;
      avatarSource: string | null;
    }>,
  ) {
    for (const profile of profiles) {
      if (!profile.shortBio || this.leadMentions(profile.displayName, profile.shortBio)) continue;
      await this.db.creatorProfile.update({
        where: { id: profile.id },
        data: {
          shortBio: null,
          ...(profile.avatarSource === 'wikipedia' ? { avatarUrl: null, avatarSource: null } : {}),
        },
      });
      this.logger.warn(`Cleared a mismatched Wikipedia page for ${profile.displayName}`);
    }
  }

  private buildQueries(displayName: string, category: string | null, username: string): string[] {
    const unique = new Set<string>();
    unique.add(displayName);
    if (category) {
      unique.add(`${displayName} ${category.split('/')[0].trim()}`);
    }
    if (username.replace(/[._]/g, '').length >= 5) {
      unique.add(username.replace(/[._]/g, ' '));
    }
    return [...unique].filter(Boolean);
  }

  private namesAlign(displayName: string, wikiTitle: string): boolean {
    const hay = wikiTitle.toLowerCase();
    const tokens = displayName
      .toLowerCase()
      .split(/[\s.'’-]+/)
      .filter((token) => token.length > 2);
    if (tokens.length === 0) {
      return hay.includes(displayName.toLowerCase());
    }
    const hits = tokens.filter((token) => hay.includes(token)).length;
    return hits >= Math.min(2, tokens.length) || hits === tokens.length;
  }

  private async searchTitles(query: string): Promise<string[]> {
    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', query);
    url.searchParams.set('srlimit', '5');
    url.searchParams.set('format', 'json');
    const data = await this.getJson<WikiSearchResult>(url);
    return (data.query?.search || []).map((row) => row.title).filter(Boolean);
  }

  private async fetchSummary(title: string): Promise<WikiSummary | null> {
    const slug = encodeURIComponent(title.trim().replace(/ /g, '_'));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`;
    return this.getJson<WikiSummary>(url, true);
  }

  private async getJson<T>(url: URL | string, allowEmpty = false): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(String(url), {
          headers: {
            'User-Agent': WIKI_UA,
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        if (res.status === 404 && allowEmpty) {
          return null as T;
        }
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get('retry-after')) || 2 + attempt * 2;
          lastError = new Error('HTTP 429');
          await this.sleep(retryAfter * 1000);
          continue;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return (await res.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('unknown');
        if (lastError.message === 'HTTP 429') {
          continue;
        }
        throw lastError;
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError || new Error('Wikipedia request failed');
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
