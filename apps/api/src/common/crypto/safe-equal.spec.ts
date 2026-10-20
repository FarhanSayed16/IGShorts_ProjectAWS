import { safeEqual } from './safe-equal.js';

describe('safeEqual', () => {
  it('accepts identical strings', () => {
    expect(safeEqual('abc123', 'abc123')).toBe(true);
  });

  it('rejects different values of the same length', () => {
    expect(safeEqual('abc123', 'abc124')).toBe(false);
  });

  it('rejects different lengths', () => {
    expect(safeEqual('short', 'longer-secret')).toBe(false);
  });
});
