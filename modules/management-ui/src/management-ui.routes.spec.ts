import { describe, expect, it } from 'vitest';

import { MANAGEMENT_UI_ROUTES } from './management-ui.routes';

describe('management-ui routes', () => {
  it('contains dedicated global error routes', () => {
    const paths = MANAGEMENT_UI_ROUTES.map((route) => route.path);
    expect(paths).toContain('not-found');
    expect(paths).toContain('internal-error');
    expect(paths).toContain('service-unavailable');
  });

  it('redirects unknown paths to not-found', () => {
    const wildcard = MANAGEMENT_UI_ROUTES.find((route) => route.path === '**');
    expect(wildcard?.redirectTo).toBe('not-found');
  });

  it('contains base dashboard layout with feature child routes', () => {
    const baseLayout = MANAGEMENT_UI_ROUTES.find((route) => route.path === '');
    expect(baseLayout).toBeDefined();
    expect(baseLayout?.loadComponent).toBeDefined();

    const childPaths = (baseLayout?.children ?? []).map((route) => route.path);
    expect(childPaths).toContain('');
    expect(childPaths).toContain('products');
    expect(childPaths).toContain('orders');
    expect(childPaths).toContain('returns');
    expect(childPaths).toContain('invoices');
    expect(childPaths).toContain('procurement');
    expect(childPaths).toContain('suppliers');
    expect(childPaths).toContain('receivables');
    expect(childPaths).toContain('payables');
    expect(childPaths).toContain('customers');
  });
});
