import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Docs site for @busyoffice/design-system (ROADMAP item 15). Consumes the
// built package like any external host — see docs-site/README notes in the
// build handoff for the two example screens (Launcher, Dashboard) that fall
// back to a workspace-relative import because they have no package.json
// export subpath yet.
export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      fs: {
        // Content collections read docs/*.md and the patterns pages read
        // examples/*.tsx from the parent package directory, outside this
        // project's root.
        allow: ['..'],
      },
    },
  },
});
