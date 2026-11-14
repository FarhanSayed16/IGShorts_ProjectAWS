import { parseQueryInt } from './parse-query-int.js';

describe('parseQueryInt', () => {
  it('returns fallback for missing or invalid values', () => {
    expect(parseQueryInt(undefined, 24)).toBe(24);
    expect(parseQueryInt('', 24)).toBe(24);
    expect(parseQueryInt('abc', 24)).toBe(24);
    expect(parseQueryInt('NaN', 8)).toBe(8);
  });

  it('parses finite integers', () => {
    expect(parseQueryInt('12', 24)).toBe(12);
    expect(parseQueryInt('12.9', 24)).toBe(12);
    expect(parseQueryInt('0', 24)).toBe(0);
  });
});
