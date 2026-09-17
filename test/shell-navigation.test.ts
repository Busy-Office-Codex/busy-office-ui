import { beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
let shell: typeof import('../src/shell/index.js');

beforeAll(async () => {
  execFileSync(process.execPath, ['build.mjs'], { cwd: packageDirectory, stdio: 'inherit' });
  shell = await import(/* @vite-ignore */ new URL('../dist/shell.js', import.meta.url).href);
});

describe('Shell navigation contract', () => {
  it('exports the shell and its bounds from the shell subpath', () => {
    expect(typeof shell.Shell).toBe('function');
    expect(shell.SHELL_MAX_ROUTES).toBe(64);
  });

  it('accepts host-defined module names', () => {
    expect(shell.validateShellNavigation({
      routes: [{ id: 'jobs', module: 'Field service', label: 'Jobs' }],
      activeRouteId: 'jobs',
    })).toEqual([]);
  });

  it('rejects duplicate ids, duplicate screens, empty modules and an unknown active route', () => {
    expect(shell.validateShellNavigation({
      routes: [
        { id: 'orders', module: 'Purchase', label: 'Purchase orders' },
        { id: 'orders', module: 'Sales', label: 'Sales order' },
        { id: 'orders-2', module: 'Purchase', label: 'Purchase orders' },
        { id: 'blank', module: '', label: 'Blank' },
      ],
      activeRouteId: 'missing',
    })).toEqual([
      'Duplicate route id: orders',
      'Duplicate route screen: Purchase/Purchase orders',
      'Route module must not be empty: blank',
      'Unknown active route id: missing',
    ]);
  });

  it('rejects a registry larger than the bound', () => {
    const routes = Array.from({ length: 65 }, (_, index) => ({ id: `route-${index}`, module: 'Purchase', label: `Screen ${index}` }));
    expect(shell.validateShellNavigation({ routes, activeRouteId: 'route-0' })).toContain('Route registry exceeds 64 entries.');
  });
});
