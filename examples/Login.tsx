import { useState } from 'react';
import { Button, Card, Input, Text } from '../src/index.js';
import { color } from '../src/tokens.stylex.js';

/**
 * A two-column sign-in screen: an auth form (workspace switcher, email +
 * password, a "Continue with SSO" alternative, and a remember-this-device
 * row) beside a brand panel. Mirrors the fuller "01 Login — Centered auth
 * form + brand panel" screen from `templates/erp-skeleton`'s reference,
 * replacing the simpler single-column form this file used to track against
 * the standalone `templates/login` template (ROADMAP M6, issue #17) — one
 * login example, not two.
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexWrap: 'wrap',
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          flex: '1 1 420px',
          minWidth: 320,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 32,
        }}
      >
        {/* Workspace switcher — a plain, non-interactive label, same "Acme Co ▾" text and
            reasoning as AppShell.tsx's own brand-slot span: the real `Dropdown` component is for
            filter/menu semantics (an array `items` prop, real open/close state), not a static
            switcher with nothing to switch to on a sample page. */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
            }}
          >
            Acme Co <span aria-hidden="true" style={{ color: '#94a3b8' }}>▾</span>
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text variant="heading">Busy Office</Text>
                <Text variant="body">Sign in to your workspace</Text>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input
                  label="Work email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {/* A real link (`#password-reset`, wired in preview/client.tsx's `App`), not inert
                  caption text — Slice 8 (Entry/nav) gave this a real destination. */}
              <a href="#password-reset" style={{ fontSize: 12.5, color: '#475569' }}>
                Forgot your password?
              </a>

              {/* MFA / remember-this-device row — a real, controlled native checkbox (same
                  bare-native-input pattern ListReport.tsx's row-selection checkboxes use, not a
                  new `Checkbox` export this package has no second consumer to justify), wrapped
                  in a `<label>` the way Input.tsx composes its own field + caption. */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                />
                <Text variant="caption" as="span">
                  Remember this device — skip the verification code for 30 days
                </Text>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button variant="primary" style={{ width: '100%' }}>
                  Continue
                </Button>
                <Button variant="secondary" style={{ width: '100%' }}>
                  Continue with SSO
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Brand panel — a plain decorative block, no illustration asset in this repo (there are
          none to reach for). Same solid-fill-rounded-rect treatment as AppShell.tsx's own brand
          mark div, scaled up and inverted (light mark on a dark fill, rather than dark-on-light),
          plus the `Busy Office` wordmark/tagline in `color.textOnInk` — the same token `Button`'s
          own `primary` variant uses for text on its dark fill, since `Text`'s variants always
          render `color.textPrimary` (near-black) and can't be pointed at a dark background. */}
      <div
        style={{
          flex: '1 1 420px',
          minWidth: 320,
          minHeight: 320,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: 48,
          background: color.textPrimary,
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: 18, background: color.textOnInk }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: color.textOnInk }}>Busy Office</span>
          <span style={{ fontSize: 15, color: color.textDisabled, maxWidth: 320 }}>
            One workspace for sales, purchasing, finance and BI — built for teams that move fast.
          </span>
        </div>
      </div>
    </div>
  );
}
