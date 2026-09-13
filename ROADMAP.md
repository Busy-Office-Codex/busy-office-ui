# UI framework roadmap

The initial extraction preserves the accepted shell keyboard entry/focus-return
behavior and existing package exports. It does not promote preview APIs to a
production SDK contract.

1. Complete shared dialog accessibility and command-palette focus containment,
   with keyboard, dismissal, focus-return and narrow-layout browser evidence.
2. Define a minimal reusable shell API for registered pages, navigation, content
   slots and state lifecycle. Extract the shell from examples deliberately;
   examples and the ERP host consume the same reviewed interface.
3. Prove the framework with the existing Purchase Orders and Sales sample pages;
   coordinate public API changes and exact tested commits with the core session.
4. Add shared components only for an established reusable need. Keep business
   rules, real data/permissions and engine/runtime implementations outside UI.

Each increment needs an acceptance-to-test mapping and independent review. Stop
framework expansion once the agreed consumer scenarios work; avoid a generic page
builder or broad component catalogue without an approved product requirement.
