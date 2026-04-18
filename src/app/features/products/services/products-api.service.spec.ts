import { describe, it, expect } from 'vitest';

import type { Product } from '../models/product.entity';
import { filterProductsByNameOrCode } from './products-api.service';

describe('filterProductsByNameOrCode', () => {
  const rows: Product[] = [
    {
      id: '1',
      name: 'Alpha Widget',
      code: 'AW-1',
      price: 10,
      actualQuantity: 0,
      reservedQuantity: 0,
      createdAt: ''
    },
    {
      id: '2',
      name: 'Beta',
      code: 'ZZ-99',
      price: 5,
      actualQuantity: 0,
      reservedQuantity: 0,
      createdAt: ''
    }
  ];

  it('returns all rows when filter is empty or whitespace', () => {
    expect(filterProductsByNameOrCode(rows, '')).toEqual(rows);
    expect(filterProductsByNameOrCode(rows, '   ')).toEqual(rows);
    expect(filterProductsByNameOrCode(rows, undefined)).toEqual(rows);
  });

  it('filters case-insensitively on name or code', () => {
    expect(filterProductsByNameOrCode(rows, 'alpha')).toEqual([rows[0]]);
    expect(filterProductsByNameOrCode(rows, 'ZZ-99')).toEqual([rows[1]]);
    expect(filterProductsByNameOrCode(rows, 'widget')).toEqual([rows[0]]);
  });
});
