import { Controller, Get } from '@nestjs/common';
import { ScoringService } from './scoring.service.js';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get()
  status() {
    return this.scoringService.calculateScore();
  }
}
