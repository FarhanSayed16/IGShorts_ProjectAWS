import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class ScoringService {
  async calculateScore(): Promise<never> {
    throw new NotImplementedException('scoring_v2 is not enabled in v1');
  }
}
