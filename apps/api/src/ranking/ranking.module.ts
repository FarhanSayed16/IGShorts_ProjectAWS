import { Module } from '@nestjs/common';
import { ScoringV2Engine } from './algorithms/scoring-v2.engine.js';
import { RankingService } from './ranking.service.js';

@Module({
  providers: [RankingService, ScoringV2Engine],
  exports: [RankingService],
})
export class RankingModule {}
