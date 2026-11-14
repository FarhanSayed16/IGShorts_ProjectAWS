import { Controller, Get, Query } from '@nestjs/common';
import { VisitDiffService } from './visit-diff.service.js';

@Controller('visit-diff')
export class VisitDiffController {
  constructor(private readonly visitDiff: VisitDiffService) {}

  @Get()
  since(@Query('since') since?: string) {
    return this.visitDiff.since(since || new Date(0).toISOString());
  }
}
