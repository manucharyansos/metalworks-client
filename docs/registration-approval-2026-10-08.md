# Manager-approved registration

The registration form defaults to a client request. Checking **Գրանցվել որպես ընկերության աշխատակից** adds required surname and informational job title plus optional patronymic. Both types need name, email and matching passwords of at least eight characters. Phone and role selectors are absent from the public form.

Both client and employee requests select an active enterprise if several exist; a sole enterprise is assigned automatically. The public directory contains only company names and IDs. An unavailable or empty directory blocks submission, shows the reason and provides Retry.

The form displays **Ձեր հարցումն ընդունված է։** only after the API returns HTTP 202 with pending status. It clears the password fields and explains that account creation requires manager approval. It does not sign in or redirect an unapproved applicant. Field errors stay visible, double submissions are blocked and failed submissions release the button. CSRF, submission and directory calls have 15-second timeouts; only a stale-CSRF 419 response is retried once after a fresh handshake.

Admin and manager navigation includes **Registration requests**. The shared review page lists pending, approved and rejected requests for the selected company, with type filtering and pagination. Approval of an employee requires selecting their actual role, plus a company workshop for production roles. The applicant's typed job title is displayed only as information. Client approval needs no position selector. Rejection creates no account. The dialog supports keyboard focus and mobile scrolling. Employee grants continue to be managed in the existing employee-permissions section.

HY, RU and EN copy is in `utils/registration-copy.js`. Existing company switching reloads the workspace before another company's requests or options can appear.

First-login verification also exposed an existing RU/EN operator redirect loop: `/factory` has no index route, so `localePath('/factory')` did not return a localized section prefix. The role guard now compares sections after removing the locale, while resolving actual destination pages normally. Laser, bend and powder homes are tested in all three locales.

Deploy the API's registration migration **before** extracting the matching generated archive into `metalworks.am/work/`. Keep the original `logo.png`, `cad-assets`, `_nuxt`, language folders and generated routes together. Regression checks: `npm run test:regression`, then `npm run generate:server`, plus real-cookie registration → manager approval → first login against an isolated Laravel database.
