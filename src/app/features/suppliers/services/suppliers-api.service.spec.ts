import { describe, it, expect } from 'vitest';

import { filterSuppliersByName } from './suppliers-api.service';

describe('filterSuppliersByName', () => {
  const rows = [
    { id: '1', name: 'Alpha Supplies' },
    { id: '2', name: 'Beta Corp' },
    { id: '3', name: 'alpha lowercase' }
  ];

  it('returns all rows when filter is empty or whitespace', () => {
    expect(filterSuppliersByName(rows, '')).toEqual(rows);
    expect(filterSuppliersByName(rows, '   ')).toEqual(rows);
    expect(filterSuppliersByName(rows, undefined)).toEqual(rows);
  });

  it('filters case-insensitively on name', () => {
    expect(filterSuppliersByName(rows, 'alpha')).toEqual([rows[0], rows[2]]);
    expect(filterSuppliersByName(rows, 'BETA')).toEqual([rows[1]]);
  });
});
