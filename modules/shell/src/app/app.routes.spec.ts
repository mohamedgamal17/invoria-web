import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

describe('app routes', () => {
  it('delegates root path to management-ui module', () => {
    const rootRoute = routes.find((route) => route.path === '');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.loadChildren).toBeDefined();
  });
});
