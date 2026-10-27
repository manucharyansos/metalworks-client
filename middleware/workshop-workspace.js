import { workshopPage, workshopKind } from '@/utils/workshop-catalog'

export default function ({ app, route, redirect }) {
  const user = app.$auth?.user || {}
  const required =
    route.params?.kind ||
    route.meta?.find((row) => row.workshopKind)?.workshopKind
  // The board always requests the signed-in operator's assigned workshop.
  // A different named URL cannot grant access to another workshop.
  if (workshopKind(user.factory) !== required) {
    const target = user.factory
      ? workshopPage(user.factory, 'factory')
      : { path: '/factory/workspace' }
    return redirect(app.localePath(target))
  }
}
