# UI Architecture

`src/` exposes the versioned `@busyoffice/design-system` component API.
`examples/` contains pure React compositions that demonstrate use of those
exports. `build.mjs` bundles browser ESM and compiles StyleX CSS into `dist/`.

The package has no dependency on Busy Office ERP business applications, the
platform runtime, or a host database. React remains a peer dependency so each
host controls its React runtime.
