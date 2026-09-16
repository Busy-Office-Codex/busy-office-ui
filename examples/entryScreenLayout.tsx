import type { ReactNode } from 'react';
import { Card, Text } from '../src/index.js';
import { color, space } from '../src/tokens.stylex.js';

/**
 * A centered message-card layout shared by the standalone pre-auth/error screens (ROADMAP M7's
 * ERP reference-app initiative, Slice 8, Entry/nav) — AccountLocked/SessionExpired/AccessDenied/
 * NotFound all render the exact same shape (a status mark, a title, a message, one or two real
 * actions), differing only in copy and tone. Internal to `examples/`, not a package export —
 * same category as `examples/filterTabs.tsx`/`checkboxStyles.ts` (real, proven reuse across
 * several screens; not a speculative single-caller abstraction).
 */

export type EntryScreenTone = 'neutral' | 'warn' | 'danger';

const TONE_COLOR: Record<EntryScreenTone, string> = {
  neutral: color.textTertiary,
  // amber — one-off warn tone, no semantic token for it (distinct shade/purpose from
  // Launcher.tsx's favorited-star amber, so not a proven shared concept worth a token yet)
  warn: '#b45309',
  danger: color.danger,
};

export function EntryScreen({
  code,
  tone = 'neutral',
  title,
  message,
  actions,
}: {
  code?: string;
  tone?: EntryScreenTone;
  title: string;
  message: string;
  actions: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: color.bgCanvas,
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: space.space8,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.space4, alignItems: 'center', textAlign: 'center' }}>
            {code ? (
              <span aria-hidden="true" style={{ fontSize: 40, fontWeight: 700, color: TONE_COLOR[tone], letterSpacing: '-0.02em' }}>
                {code}
              </span>
            ) : (
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 14, background: TONE_COLOR[tone] }} />
            )}
            <Text variant="title">{title}</Text>
            <Text variant="body">{message}</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.space2, width: '100%', marginTop: space.space2 }}>{actions}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
