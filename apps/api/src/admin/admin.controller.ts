import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ADMIN_ROLES, ChartKey } from '@igshorts/shared';
import { FastifyRequest } from 'fastify';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { IngestionService } from '../ingestion/ingestion.service.js';
import { WikipediaEnrichmentService } from '../ingestion/wikipedia.enrichment.js';
import { RankingService } from '../ranking/ranking.service.js';
import { StorageService } from '../storage/storage.service.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ingestionService: IngestionService,
    private readonly rankingService: RankingService,
    private readonly storageService: StorageService,
    private readonly wikipediaEnrichment: WikipediaEnrichmentService,
  ) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('watchlist')
  async getWatchlist(@Query() query: PaginationQueryDto) {
    return this.adminService.getWatchlist({
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
      q: query.q,
      category: query.category,
      entityType: query.entityType,
      scope: query.scope,
      isListed: query.isListed !== undefined ? query.isListed === 'true' : undefined,
    });
  }

  @Post('watchlist')
  @Roles(ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR)
  async createProfile(
    @Req() request: FastifyRequest,
    @Body()
    body: {
      igUsername: string;
      displayName: string;
      category?: string;
      countryRegion?: string;
      entityType?: string;
      scopes?: string[];
    },
  ) {
    return this.adminService.createProfile(body, request.adminUser?.email);
  }

  @Patch('watchlist/:id')
  @Roles(ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR)
  async updateProfile(
    @Req() request: FastifyRequest,
    @Param('id') id: string,
    @Body()
    body: {
      displayName?: string;
      category?: string;
      countryRegion?: string;
      entityType?: string;
      isListed?: boolean;
      scopes?: string[];
    },
  ) {
    return this.adminService.updateProfile(id, body, request.adminUser?.email);
  }

  @Patch('watchlist/:id/toggle')
  @Roles(ADMIN_ROLES.ADMIN, ADMIN_ROLES.EDITOR)
  async toggleListed(@Param('id') id: string, @Body() body: { isListed: boolean }) {
    return this.adminService.toggleListed(id, body.isListed);
  }

  @Post('watchlist/:id/editorial-metric')
  @Roles(ADMIN_ROLES.ADMIN)
  async recordEditorialMetric(
    @Param('id') id: string,
    @Body() body: { followerCount: number; note: string },
  ) {
    return this.adminService.recordEditorialMetric(id, body);
  }

  @Post('import')
  @Roles(ADMIN_ROLES.ADMIN)
  async runImport(@Req() request: FastifyRequest, @Body() body?: { filePath?: string }) {
    return this.ingestionService.importSeedWatchlist(
      body?.filePath,
      request.adminUser?.email || 'admin',
    );
  }

  @Post('import/upload')
  @Roles(ADMIN_ROLES.ADMIN)
  async uploadImport(@Req() request: FastifyRequest) {
    const file = await (
      request as FastifyRequest & {
        file: () => Promise<{ filename?: string; toBuffer: () => Promise<Buffer> } | undefined>;
      }
    ).file();
    if (!file) {
      return this.ingestionService.importSeedWatchlist(
        undefined,
        request.adminUser?.email || 'admin',
      );
    }
    const buffer = await file.toBuffer();
    const saved = await this.storageService.saveFile(file.filename || 'seed.xlsx', buffer);
    return this.ingestionService.importSeedWatchlist(saved, request.adminUser?.email || 'admin');
  }

  @Post('ingestion/sync')
  @Roles(ADMIN_ROLES.ADMIN)
  async syncIngestion(@Body() body?: { usernames?: string[] }) {
    return this.ingestionService.syncProfiles(body?.usernames);
  }

  @Post('enrichment/wikipedia')
  @Roles(ADMIN_ROLES.ADMIN)
  async enrichWikipedia() {
    return this.wikipediaEnrichment.enrichListedPeople();
  }

  @Post('ranking/rebuild')
  @Roles(ADMIN_ROLES.ADMIN)
  async rebuildRankings(@Body() body?: { chartKey?: ChartKey }) {
    if (body?.chartKey) {
      return this.rankingService.runRankingForChart(body.chartKey);
    }
    return this.rankingService.rebuildAllCharts();
  }

  @Get('ranking/runs')
  async getRankingRuns() {
    return this.adminService.getRecentRankingRuns();
  }

  @Get('jobs')
  async getJobRuns() {
    return this.adminService.getRecentJobRuns();
  }

  @Get('audit')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
