import { Controller, Get } from '@nestjs/common';
import { HashtagsService } from './hashtags.service.js';

@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get()
  getTrending() {
    return this.hashtagsService.getTrendingTags();
  }
}
