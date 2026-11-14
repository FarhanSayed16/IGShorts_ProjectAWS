import { Module } from '@nestjs/common';
import { ChartsModule } from '../charts/charts.module.js';
import { PulseController } from './pulse.controller.js';
import { PulseService } from './pulse.service.js';

@Module({
  imports: [ChartsModule],
  controllers: [PulseController],
  providers: [PulseService],
  exports: [PulseService],
})
export class PulseModule {}
