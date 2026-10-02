# Factory order actions

The factory API uses `confirmed` for a task the operator has taken into work,
and `finished` for a task the operator has completed. The order card must keep
an owned `confirmed` task editable and draggable. It must still respect
`factory.order_update`, operator ownership, and completed-task restrictions.

The laser, bending, and generic factory boards now open the status dialog from
both the card and its details. Taking a task, rejection with a reason,
rescheduling with a chosen date, and completion retain the existing
`PUT /api/factories/updateOrder/{orderId}` contract and factory ID. A rejection
or rescheduling drop opens the corresponding form before any update is sent.

The dialog stays open while saving and on an API failure, retaining the chosen
action, reason, and date. It closes after a successful update. Pending saves
cannot be submitted twice or dismissed. Drag state clears on drag completion
or cancellation; a drop in the same column does not issue an update.

Factory dates use the operator's local calendar date. `waiting` and `pending`
tasks remain in the unassigned column. These changes require only the frontend
bundle; no server migration or API change is required.

## Validation and installation

- `npm run test:regression`: 106 passing checks, including 19 factory-action
  regressions covering confirmed tasks, consecutive drops, required fields,
  pending/failed saves, manager retries, ownership, permissions, and local dates.
- Browser verification uses the generated `/work/` build with isolated test
  records and the existing API request/response shapes. It does not change live
  manufacturing orders.
- Generate the production client with `npm run generate:server` and deploy the
  contents of `dist/` to the existing `/work/` directory. Retain the host's
  existing `.htaccess`; refresh the page after uploading the new assets.
