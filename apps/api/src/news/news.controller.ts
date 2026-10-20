import { Controller, Get } from '@nestjs/common';
import { NewsService } from './news.service.js';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getFeed() {
    return this.newsService.getNewsFeed();
  }
}
