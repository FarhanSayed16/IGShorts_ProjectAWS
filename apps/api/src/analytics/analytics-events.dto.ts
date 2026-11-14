import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export const ANALYTICS_EVENT_TYPES = [
  'page_view',
  'profile_view',
  'chart_view',
  'music_preview',
  'search',
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export class CreateAnalyticsEventDto {
  @IsString()
  @IsIn([...ANALYTICS_EVENT_TYPES])
  eventType!: AnalyticsEventType;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  path?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  anonId?: string;
}
