<script>
export default {
  asyncData({ app, redirect, $auth, $config }) {
    const toLocale = app.localePath ? app.localePath : (p) => p
    if (!$auth || !$auth.loggedIn) return redirect(toLocale('/login'))

    const map = {
      [$config.managerRole]: $config.dashboards.manager,
      [$config.engineerRole]: $config.dashboards.engineer,
      [$config.adminRole]: $config.dashboards.admin,
      [$config.laserRole]: $config.dashboards.laser,
      [$config.bendRole]: $config.dashboards.bend,
    }
    const target = toLocale(map[$auth.user?.role?.name] || '/')
    return redirect(target)
  },
}
</script>
