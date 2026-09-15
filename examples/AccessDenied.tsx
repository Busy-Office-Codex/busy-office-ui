import { Button } from '../src/index.js';
import { EntryScreen } from './entryScreenLayout.js';

/**
 * ROADMAP M7's ERP reference-app initiative, Slice 8 (Entry/nav) — standalone, pre-shell screen
 * mounted at `#access-denied`, same precedent as `#login`. Also the honest landing spot for any
 * link into a module a viewer's role doesn't grant (see Users.tsx's own real "Preview access"
 * module chips, Slice 4) — this is what actually clicking a denied module would show.
 */
export function AccessDenied() {
  return (
    <EntryScreen
      tone="danger"
      title="You don't have access"
      message="Your role doesn't include this module. If you need it for your work, ask your administrator to grant access — see Administration → Users for who's assigned what."
      actions={
        <Button type="button" variant="primary" onClick={() => (window.location.hash = '#login')}>
          Back to sign in
        </Button>
      }
    />
  );
}
