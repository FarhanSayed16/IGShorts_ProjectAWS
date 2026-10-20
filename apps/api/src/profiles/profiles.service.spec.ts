import { ProfilesService } from './profiles.service.js';

describe('ProfilesService', () => {
  let service: ProfilesService;
  const mockDb: any = {};

  beforeEach(() => {
    service = new ProfilesService(mockDb);
  });

  describe('normalizeUsername', () => {
    it('should strip leading @ from username', () => {
      expect(service.normalizeUsername('@virat.kohli')).toBe('virat.kohli');
    });

    it('should lowercase usernames', () => {
      expect(service.normalizeUsername('CRISTIANO')).toBe('cristiano');
    });

    it('should trim surrounding whitespace', () => {
      expect(service.normalizeUsername('  @leomessi  ')).toBe('leomessi');
    });
  });
});
