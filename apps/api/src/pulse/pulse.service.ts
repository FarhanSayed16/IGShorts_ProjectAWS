import { BadRequestException, Injectable } from '@nestjs/common';
import { DailyPulseDay, PulseKind } from '@igshorts/shared';
import { DatabaseService } from '../database/database.service.js';
import { ChartsService } from '../charts/charts.service.js';
import { CHART_KEYS } from '@igshorts/shared';

function dateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isValidDateInput(dateInput: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateInput);
}

@Injectable()
export class PulseService {
  constructor(
    private readonly db: DatabaseService,
    private readonly charts: ChartsService,
  ) {}

  async forDate(dateInput?: string): Promise<DailyPulseDay> {
    const requestedToday = !dateInput;
    if (dateInput && !isValidDateInput(dateInput)) {
      throw new BadRequestException('Invalid pulse date. Use YYYY-MM-DD.');
    }

    let day = dateInput ? dateOnly(new Date(`${dateInput}T00:00:00.000Z`)) : dateOnly(new Date());
    if (Number.isNaN(day.getTime())) {
      throw new BadRequestException('Invalid pulse date. Use YYYY-MM-DD.');
    }

    let rows = await this.db.dailyPulseItem.findMany({
      where: { pulseDate: day },
      orderBy: { kind: 'asc' },
    });

    // Keep homepage populated when cron has not yet written today's slots.
    if (rows.length === 0 && requestedToday) {
      const latest = await this.db.dailyPulseItem.findFirst({
        orderBy: { pulseDate: 'desc' },
        select: { pulseDate: true },
      });
      if (latest) {
        day = dateOnly(latest.pulseDate);
        rows = await this.db.dailyPulseItem.findMany({
          where: { pulseDate: day },
          orderBy: { kind: 'asc' },
        });
      }
    }

    const items = rows.map((row) => ({
      kind: row.kind as PulseKind,
      title: row.title,
      summary: row.summary,
      imageUrl: row.imageUrl,
      linkUrl: row.linkUrl,
      sourceLabel: row.sourceLabel,
    }));

    const today = dateOnly(new Date());
    const servingToday = formatDate(day) === formatDate(today);
    if (!items.some((i) => i.kind === 'creator') && servingToday) {
      const creator = await this.fallbackCreatorOfTheDay();
      if (creator) items.push(creator);
    }

    const order: PulseKind[] = ['song', 'story', 'trend', 'creator', 'moment'];
    items.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

    return { date: formatDate(day), items };
  }

  private async fallbackCreatorOfTheDay() {
    try {
      const movers = await this.charts.getChartMovers(CHART_KEYS.GLOBAL_PERSONS);
      const top = movers.gainers[0];
      if (!top) return null;
      return {
        kind: 'creator' as const,
        title: top.display_name,
        summary: `@${top.username} moved up on the Global 100.`,
        imageUrl: top.avatar_url,
        linkUrl: `/profiles/${top.username}`,
        sourceLabel: 'editorial',
      };
    } catch {
      return null;
    }
  }

  async assembleToday() {
    const day = dateOnly(new Date());
    const job = await this.db.jobRun.create({
      data: {
        jobName: 'daily_pulse_assembly',
        status: 'running',
        startedAt: new Date(),
      },
    });

    try {
      const featured = await this.db.trendTopic.findFirst({
        where: { isFeatured: true },
        orderBy: { observedAt: 'desc' },
      });
      const song = await this.db.musicTrack.findFirst({
        orderBy: [
          { popularityScore: { sort: 'desc', nulls: 'last' } },
          { observedAt: 'desc' },
        ],
      });
      const story = await this.db.trendTopic.findFirst({
        where: { category: { in: ['news', 'technology', 'entertainment'] } },
        orderBy: [
          { popularityScore: { sort: 'desc', nulls: 'last' } },
          { observedAt: 'desc' },
        ],
      });
      const moment = await this.db.trendTopic.findFirst({
        where: { category: 'internet_culture' },
        orderBy: [
          { velocityScore: { sort: 'desc', nulls: 'last' } },
          { observedAt: 'desc' },
        ],
      });

      const slots: Array<{
        kind: PulseKind;
        title: string;
        summary: string | null;
        imageUrl: string | null;
        linkUrl: string | null;
        trendTopicId?: string;
        musicTrackId?: string;
        profileId?: string;
      }> = [];

      if (song) {
        slots.push({
          kind: 'song',
          title: `${song.title} — ${song.artist}`,
          summary: 'Editorial song of the day from the music discovery list.',
          imageUrl: song.artworkUrl,
          linkUrl: song.spotifyUrl || song.youtubeUrl || '/music',
          musicTrackId: song.id,
        });
      }
      if (story) {
        slots.push({
          kind: 'story',
          title: story.title,
          summary: story.summary,
          imageUrl: story.imageUrl,
          linkUrl: story.sourceUrl || `/trending/${story.category.replace('_', '-')}`,
          trendTopicId: story.id,
        });
      }
      if (featured) {
        slots.push({
          kind: 'trend',
          title: featured.title,
          summary: featured.summary,
          imageUrl: featured.imageUrl,
          linkUrl: featured.sourceUrl || '/trending',
          trendTopicId: featured.id,
        });
      }
      if (moment) {
        slots.push({
          kind: 'moment',
          title: moment.title,
          summary: moment.summary,
          imageUrl: moment.imageUrl,
          linkUrl: moment.sourceUrl || '/trending/internet-culture',
          trendTopicId: moment.id,
        });
      }

      try {
        const movers = await this.charts.getChartMovers(CHART_KEYS.GLOBAL_PERSONS);
        const top = movers.gainers[0];
        if (top) {
          const profile = await this.db.creatorProfile.findFirst({
            where: { igUsername: top.username },
            select: { id: true },
          });
          slots.push({
            kind: 'creator',
            title: top.display_name,
            summary: `@${top.username} moved up on the Global 100.`,
            imageUrl: top.avatar_url,
            linkUrl: `/profiles/${top.username}`,
            profileId: profile?.id,
          });
        }
      } catch {
        // Creator slot stays empty until movers exist.
      }

      for (const slot of slots) {
        await this.db.dailyPulseItem.upsert({
          where: { pulseDate_kind: { pulseDate: day, kind: slot.kind } },
          create: {
            pulseDate: day,
            kind: slot.kind,
            title: slot.title,
            summary: slot.summary,
            imageUrl: slot.imageUrl,
            linkUrl: slot.linkUrl,
            trendTopicId: slot.trendTopicId,
            musicTrackId: slot.musicTrackId,
            profileId: slot.profileId,
            sourceLabel: 'editorial',
          },
          update: {
            title: slot.title,
            summary: slot.summary,
            imageUrl: slot.imageUrl,
            linkUrl: slot.linkUrl,
            trendTopicId: slot.trendTopicId,
            musicTrackId: slot.musicTrackId,
            profileId: slot.profileId,
          },
        });
      }

      await this.db.jobRun.update({
        where: { id: job.id },
        data: {
          status: 'success',
          finishedAt: new Date(),
          stats: JSON.stringify({ slots: slots.length, date: formatDate(day) }),
        },
      });

      return this.forDate(formatDate(day));
    } catch (err) {
      await this.db.jobRun.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          error: err instanceof Error ? err.message : 'pulse assembly failed',
        },
      });
      throw err;
    }
  }
}
