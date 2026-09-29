# Branch reconciliation — 2026-09-29

This document records the full branch audit against `master` for both MetalWorks repositories.

## Client functional branches already represented in master

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

Examples of the corresponding master work include role-specific production workspaces, permission UI, source-level HY/RU/EN cleanup, workspace identity, production status flow, employee activity UI, and factory-aware engineer uploads.

## Client functional branch that was really missing

- `final-dxf-i18n-cleanup-20260929` — the final DXF viewer HY/RU/EN labels and fallback error strings were missing from `master` during the audit. It was merged through PR #16. Master now contains that change.

## Server branches

All functional server branches were checked. Their effective changes are already represented in current `master`:

- `admin-activity-audit-v2`
- `admin-activity-staff-only`
- `final-master-reconcile-20260929`
- `manager-factory-workflow-fix`
- `manager-production-access`
- `permission-role-change-cleanup`
- `permission-scope-redesign`
- `security-hardening/server`
- `show-user-identity-in-workspaces`

The server master includes the employee activity audit, staff-only filtering, role-aware permissions, role-change cleanup, signed-in identity endpoint, production access guards, and the read-only factory file policy endpoint used by the engineer workspace.

## Dependency bot branches intentionally not merged as feature work

These are automated dependency proposals, not unfinished application features:

- `dependabot/npm_and_yarn/core-js-3.50.0`
- `dependabot/npm_and_yarn/postcss-8.5.26`
- `dependabot/npm_and_yarn/prettier-3.9.6`
- `dependabot/npm_and_yarn/tailwindcss-4.3.3`
- `dependabot/npm_and_yarn/vue-i18n-11.4.8`

The Tailwind and vue-i18n proposals are major-version changes that are not drop-in compatible with this Nuxt 2 / Vue 2 application. These dependency migrations must be tested separately and must not be mixed into production feature reconciliation.

## Rule for future work

Feature work should be merged to `master` only after CI succeeds. When a temporary branch is superseded by a later squash merge, this document should be updated instead of re-merging stale code into production.
