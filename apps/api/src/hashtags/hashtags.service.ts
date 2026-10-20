import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class HashtagsService {
  async getTrendingTags(): Promise<never> {
    throw new NotImplementedException('Hashtag charts are a v2 feature');
  }
}
