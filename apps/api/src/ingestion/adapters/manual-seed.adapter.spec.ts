import { ManualSeedAdapter } from './manual-seed.adapter.js';
import * as path from 'path';

describe('ManualSeedAdapter', () => {
  let adapter: ManualSeedAdapter;

  beforeEach(() => {
    adapter = new ManualSeedAdapter();
  });

  describe('normalizeUsername', () => {
    it('should strip leading @ and trim whitespace', () => {
      expect(adapter.normalizeUsername('@virat.kohli')).toBe('virat.kohli');
    });

    it('should lowercase usernames', () => {
      expect(adapter.normalizeUsername('CRISTIANO')).toBe('cristiano');
    });

    it('should fix spaced usernames like @m cstan', () => {
      expect(adapter.normalizeUsername('@m cstan')).toBe('mcstan');
    });

    it('should strip trailing slashes', () => {
      expect(adapter.normalizeUsername('leomessi/')).toBe('leomessi');
    });
  });

  describe('parseFollowerCount', () => {
    it('should convert millions float to exact BigInt', () => {
      expect(adapter.parseFollowerCount(271.2)).toBe(BigInt(271_200_000));
      expect(adapter.parseFollowerCount('686.6')).toBe(BigInt(686_600_000));
    });

    it('should return null for empty or invalid values', () => {
      expect(adapter.parseFollowerCount('')).toBeNull();
      expect(adapter.parseFollowerCount(null)).toBeNull();
      expect(adapter.parseFollowerCount(undefined)).toBeNull();
      expect(adapter.parseFollowerCount('Not captured')).toBeNull();
    });
  });

  describe('classifyEntityType', () => {
    it('should classify brands', () => {
      expect(adapter.classifyEntityType('Brand / Sportswear')).toBe('brand');
      expect(adapter.classifyEntityType('Brand / Electronics')).toBe('brand');
    });

    it('should classify teams', () => {
      expect(adapter.classifyEntityType('Sports team')).toBe('team');
      expect(adapter.classifyEntityType('Sports league')).toBe('team');
    });

    it('should classify platform', () => {
      expect(adapter.classifyEntityType('Platform / Brand', 'instagram')).toBe('platform');
      expect(adapter.classifyEntityType(null, 'instagram')).toBe('platform');
    });

    it('should classify individual creators and celebrities as person', () => {
      expect(adapter.classifyEntityType('Athlete / Cricket')).toBe('person');
      expect(adapter.classifyEntityType('Actor')).toBe('person');
      expect(adapter.classifyEntityType('Musician')).toBe('person');
      expect(adapter.classifyEntityType('Creator / Comedy')).toBe('person');
    });
  });

  describe('parseExcelFile', () => {
    it('should parse the research Excel file and verify rows', () => {
      const filePath = path.resolve(
        process.cwd(),
        '../../docs/IGshorts_Instagram_Account_Research_and_Architecture.xlsx',
      );
      const result = adapter.parseExcelFile(filePath);

      expect(result.indiaRows.length).toBe(200);
      expect(result.globalRows.length).toBe(200);
      expect(result.totalParsed).toBe(400);

      // Verify MC Stan was normalized
      const mcStan = result.indiaRows.find((r) => r.displayName.toLowerCase().includes('mc stan'));
      expect(mcStan).toBeDefined();
      expect(mcStan?.username).toBe('mcstan');

      // Verify blank follower counts are null, not 0
      const blanks = result.indiaRows.filter((r) => r.followerCount === null);
      expect(blanks.length).toBe(127);
    });
  });
});
