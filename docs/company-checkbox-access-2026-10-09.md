# Company checkbox access

Clients have company-only access controls. Employee controls expand into checkbox lists for companies, positions and workshops for each production position. A primary position/workshop determines the first workspace after login. Both administrators and managers can edit current-company assignments and assignments in other companies they manage.

Client profiles omit position and workshop badges, and client workspace selection never displays employee assignments. Client company-access responses contain company selections only. The manager navigation names both client and employee applications explicitly; the common admin/manager queue has visible All / Client / Employee buttons, defaulting to both types.

Registration requests include employees and clients from every company the reviewer manages, with company and type filters. Request approval uses the application's company options, and approved request cards edit that company's access without changing the reviewer's selected workspace. Unmanaged companies and workshops stay private.

Approval automatically sends a localized company-branded email after account creation. The manual send-email button is removed; a failed mail transport is shown without undoing approval. The API server must have working SMTP settings for real delivery.

## Deployment

Deploy the matching `metalworks-server` master first and clear Laravel caches. This follow-up adds no migrations or dependencies; earlier registration and membership migrations must already be installed.

Generate with `npm run generate:server`. Upload the contents of `dist/` into the hosting `/work/` directory. Preserve the hosting's existing `.htaccess`; the generated ZIP contains no replacement `.htaccess`. All archive contents are at the root, including locale routes, the bundled default logo, CAD runtime and workers.

## Validation

The frontend regression suite covers checkbox selection and primary-order preservation, company-only client payloads, protected memberships and stale request-option responses. The server suite covers company authorization, source-company editing, automatic localized email and mail-failure handling.

The production `/work/` build was exercised against a real local Laravel API and SMTP receiver at 320 and 375 pixels: public applications, manager/admin review, client company access, multi-position/workshop access, employee workspace switching and private downloads. The test receiver accepted three automatic emails. The user's hosting SMTP inbox delivery is not verified by these local checks.
