import { beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
let validateAppShellNavigation: typeof import('../examples/AppShell.js').validateAppShellNavigation;

async function loadNavigationModel() {
  execFileSync(process.execPath, ['build.mjs'], { cwd: packageDirectory, stdio: 'inherit' });
  ({ validateAppShellNavigation } = await import(/* @vite-ignore */ new URL('../dist/examples/app-shell.js', import.meta.url).href));
}

beforeAll(loadNavigationModel);

describe('AppShell preview navigation model', () => {
  it('rejects duplicate route identities and an unknown selected route', async () => {
    expect(validateAppShellNavigation({
      routes: [
        { id: 'orders', module: 'Purchase', label: 'Purchase orders' },
        { id: 'orders', module: 'Sales', label: 'Sales order' },
      ],
      activeRouteId: 'missing',
    })).toEqual(['Duplicate route id: orders', 'Unknown active route id: missing']);
  });

  it('accepts a bounded host route list with a selected identity', async () => {
    expect(validateAppShellNavigation({
      routes: [{ id: 'orders', module: 'Purchase', label: 'Purchase orders' }],
      activeRouteId: 'orders',
    })).toEqual([]);
  });

  it('rejects unsafe or ambiguous dynamic registry entries', async () => {
    expect(validateAppShellNavigation({
      routes: [
        { id: 'orders', module: 'Purchase', label: 'Purchase orders' },
        { id: 'orders-detail', module: 'Purchase', label: 'Purchase orders' },
        { id: 'unknown', module: 'Unknown module' as never, label: 'Unknown' },
      ],
      activeRouteId: 'orders',
    })).toEqual(['Duplicate route screen: Purchase/Purchase orders', 'Unsupported route module: Unknown module']);
  });

  it('rejects a registry larger than the retained-preview bound', async () => {
    const routes = Array.from({ length: 41 }, (_, index) => ({ id: `route-${index}`, module: 'Purchase' as const, label: `Screen ${index}` }));
    expect(validateAppShellNavigation({ routes, activeRouteId: 'route-0' })).toContain('Route registry exceeds 40 entries.');
  });
});
