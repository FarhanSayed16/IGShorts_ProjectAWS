import { isChartKey, legacyHideReason } from '@igshorts/shared';

describe('chart key allow-list', () => {
  it('accepts v1 keys only', () => {
    expect(isChartKey('global_persons')).toBe(true);
    expect(isChartKey('india_persons')).toBe(true);
    expect(isChartKey('global_brands')).toBe(false);
    expect(isChartKey('')).toBe(false);
  });
});

describe('legacy hide policy', () => {
  it('hides unofficial Ranbir fan rows', () => {
    expect(legacyHideReason('ranbirkapoorfans', 'Ranbir Kapoor fan/official')).toBeTruthy();
  });

  it('hides Danish Zehen and Avicii memorial rows', () => {
    expect(legacyHideReason('danishzehen', 'Danish Zehen')).toBeTruthy();
    expect(legacyHideReason('avicii', 'Avicii')).toBeTruthy();
  });

  it('keeps ordinary people listed', () => {
    expect(legacyHideReason('virat.kohli', 'Virat Kohli')).toBeNull();
  });
});
