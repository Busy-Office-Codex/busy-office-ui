import { Button } from '../src/index.js';
import { EntryScreen } from './entryScreenLayout.js';

/**
 * ROADMAP M7's ERP reference-app initiative, Slice 8 (Entry/nav) — standalone, pre-shell screen
 * mounted at `#404`, same precedent as `#login`.
 */
export function NotFound() {
  return (
    <EntryScreen
      code="404"
      tone="neutral"
      title="Page not found"
      message="The page you're looking for doesn't exist, or may have moved. Check the link, or head back to your workspace."
      actions={
        <Button type="button" variant="primary" onClick={() => (window.location.hash = '')}>
          Back to workspace
        </Button>
      }
    />
  );
}
