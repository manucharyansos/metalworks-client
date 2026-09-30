# Workspace fixes and QA — 2026-09-30

All four authenticated workspace layouts now use WorkspaceIdentity. The sidebar shows the signed-in person's name, email and phone; a localized placeholder appears when the phone is absent. Long email addresses wrap, the close button keeps its width, and profile details reload when the authenticated user is refreshed. Older asynchronous identity requests cannot overwrite a different signed-in account. Automatic UI translation skips personal identity text.

A shared complete gear replaces the circle-only settings icons in sidebar and header. The manager's header now has a visible settings icon on small screens. Header titles recognize HY/RU/EN routes, and factory home links preserve the selected language.

Login retries the existing Sanctum cookie strategy once only for HTTP 419. Each attempt performs the strategy's fresh CSRF handshake. Password errors, rate limits, network failures and server errors are not retried. Server error messages are retained instead of always falling back to “Login failed”. Duplicate form submission is suppressed while login is running.

## Validation

- 13 Node regression tests pass, including the installed CookieScheme's handshake, retry limits, localized route matching and account-switch identity races.
- ESLint passes for changed JavaScript/Vue sources.
- `npm run generate:server` succeeds. The `/work/` bundle contains the production API URL and no localhost API URL.
- The reported mobile screenshot was inspected and the responsive component source was reviewed. An isolated fixture was compiled, but cloud-browser policy blocked opening its local file URL. No actual mobile runtime verification is claimed.

## Live QA completed before the login blocker

The manager workspace's employee and access directories, staff creation options and required-name validation, materials, client editing and production sections were inspected. A clearly marked QA material was created and its thickness update persisted after reload. The client's temporary edit was restored. No employee, PMP or order was created during this pass.

A selected manager account authenticated successfully; its identity differed from the account initially requested. The engineer sign-in after logout displayed the generic “Login failed” error. Its underlying HTTP status was not available, so the 419 recovery remains to be validated against the live failure. The three requested accounts and the complete PMP/upload/order workflows are not yet verified. The powder section had no matching workshop configured.

The code and build are prepared for release. This session has no deployment path to the existing hosting, and no production deployment is claimed.
