// middleware/roleRedirect.js
export default async function ({ app, route, redirect, $auth }) {
  const localePath = app.localePath

  // Եթե դեռ չենք մտել՝ միայն login է թույլատրվում
  if (!$auth.loggedIn) {
    if (route.path !== '/login') {
      return redirect(localePath('/login'))
    }
    return
  }

  // ԿԱՐԵՎՈՐ. եթե user-ը դեռ չի բեռնվել՝ բեռնում ենք ձեռքով
  if (!$auth.user) {
    try {
      await $auth.fetchUser()
    } catch (e) {
      console.error('fetchUser failed', e)
      return redirect(localePath('/login'))
    }
  }

  const role = $auth.user?.role?.name
  if (!role) {
    return redirect(localePath('/login')) // անսպասելի դեպք
  }

  // Ռոլերի քարտեզ
  const dashboardMap = {
    admin: '/admin',
    manager: '/manager',
    engineer: '/engineer',
    laser: '/factory/laser',
    bend: '/factory/bend',
    // ավելացրու մնացածը
  }

  const target = localePath(dashboardMap[role] || '/unauthorized')

  // Այստեղ է գլխավոր տարբերությունը.
  // Եթե գտնվում ենք root-ում կամ login-ից հետո եկել ենք root → անմիջապես գնում ենք դաշբորդ
  const isRoot = route.path === '/' || route.path === localePath('/')

  if (isRoot || route.path === '/login') {
    return redirect(target)
  }

  // Եթե ընդհանրապես սխալ էջում ենք՝ ուղարկում ենք ճիշտը
  if (route.path !== target) {
    return redirect(target)
  }
}
