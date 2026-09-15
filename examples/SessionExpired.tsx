import { Button } from '../src/index.js';
import { EntryScreen } from './entryScreenLayout.js';

/**
 * ROADMAP M7's ERP reference-app initiative, Slice 8 (Entry/nav) — standalone, pre-shell screen
 * mounted at `#session-expired`, same precedent as `#login`.
 */
export function SessionExpired() {
  return (
    <EntryScreen
      tone="neutral"
      title="Session expired"
      message="You've been signed out after a period of inactivity. Sign back in to pick up where you left off — nothing unsaved is lost."
      actions={
        <Button type="button" variant="primary" onClick={() => (window.location.hash = '#login')}>
          Sign in again
        </Button>
      }
    />
  );
}
