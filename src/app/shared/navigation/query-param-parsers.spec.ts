import { describe, it, expect } from 'vitest';
import { parseOptionalEnumScalarParam, parseStringEnumTab } from './query-param-parsers';

enum TestTab {
  Overview = 'overview',
  Orders = 'orders',
}

describe('query-param-parsers', () => {
  describe('parseOptionalEnumScalarParam', () => {
    it('returns parsed number when allowed', () => {
      expect(parseOptionalEnumScalarParam('1', [0, 1, 2])).toBe(1);
    });

    it('returns null when invalid or not allowed', () => {
      expect(parseOptionalEnumScalarParam('5', [0, 1, 2])).toBeNull();
      expect(parseOptionalEnumScalarParam(null, [0, 1, 2])).toBeNull();
      expect(parseOptionalEnumScalarParam('', [0, 1, 2])).toBeNull();
    });
  });

  describe('parseStringEnumTab', () => {
    it('matches valid tab values', () => {
      expect(parseStringEnumTab(TestTab, 'overview')).toBe(TestTab.Overview);
      expect(parseStringEnumTab(TestTab, 'orders')).toBe(TestTab.Orders);
    });

    it('returns null for unknown or null values', () => {
      expect(parseStringEnumTab(TestTab, null)).toBeNull();
      expect(parseStringEnumTab(TestTab, 'unknown')).toBeNull();
      expect(parseStringEnumTab(TestTab, 123)).toBeNull();
    });

    it('maps legacy aliases onto canonical tab values', () => {
      expect(parseStringEnumTab(TestTab, 'legacy', { legacy: TestTab.Orders })).toBe(
        TestTab.Orders,
      );
      expect(parseStringEnumTab(TestTab, '', { '': TestTab.Overview })).toBe(TestTab.Overview);
    });
  });
});
