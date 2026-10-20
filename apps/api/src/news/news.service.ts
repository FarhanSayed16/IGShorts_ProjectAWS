import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class NewsService {
  async getNewsFeed(): Promise<never> {
    throw new NotImplementedException('News is a v2 feature');
  }
}
