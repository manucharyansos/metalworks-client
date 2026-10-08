import { clearCompanySelection, companyHome, isCompanyRequest, readCompanySelection, readAssignmentSelection, saveCompanySelection } from '~/utils/company-workspace'
import { workspaceCopy } from '~/utils/company-copy'

export default async ({ app, store, $axios, $auth }, inject) => {
  let dirty = false
  const dirtyForms = new Set()
  let pendingWrites = 0
  const storage = window.sessionStorage
  const currentId = () => store.state.workspace?.company?.id
  const currentAssignment = () => store.state.workspace?.assignmentId
  const copy = () => workspaceCopy(app.i18n?.locale)
  const reloadWith = (user) => {
    saveCompanySelection(storage, user.id, user.company.id, user.assignment_id)
    // A fresh document discards orders, private file blobs, module caches,
    // draft components and requests from the previous working context.
    const path = app.localePath(companyHome(user))
    const base = app.router.options.base || '/'
    window.location.replace(`${base.replace(/\/?$/, '/')}${path.replace(/^\/+/, '')}`)
  }
  const fetchContext = (companyId, assignmentId) => $axios.$get('/api/user', {
    headers: { 'X-Company-ID': String(companyId), ...(assignmentId ? { 'X-Assignment-ID': String(assignmentId) } : {}) },
    _workspaceSwitch: true, timeout: 15000,
  })
  const maySwitch = () => {
    if (store.state.workspace.switching) return false
    if (pendingWrites) { window.alert(copy().waiting); return false }
    return !(dirty || [...dirtyForms].some(form => form.isConnected)) || window.confirm(copy().unsaved)
  }

  $axios.onRequest((config) => {
    config.headers = config.headers || {}
    if (/\/api\/(login|logout)(?:\?|$)/.test(config.url || '')) {
      store.commit('workspace/clear')
      clearCompanySelection(storage)
    }
    if (isCompanyRequest(config.url)) {
      const id = config._workspaceSwitch ? config.headers['X-Company-ID'] : currentId()
      const assignment = config._workspaceSwitch ? config.headers['X-Assignment-ID'] : currentAssignment()
      if (id) config.headers['X-Company-ID'] = String(id)
      else delete config.headers['X-Company-ID']
      if (assignment) config.headers['X-Assignment-ID'] = String(assignment)
      else delete config.headers['X-Assignment-ID']
      if (!['get', 'head', 'options'].includes(String(config.method || 'get').toLowerCase())) {
        config._workspaceWrite = true
        pendingWrites++
      }
    } else { delete config.headers['X-Company-ID']; delete config.headers['X-Assignment-ID'] }
  })
  const finishWrite = (config) => {
    if (!config?._workspaceWrite) return
    pendingWrites = Math.max(0, pendingWrites - 1)
  }
  $axios.onResponse((response) => finishWrite(response.config))
  $axios.onError(async (error) => {
    finishWrite(error.config)
    // A removed position must never silently retry a write under another role.
    // Refresh the identity and document; the failed operation stays failed.
    if (error.response?.status === 403 && error.response?.data?.message === 'Position access denied.' && !error.config?._workspaceSwitch && currentId() && !store.state.workspace.switching) {
      store.commit('workspace/switching', true)
      try { reloadWith(await fetchContext(currentId())) }
      catch (_) { store.commit('workspace/switching', false) }
    }
  })

  const bootstrap = (user) => {
    if (Array.isArray(user?.companies)) store.commit('workspace/bootstrap', user)
  }
  bootstrap($auth.user)
  const initialUser = $auth.user
  if (initialUser?.id && Array.isArray(initialUser.companies)) {
    const company = readCompanySelection(storage, initialUser.id, initialUser.companies) || initialUser.company?.id
    const assignment = readAssignmentSelection(storage, initialUser.id, company)
    if (company && (String(company) !== String(initialUser.company?.id) || (assignment && String(assignment) !== String(initialUser.assignment_id)))) {
      let selected = initialUser
      try { selected = await fetchContext(company, assignment) }
      catch (_) {
        // A revoked or changed assignment falls back to the primary position,
        // with a separate identity GET, before a page can read private data.
        if (assignment) {
          try { selected = await fetchContext(company) } catch (_) {}
        }
      }
      $auth.setUser(selected); bootstrap(selected)
    }
    if (currentId()) saveCompanySelection(storage, initialUser.id, currentId(), currentAssignment())
  }
  store.watch((state) => state.auth?.user, (user) => {
    if (!user) {
      store.commit('workspace/clear'); clearCompanySelection(storage)
      dirty = false; dirtyForms.clear(); return
    }
    bootstrap(user)
    if (user.id && currentId()) saveCompanySelection(storage, user.id, currentId(), currentAssignment())
  })
  const markForm = (event) => {
    const form = event.target.closest('form, [data-workspace-form]')
    if (form && !event.target.closest('[data-workspace-control]')) dirtyForms.add(form)
  }
  document.addEventListener('input', markForm, true)
  document.addEventListener('change', markForm, true)
  app.router.afterEach(() => { dirty = false; dirtyForms.clear() })

  const changeContext = async (companyId, assignmentId) => {
    if (!maySwitch()) return
    store.commit('workspace/switching', true)
    try {
      const user = await fetchContext(companyId, assignmentId)
      if (String(user.company?.id) !== String(companyId) || String(user.id) !== String($auth.user?.id) || (assignmentId && String(user.assignment_id) !== String(assignmentId))) throw new Error('Workspace access changed')
      reloadWith(user)
    } catch (_) {
      store.commit('workspace/switching', false)
      app.$notify?.({ type: 'error', text: copy().failed })
    }
  }
  inject('workspace', {
    setDirty(value) { dirty = Boolean(value); if (!value) dirtyForms.clear() },
    async switchCompany(id) {
      if (String(id) === String(currentId()) || !store.state.workspace.companies.some(c => String(c.id) === String(id))) return
      await changeContext(id)
    },
    async switchAssignment(id) {
      if (String(id) === String(currentAssignment()) || !store.state.workspace.assignments.some(row => String(row.id) === String(id))) return
      await changeContext(currentId(), id)
    },
    async refreshAssignments() {
      store.commit('workspace/switching', true)
      try { reloadWith(await fetchContext(currentId())) }
      catch (error) { store.commit('workspace/switching', false); throw error }
    },
  })
}
