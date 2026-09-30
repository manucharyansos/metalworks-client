# Workspace fixes and QA — 2026-09-30

All four authenticated workspace layouts use WorkspaceIdentity. The sidebar shows the signed-in person's name, email and phone, with a localized placeholder for a missing phone. Long details wrap; same-account profile refresh reloads the details; older requests cannot overwrite another signed-in account. Automatic UI translation skips personal identity text. Shared complete settings gears appear in the sidebar and header, and localized workspace routes keep their titles and language.

Login retries the existing Sanctum cookie strategy once only for HTTP 419. Each attempt performs a fresh CSRF handshake. Other HTTP errors and network failures are not retried. Server error messages are retained, and concurrent submissions are suppressed. The live first-login failure's HTTP status has not been confirmed, so this fix still needs a production check after release.

## Dynamic factory uploads

The engineer file page reads `/api/factory-file-policies`, the authenticated read-only policy endpoint already present in metalworks-server. Both the factory list and the upload picker use that response. Every opening reloads the rules to reflect admin changes. Missing or failed policies show an error with Retry and disable upload; an empty configured extension list permits no uploads.

| Factory code | Modal behavior |
| --- | --- |
| DXF | Configured formats plus required quantity, material and thickness; thickness zero is accepted |
| SW | Configured SolidWorks or other admin-defined extensions |
| DLD | Its configured extensions, independent of the PDF factory |
| IQS | Its configured extensions |
| PDF | Its configured extensions |
| INFO | Text, image, audio/voice and general attachment modes, subject to its configured formats |

INFO text is stored as a UTF-8 `.txt` attachment using the existing PMP upload endpoint. It remains an ordinary PMP file for order selection. Voice recording chooses a browser-supported format allowed by the policy, supports finish/cancel, and stops microphone tracks on cancellation, error or modal destruction, including when permission resolves late. Existing audio files can be selected when recording is unavailable. Maximum size remains 10 MiB and dangerous upload types remain blocked by the server and the client hint.

The modal names the selected factory, lists its formats and size limit, supports drag and drop, has localized HY/RU/EN labels, and scrolls within the mobile viewport. File actions are visible on touch layouts. Text, audio, images and PDF have authenticated blob previews; other files retain a download fallback. Preview races and object URLs are cleaned up. Numeric upload fields now forward their native attributes and focus events through the shared input component.

PMP group/subgroup creation, file upload and deletion propagate errors instead of swallowing them. Failed saves retain input and display server validation. Successful upload does not become a second upload attempt merely because refreshing the list failed.

## Validation

- 37 Node regression tests pass: installed CookieScheme CSRF handshake and retry limits; identity races; rules for all six factories; configured/empty policies; upload limits and dangerous types; UTF-8 text; failure retention; DXF zero thickness; duplicate submissions; preview races; numeric input rendering; voice stream cleanup and denied permission.
- Changed JavaScript/Vue sources pass ESLint with existing no-console warnings in the factory store.
- `npm run generate:server` succeeds for `/work/` and the production API URL.
- The reported mobile screenshot and responsive source were reviewed. Cloud-browser policy blocked an isolated local fixture. No actual mobile runtime verification is claimed.

## Live QA

A manager workspace's employee/access directories, creation options, required-name validation, materials, client editing and production sections were inspected. A marked QA material and thickness update persisted after reload. The client's temporary edit was restored. The selected manager account differed from the initially requested account; no claim is made that the requested manager identity was tested.

After a manual engineer sign-in, a marked QA PMP group and subgroup were created. The six factory buttons appeared after one page reload. A marked text attachment was saved in INFO and appeared in its file list. Selecting it displayed only its name in the old deployed viewer, confirming the missing text preview. The automated download event did not complete within its timeout; a successful download is not claimed. Uploads to every other factory, live microphone recording, orders using selected/all files, the requested admin sign-in and a complete three-account pass remain unverified. No employee or order was created. The powder production section had no matching workshop configured.

Fixtures created by `tests/helpers/create-qa-upload-fixtures.cjs` are disposable and marked not for production. The SW and IQS fixtures test transport only and are not valid manufacturing models.

## Release

The client code is prepared in PR #20; the Apache `/work/` build is packaged separately. This session has no deployment path to the existing metalworks.am hosting, and no production release is claimed. The backend must already expose `/api/factory-file-policies` with the existing factory extension table and permission guards (metalworks-server commit 4c6bee6 or later). No server migration or file permission relaxation was introduced in this client change.
