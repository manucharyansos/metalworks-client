# Workspace branding and dashboard — 2026-10-07

The login and registration pages share `components/auth/WorkspaceBranding.vue`.
It displays the real MetalWorks logo and the localized work-platform title,
above the form on mobile and next to the form on desktop. Promotional text and
feature tiles have been removed from this area.

Additional companies can be added to `config/workspace-brands.js` with a unique
`id`, `name`, and `logo` path relative to `static/`. The same list is used by
both pages. Logos use a wrapping grid, preserve their aspect ratios, and resolve
against the router base, including the production `/work/` base.

The admin summary contains four cards:

| Label (HY) | API field |
| --- | --- |
| Ստեղծված առաջադրանքներ | `total_orders` |
| Ուշացված առաջադրանքներ | `overdue_orders` |
| Հաստատման սպասող | `awaiting_admin_confirmation` |
| Ավարտված | `completed_orders` |

The created-tasks card displays all created orders, with the current active
count in its description. Due-today, unassigned, no-deadline, and production
network summary cards are removed. Their detailed filters and production data
remain available below. Skeleton loading also uses four cards. New copy is
provided in HY/RU/EN.

The dashboard heading's help tooltip is aligned inward so its hidden content
does not create horizontal page scrolling on small screens.

## Branch audit

Client master baseline: `cf3e06042a65d9e68826d315d3f4a33ff0cdbcbb`.
Server master baseline: `6eda7662d8c6ba4a8a2a65caaefbd1b991dc16e2`.

All remote branches in both repositories were compared with master. Historical
functional branches largely have equivalent or newer code in master through
squash commits. In particular, employee permission UI, server permission scopes,
role-change cleanup, identity, factory file policy, production status actions,
and CAD model previews are present. The backend feature files match the relevant
historical branch snapshots, with newer safeguards in the permission controller.
No backend update or migration is needed for this change.

The DXF localization from `final-dxf-i18n-cleanup-20260929` had been overwritten
when the earlier employee UI was restored. This change restores just that
component's localized labels and fallback errors; it does not restore an old
workspace layout or replace newer order/file behavior.

Documentation-only historical branches add no missing runtime behavior.
Dependabot proposals remain separate dependency work; the Tailwind and vue-i18n
major upgrades do not belong to this Nuxt 2 / Vue 2 interface change.

Production is distributed as the generated static `/work/` bundle. Extract the
deploy archive directly into the server's `work/` directory.
