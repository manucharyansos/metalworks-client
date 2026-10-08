const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

const load = async file => {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default
}

for (const locale of ['', '/ru', '/en']) {
  test(`public authentication routes render after directory redirects (${locale || 'hy'})`, async () => {
    const middleware = await load('middleware/roleRedirect.js')
    for (const page of ['/login', '/register', '/forgot-password', '/reset-password']) {
      const redirects = []
      await middleware({
        app: { localePath: path => `${locale}${path}` },
        route: { path: `${locale}${page}/` },
        redirect: path => redirects.push(path),
        $auth: { loggedIn: false },
      })
      assert.deepEqual(redirects, [], `${page}/ must not redirect to itself`)
    }
  })

  test(`signed-in users leave authentication and root routes (${locale || 'hy'})`, async () => {
    const middleware = await load('middleware/roleRedirect.js')
    for (const page of ['/', '/login/', '/register/']) {
      const redirects = []
      await middleware({
        app: { localePath: path => `${locale}${path}` },
        route: { path: `${locale}${page}` },
        redirect: path => redirects.push(path),
        $auth: { loggedIn: true, user: { role: { name: 'admin' } } },
      })
      assert.deepEqual(redirects, [`${locale}/admin`])
    }
  })
}

test('profile and permitted role sections remain routable with a trailing slash', async () => {
  const middleware = await load('middleware/roleRedirect.js')
  for (const page of ['/ru/profile/', '/ru/engineer/']) {
    const redirects = []
    await middleware({
      app: { localePath: path => `/ru${path}` },
      route: { path: page },
      redirect: path => redirects.push(path),
      $auth: { loggedIn: true, user: { role: { name: 'engineer' }, permissions: ['orders.view'] } },
    })
    assert.deepEqual(redirects, [])
  }
})

test('workspace permission checks use the same normalized route', async () => {
  const middleware = await load('middleware/permission-guard.js')
  const redirects = []
  await middleware({
    app: { localePath: path => `/ru${path}`, $auth: { loggedIn: true, user: { role: { name: 'worker' }, permissions: [] } } },
    route: { path: '/ru/manager/', query: {} },
    redirect: path => redirects.push(path),
  })
  assert.deepEqual(redirects, ['/ru/profile?access=denied'])
})

for (const locale of ['', '/ru', '/en']) {
  for (const [role, home] of [['laser', 'laser'], ['bend', 'bend'], ['powder_catting', 'powder']]) {
    test(`${role} can enter ${locale || 'hy'} factory home when the section has no index route`, async () => {
      const middleware = await load('middleware/roleRedirect.js')
      const redirects = []
      await middleware({
        // This is Nuxt i18n's real behavior for an unmatched /factory page.
        app: { localePath: path => path === '/factory' ? path : `${locale}${path}` },
        route: { path: `${locale}/factory/${home}/` },
        redirect: path => redirects.push(path),
        $auth: { loggedIn: true, user: { role: { name: role }, factory_id: 7, permissions: [] } },
      })
      assert.deepEqual(redirects, [])
    })
  }
}
