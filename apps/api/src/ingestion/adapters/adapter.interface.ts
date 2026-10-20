export interface IngestionResult {
  username: string;
  displayName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  followerCount?: bigint | null;
  observedAt: Date;
  sourceCode: string;
}

export interface IngestionAdapter {
  readonly code: string;
  fetchProfileData(username: string): Promise<IngestionResult>;
  fetchBatch(usernames: string[]): Promise<IngestionResult[]>;
}
