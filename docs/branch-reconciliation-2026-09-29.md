# Branch reconciliation — 2026-09-29

This document records the branch audit performed against `master`.

## Functional branches already represented in master

The following branches contain work that was already merged or superseded in `master` (often through squash merges, so GitHub may still show their original commits as `ahead` even though the effective functionality exists in newer master commits):

- `admin-activity-audit-v2`
- `factory-workspace-ux-fix`
- `final-master-reconcile-20260929`
- `fix/admin-settings-i18n-password-visibility`
- `global-ui-language-cleanup`
- `i18n/full-site-3lang`
- `manager-factory-access-fix`
- `permission-scope-redesign`
- `security-hardening/client`
- `show-user-identity-in-workspaces`
- `unify-workspaces-with-admin-ui`

## Functional branch with a real missing change

- `final-dxf-i18n-cleanup-20260929` — the final DXF viewer HY/RU/EN labels and error strings were not yet present in `master`. This is being merged as part of the reconciliation.

## Dependency bot branches intentionally not merged as feature work

These are automated dependency proposals, not unfinished application features:

- `dependabot/npm_and_yarn/core-js-3.50.0`
- `dependabot/npm_and_yarn/postcss-8.5.26`
- `dependabot/npm_and_yarn/prettier-3.9.6`
- `dependabot/npm_and_yarn/tailwindcss-4.3.3`
- `dependabot/npm_and_yarn/vue-i18n-11.4.8`

The Tailwind and vue-i18n proposals are major-version changes that are not drop-in compatible with this Nuxt 2 / Vue 2 application. They must be handled as a separate dependency migration and must not be mixed into production feature reconciliation.
