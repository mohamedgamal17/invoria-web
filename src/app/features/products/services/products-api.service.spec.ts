import { describe, it, expect } from 'vitest';

import type { Product } from '../models/product.entity';
import { filterProductsByName } from './products-api.service';

describe('filterProductsByName', () => {
  const rows: Product[] = [
    {
      id: '1',
      name: 'Alpha Widget',
      price: 10,
      stock: {
        actualQuantity: 0,
        reservedQuantity: 0
      },
      createdAt: ''
    },
    {
      id: '2',
      name: 'Beta',
      price: 5,
      stock: {
        actualQuantity: 0,
        reservedQuantity: 0
      },
      createdAt: ''
    }
  ];

  it('returns all rows when filter is empty or whitespace', () => {
    expect(filterProductsByName(rows, '')).toEqual(rows);
    expect(filterProductsByName(rows, '   ')).toEqual(rows);
    expect(filterProductsByName(rows, undefined)).toEqual(rows);
  });

  it('filters case-insensitively on name', () => {
    expect(filterProductsByName(rows, 'alpha')).toEqual([rows[0]]);
    expect(filterProductsByName(rows, 'beta')).toEqual([rows[1]]);
    expect(filterProductsByName(rows, 'widget')).toEqual([rows[0]]);
  });
});
