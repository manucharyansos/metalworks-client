const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const source = fs.readFileSync('pages/profile.vue', 'utf8').split('<script>')[1].split('</script>')[0].replace(/^import .*\n/gm, '').replace('export default', 'module.exports =')
const sandbox = { WorkspaceTransition: {}, CompanySelector: {}, WorkspaceIdentity: {}, module: { exports: {} }, taskStatusText: s => s, workspaceCopy: () => ({}), Intl, Date }
vm.runInNewContext(source, sandbox)
const component = sandbox.module.exports
function context() { const c = { ...component.data(), isFactory: false, activeTab: 'current' }; Object.assign(c, component.methods); return c }
test('late current response cannot replace selected history', async () => {
 const c = context(); const pending = []
 c.$axios = { get: () => new Promise(resolve => pending.push(resolve)) }
 const first = c.loadActivity(); c.activeTab = 'history'; const second = c.loadActivity()
 pending[1]({ data: { data: [{id: 2}], total: 1 } }); await second
 pending[0]({ data: { data: [{id: 1}], total: 1 } }); await first
 assert.equal(c.activityData.data[0].id, 2)
})
test('API error shows retry state instead of an empty result', async () => {
 const c = context(); c.$axios = { get: async () => { throw Error('offline') } }
 await c.loadActivity(); assert.equal(c.activityError, true); assert.equal(c.activityLoading, false)
})
test('logout calls server logout before returning to localized login', async () => {
 const c = context(); const calls = []
 c.$auth = { logout: async () => calls.push('logout') }; c.localePath = p => '/ru' + p
 c.$router = { replace: async p => calls.push(p) }
 await c.logout(); assert.deepEqual(calls, ['logout', '/ru/login']); assert.equal(c.loggingOut, false)
})
