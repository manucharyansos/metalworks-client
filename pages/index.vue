<template>
  <div></div>
</template>
<script>
export default {
  middleware: 'roleRedirect',
  // asyncData({ app, redirect, $auth, $config }) {
  //   const toLocale = app.localePath ? app.localePath : (p) => p
  //   if (!$auth || !$auth.loggedIn) return redirect(toLocale('/login'))
  //
  //   const map = {
  //     [$config.managerRole]: $config.dashboards.manager,
  //     [$config.engineerRole]: $config.dashboards.engineer,
  //     [$config.adminRole]: $config.dashboards.admin,
  //     [$config.operatorRole]: $config.dashboards.operator,
  //   }
  //   const target = toLocale(map[$auth.user?.role?.name] || '/')
  //   return redirect(target)
  // },
}
</script>
