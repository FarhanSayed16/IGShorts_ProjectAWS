import { Module } from '@nestjs/common';
import { HashtagsController } from './hashtags.controller.js';
import { HashtagsService } from './hashtags.service.js';

@Module({
  controllers: [HashtagsController],
  providers: [HashtagsService],
  exports: [HashtagsService],
})
export class HashtagsModule {}
