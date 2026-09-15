import { Button } from '../src/index.js';
import { EntryScreen } from './entryScreenLayout.js';

/**
 * ROADMAP M7's ERP reference-app initiative, Slice 8 (Entry/nav) — standalone, pre-shell screen
 * mounted at `#account-locked` (see preview/client.tsx's `App`), same precedent as `#login`: a
 * real host shows this before Shell ever mounts, so it isn't one of `routes`.
 */
export function AccountLocked() {
  return (
    <EntryScreen
      tone="warn"
      title="Account locked"
      message="Too many failed sign-in attempts. For your security, this account is locked for 15 minutes, or until an administrator unlocks it."
      actions={
        <>
          <Button type="button" variant="primary" onClick={() => (window.location.hash = '#login')}>
            Back to sign in
          </Button>
          {/* A real `mailto:` link, not a second button that would silently do the same thing as
              the one above under a different label — this app has no admin-contact flow to send
              it to, but the browser's own mail handoff is a genuine, working action. */}
          <a
            href="mailto:admin@acme.example?subject=Account%20locked"
            style={{ fontSize: 13.5, color: '#475569', textAlign: 'center' }}
          >
            Contact your administrator
          </a>
        </>
      }
    />
  );
}
