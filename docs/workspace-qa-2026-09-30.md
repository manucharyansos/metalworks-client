# Workspace fixes and QA — 2026-09-30

All four authenticated workspace layouts use WorkspaceIdentity. The sidebar shows the signed-in person's name, email and phone, with a localized placeholder for a missing phone. Long details wrap; same-account profile refresh reloads the details; older requests cannot overwrite another signed-in account. Automatic UI translation skips personal identity text. Shared complete settings gears appear in the sidebar and header, and localized workspace routes keep their titles and language.

Login retries the existing Sanctum cookie strategy once only for HTTP 419. Each attempt performs a fresh CSRF handshake. Other HTTP errors and network failures are not retried. Server error messages are retained, and concurrent submissions are suppressed. The live first-login failure's HTTP status has not been confirmed, so this fix still needs a production check after release.

## Dynamic factory uploads

The engineer file page reads `/api/factory-file-policies`, the authenticated read-only policy endpoint already present in metalworks-server. When that endpoint exists, the upload picker uses its configured extensions. The currently deployed API returns HTTP 404 for it. Only HTTP 404/405 enables compatibility with the existing `/api/factories/factory` endpoint; its factory records and operators are retained. If this older response has no format metadata, the picker accepts safe candidate files and clearly states that the server will validate configured formats on save. Configured empty lists remain empty; auth, network, server and malformed-policy errors do not enable this compatibility mode. Every opening reloads the rules to reflect admin changes. Failed policies show an error with Retry and disable upload; an empty configured extension list permits no uploads.

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

## Group/subgroup selection and existing order flows

The subgroup inputs and pickers stay disabled until an exact existing group is selected or fully typed. Matching uses the field currently being edited; the old counterpart cannot keep a stale group or subgroup selected. Partial codes remain editable. Selecting or changing a group fills its name and exposes only its subgroups; changing to another group clears the child selection.

Typing a missing group or subgroup shows its Create action immediately, disabled until the required two fields are complete. An existing subgroup shows View instead of Create. Navigation uses the matching subgroup's server ID. New groups remain selected for the next step. Successful create responses update the group list without removing existing file data, so a failed refresh cannot offer another create for the saved record.

Opening a subgroup selects it and displays its factories directly. Project loading and factory loading have separate errors; a format failure cannot hide a readable project. Failed project reads do not expose a previous project's stale files.

Order creation keeps its existing server payload, selected-file quantities, all-files flag and operator assignment. Changing a group/subgroup clears file IDs from the former subgroup and retains client, date and description. Selecting all files in a factory now checks membership rather than the total count across factories; toggling affects only that factory and retains the other selections and quantities.

## Empty-order protection

The new-order form waits for a successful file read for the selected subgroup. It blocks a subgroup with no files, a failed or stale read, an empty explicit selection, and invalid quantities. Switching a parent or subgroup resets file IDs, operators and the current read snapshot while retaining the client, date and description. Failed reads provide Retry. Laravel 422 messages are displayed without discarding entered details.

The original server contract remains unchanged: `link_existing_files: false` means all files in the chosen subgroup, while `true` means an explicit selection with quantities. The selected-file picker opens a factory that has files in the chosen subgroup.

The companion server patch rejects an empty resolved file list with HTTP 422 before creating an order, number, date, factory, file link or email. Explicit files must belong to both the parent PMP and supplied subgroup. Legacy parent-only requests still work when files exist. Editing without replacement files retains existing attachments.

## Validation

- 73 Node regression tests pass: four role layouts and localized navigation; existing order selected/all-file payloads, operator assignments and failure retention; group/subgroup input transitions and native disabled fields; legacy API compatibility and permission/error boundaries; installed CookieScheme CSRF handshake and retry limits; identity races; rules for all six factories; configured/empty policies; upload limits and dangerous types; UTF-8 text; failure retention; DXF zero thickness; duplicate submissions; preview races; numeric input rendering; voice stream cleanup and denied permission.
- PHP Security CI passes 13 isolated SQLite order-file HTTP tests (121 assertions), plus the existing 11 security/route, 4 manager and 2 profile/password tests. Email is faked and the tests do not access production data.
- GitHub Client Security CI passes Node 20 and Node 24 checks and production builds.
- Changed JavaScript/Vue sources pass ESLint with existing no-console warnings in the factory store.
- `npm run generate:server` succeeds for `/work/` and the production API URL.
- The reported mobile screenshot and responsive source were reviewed. Cloud-browser policy blocked an isolated local fixture. No actual mobile runtime verification is claimed.

## Earlier live QA

The current deployed engineer order list, order form/client selector and populated profile were also opened successfully during the compatibility investigation. No profile edits, email/code sends or live orders were submitted.

A manager workspace's employee/access directories, creation options, required-name validation, materials, client editing and production sections were inspected. A marked QA material and thickness update persisted after reload. The client's temporary edit was restored. The selected manager account differed from the initially requested account; no claim is made that the requested manager identity was tested.

After a manual engineer sign-in, a marked QA PMP group and subgroup were created. The six factory buttons appeared after one page reload. A marked text attachment was saved in INFO and appeared in its file list. Selecting it displayed only its name in the old deployed viewer, confirming the missing text preview. The automated download event did not complete within its timeout; a successful download is not claimed. Uploads to every other factory, live microphone recording, orders using selected/all files, the requested admin sign-in and a complete three-account pass remain unverified. No employee or order was created. The powder production section had no matching workshop configured.

Fixtures created by `tests/helpers/create-qa-upload-fixtures.cjs` are disposable and marked not for production. The SW and IQS fixtures test transport only and are not valid manufacturing models.

## Live continuation: six-factory uploads

A secure login retry succeeded and opened the engineer workspace. The earlier generic "Login failed" was not associated with an observed HTTP status, so no login root cause is claimed. An existing order, 080.10, visibly had zero files, confirming the reported empty-order symptom. That order was left unchanged.

The marked QA group **990** and subgroup **01** (remote subgroup ID **5**) received the following **19 new files** through the actual upload modal. Existing attachments were retained. All 19 names and factory counts were verified again after a full page reload at [the subgroup file page](https://metalworks.am/work/engineer/files/view/?id=5).

| Factory | New files | Fixture types |
| --- | ---: | --- |
| SW | 3 | Clearly marked `.sldprt` transport placeholders |
| DLD | 3 | Drawing PDFs |
| DXF | 3 | Minimal LINE/CIRCLE DXF drawings |
| IQS | 3 | Clearly marked `.iqs` transport placeholders |
| PDF | 3 | Drawing PDFs |
| INFO | 4 | UTF-8 text, PNG image, WAV audio, PDF attachment |

All fixtures are marked **QA TEST — DO NOT USE IN PRODUCTION**. SW and IQS transport placeholders are not valid manufacturing models. DXF uploads accepted quantities 1, 2 and 3, marked QA material and thickness values 1.5, 1.5 and 0.

INFO text was created in Text mode, rather than uploaded as an existing file. After saving and reloading, its authenticated preview displayed the preserved Armenian, Russian and English lines. The PNG created in Image mode loaded after reload with natural dimensions 640 × 360. Audio mode saved a valid one-second PCM WAV and displayed the native audio controls. The general File mode saved the INFO PDF.

The session's execution environment disconnected during screenshot capture after these persistence and preview checks. No new screenshot is claimed. Persistent audio playback, microphone recording, PDF/DXF visual rendering, downloads, actual mobile runtime behavior, live selected/all-file order submissions and a complete three-account pass remain unverified. No order, employee, email or verification code was created or sent by this continuation.

## Release

The client code is prepared in PR #20; the Apache `/work/` build is packaged separately. This session has no deployment path to the existing metalworks.am hosting, and no production release is claimed. The factory-lookup compatibility change supports the older API without a backend update. The empty-order protection additionally requires the companion server controller patch; the client alone cannot prevent direct API requests. Exposing `/api/factory-file-policies` (metalworks-server commit 4c6bee6 or later) additionally lets the browser display and filter the exact configured extension list before upload. Server-side format rules, upload limits and permission guards remain authoritative in both modes. No server migration or file permission relaxation was introduced in this client change.

The tested client runtime is commit `04b87ac1bb7b004e44dd70985e1e55b2e5cc3641`. Its successful CI run provides [metalworks-client-dist.zip](https://github.com/manucharyansos/metalworks-client/actions/runs/36771873790/artifacts/11124287103) for the existing `/work/` hosting. The tested server runtime is `a026dde5e09ecd304090bbe9a6c00d6f385cae31`; the later documentation-only commit `451802e4b7953873df081c2ae34baf4dce1811d5` also passes PHP Security CI. A verified [controller-only deployment patch](https://github.com/manucharyansos/metalworks-server/blob/451802e4b7953873df081c2ae34baf4dce1811d5/docs/releases/metalworks-empty-order-api.patch) is included in the server repository. See [the installation instructions](deploy-order-file-validation-2026-09-30.md). The environment disconnection prevented a new local combined archive; the successful CI artifact is available instead.
