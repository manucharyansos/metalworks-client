import { clearCompanySelection, companyHome, isCompanyRequest, readCompanySelection, saveCompanySelection } from '~/utils/company-workspace'
import { workspaceCopy } from '~/utils/company-copy'

export default async ({ app, store, $axios, $auth }, inject) => {
  let dirty = false
  const dirtyForms = new Set()
  let pendingWrites = 0
  const storage = window.sessionStorage
  const currentId = () => store.state.workspace?.company?.id
  const copy = () => workspaceCopy(app.i18n?.locale)

  $axios.onRequest((config) => {
    config.headers = config.headers || {}
    if (/\/api\/(login|logout)(?:\?|$)/.test(config.url || '')) {
      store.commit('workspace/clear')
      clearCompanySelection(storage)
    }
    if (isCompanyRequest(config.url)) {
      const id = config._workspaceSwitch ? config.headers['X-Company-ID'] : currentId()
      if (id) config.headers['X-Company-ID'] = String(id)
      else delete config.headers['X-Company-ID']
      if (!['get', 'head', 'options'].includes(String(config.method || 'get').toLowerCase())) {
        config._workspaceWrite = true
        pendingWrites++
      }
    } else delete config.headers['X-Company-ID']
  })
  const finishWrite = (config) => {
    if (!config?._workspaceWrite) return
    pendingWrites = Math.max(0, pendingWrites - 1)
  }
  $axios.onResponse((response) => finishWrite(response.config))
  $axios.onError((error) => finishWrite(error.config))

  const bootstrap = (user) => {
    if (!Array.isArray(user?.companies)) return
    store.commit('workspace/bootstrap', user)
  }
  bootstrap($auth.user)
  const initialUser = $auth.user
  if (initialUser?.id && Array.isArray(initialUser.companies)) {
    const saved = readCompanySelection(storage, initialUser.id, initialUser.companies)
    if (saved && String(saved) !== String(initialUser.company?.id)) {
      try {
        const user = await $axios.$get('/api/user', { headers: { 'X-Company-ID': String(saved) }, _workspaceSwitch: true })
        $auth.setUser(user)
        bootstrap(user)
      } catch (_) { bootstrap(initialUser) }
    }
    if (currentId()) saveCompanySelection(storage, initialUser.id, currentId())
  }
  store.watch((state) => state.auth?.user, (user) => {
    if (!user) {
      store.commit('workspace/clear')
      clearCompanySelection(storage)
      dirty = false
      dirtyForms.clear()
      return
    }
    bootstrap(user)
    if (user.id && currentId()) saveCompanySelection(storage, user.id, currentId())
  })
  const markForm = (event) => {
    const form = event.target.closest('form, [data-workspace-form]')
    if (form && !event.target.closest('[data-workspace-control]')) dirtyForms.add(form)
  }
  document.addEventListener('input', markForm, true)
  document.addEventListener('change', markForm, true)
  app.router.afterEach(() => { dirty = false; dirtyForms.clear() })

  inject('workspace', {
    setDirty(value) { dirty = Boolean(value); if (!value) dirtyForms.clear() },
    async switchCompany(id) {
      if (String(id) === String(currentId()) || store.state.workspace.switching) return
      if (!store.state.workspace.companies.some((c) => String(c.id) === String(id))) return
      if (pendingWrites) { window.alert(copy().waiting); return }
      if ((dirty || [...dirtyForms].some(form => form.isConnected)) && !window.confirm(copy().unsaved)) return
      store.commit('workspace/switching', true)
      try {
        const user = await $axios.$get('/api/user', { headers: { 'X-Company-ID': String(id) }, _workspaceSwitch: true })
        if (String(user.company?.id) !== String(id) || String(user.id) !== String($auth.user?.id)) throw new Error('Company access changed')
        saveCompanySelection(storage, user.id, id)
        // A fresh document clears all orders, module caches, draft components,
        // file blobs and pending requests before the new company is displayed.
        const path = app.localePath(companyHome(user))
        const base = app.router.options.base || '/'
        window.location.replace(`${base.replace(/\/?$/, '/')}${path.replace(/^\/+/, '')}`)
      } catch (error) {
        store.commit('workspace/switching', false)
        app.$notify?.({ type: 'error', text: copy().failed })
      }
    },
  })
}
