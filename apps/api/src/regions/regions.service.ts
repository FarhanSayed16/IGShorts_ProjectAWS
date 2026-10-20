import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class RegionsService {
  async getRegions(): Promise<never> {
    throw new NotImplementedException('Regional charts are a v2 feature');
  }
}
