import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

describe('app routes', () => {
  it('contains dedicated global error routes', () => {
    const paths = routes.map((r) => r.path);
    expect(paths).toContain('not-found');
    expect(paths).toContain('internal-error');
    expect(paths).toContain('service-unavailable');
  });

  it('redirects unknown paths to not-found', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard?.redirectTo).toBe('not-found');
  });
});

