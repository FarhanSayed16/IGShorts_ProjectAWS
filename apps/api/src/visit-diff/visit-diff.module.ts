import { Module } from '@nestjs/common';
import { ChartsModule } from '../charts/charts.module.js';
import { VisitDiffController } from './visit-diff.controller.js';
import { VisitDiffService } from './visit-diff.service.js';

@Module({
  imports: [ChartsModule],
  controllers: [VisitDiffController],
  providers: [VisitDiffService],
  exports: [VisitDiffService],
})
export class VisitDiffModule {}
