import { Controller, Get, Param } from '@nestjs/common';
import { PulseService } from './pulse.service.js';

@Controller('pulse')
export class PulseController {
  constructor(private readonly pulse: PulseService) {}

  @Get('today')
  today() {
    return this.pulse.forDate();
  }

  @Get(':date')
  byDate(@Param('date') date: string) {
    return this.pulse.forDate(date);
  }
}
