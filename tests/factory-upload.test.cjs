const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const taskUrl = moduleUrl(read('utils/task-workflow.js'))
const catalogUrl = moduleUrl(read('utils/workshop-catalog.js').replace("'@/utils/task-workflow'", JSON.stringify(taskUrl)))
const policyUrl = moduleUrl(read('utils/factory-file-policy.js'))
const previewUrl = moduleUrl(read('utils/factory-preview.js'))
const policy = import(policyUrl)
const voice = import(moduleUrl(read('utils/voice-recorder.js').replace("'./factory-file-policy'", `'${policyUrl}'`)))

async function component(file) {
  let source = read(file).match(/<script>([\s\S]*?)<\/script>/)[1]
  source = source.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g, (_, names, specifier) => {
    if (specifier === '@/utils/workshop-catalog') return `import ${names} from '${catalogUrl}'`
    if (specifier === '~/utils/factory-file-policy') return `import ${names} from '${policyUrl}'`
    if (specifier === '~/utils/factory-preview') return `import ${names} from '${previewUrl}'`
    if (specifier === '@/utils/task-workflow') return `import ${names} from '${taskUrl}'`
    if (specifier === 'vuex') return 'const mapActions = () => ({}); const mapGetters = () => ({})'
    return `const ${names} = {}`
  })
  return (await import(moduleUrl(source))).default
}

async function uploadPage(code = 'INFO', extensions = ['*']) {
  const page = await component('pages/engineer/files/view.vue')
  const notifications = []
  const vm = {
    ...page.data(),
    getFactory: [{ id: 6, name: code, value: code }],
    getPmp: { id: 7, files: [] },
    getMaterials: [],
    selectedFactoryId: 6,
    selectedRemoteNumberId: 8,
    factoryPolicies: [{ id: 6, extensions }],
    isDxfFile: code === 'DXF',
    isOpenAddFileModal: true,
    id: 8,
    $t: key => key,
    $notify: item => notifications.push(item),
    fetchPmp: async () => true,
  }
  for (const [name, method] of Object.entries(page.methods)) vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(page.computed)) Object.defineProperty(vm, name, { get: getter.bind(vm), configurable: true })
  return { vm, notifications }
}

const fakeFile = (name, size = 10, type = '') => ({ name, size, type })

test('ordinary files upload together with independent routes and retain the selection on failure', async () => {
  const { vm } = await uploadPage('IQS', ['igs', 'step'])
  vm.handleFileDrop([new File(['IGES'], 'part.igs'), new File(['STEP'], 'other.step')])
  assert.equal(vm.canPickMultiple, true)
  assert.equal(vm.pendingFiles.length, 2)
  vm.pendingFiles[0].plan = { production_factory_ids: [1, 2], inspection_required: true }
  vm.pendingFiles[1].plan = { production_factory_ids: [3], inspection_required: false }
  vm.createPmpFilesByFactory = async () => { throw failure(503) }
  await vm.addFile()
  assert.equal(vm.pendingFiles.length, 2)
  assert.equal(vm.isOpenAddFileModal, true)
  let body
  vm.createPmpFilesByFactory = async form => { body = form; return { files: [{ id: 1 }, { id: 2 }] } }
  await vm.addFile()
  assert.deepEqual(body.getAll('files[]').map(file => file.name), ['part.igs', 'other.step'])
  assert.deepEqual(JSON.parse(body.get('file_plans')), [
    { production_factory_ids: [1, 2], inspection_required: true },
    { production_factory_ids: [3], inspection_required: false },
  ])
  assert.equal(vm.pendingFiles.length, 0)
  assert.equal(vm.isOpenAddFileModal, false)
})

test('attribute-bearing files stay individual and their dimensions and route reach the upload', async () => {
  const { vm } = await uploadPage('DXF', ['dxf', 'pdf', 'ic'])
  assert.equal(vm.requiresDxfMetadata, true, 'DXF fields are visible before choosing a file')
  assert.equal(vm.canPickMultiple, true, 'configured PDF files may still be selected together')
  vm.handleFileDrop([new File(['DXF'], 'part.dxf'), new File(['PDF'], 'notes.pdf')])
  assert.equal(vm.uploadError, 'file_plan.individual_only')
  assert.equal(vm.pendingFiles.length, 0)
  vm.handleFileDrop(new File(['IC'], 'part.ic'))
  vm.fileData.quantity = 2
  vm.fileData.material = 'Steel'
  vm.fileData.thickness = '0'
  vm.fileData.dimensions = '1000 × 2000 mm'
  vm.filePlan = { production_factory_ids: [1, 2], inspection_required: true }
  let body
  vm.createPmpFilesByFactory = async form => { body = form; return { file: { id: 1 } } }
  await vm.addFile()
  assert.equal(body.get('dimensions'), '1000 × 2000 mm')
  assert.equal(body.get('inspection_required'), '1')
  assert.deepEqual(JSON.parse(body.get('production_factory_ids')), [1, 2])
  assert.equal(body.get('quantity'), '2')
})

test('a DXF section accepts a batch of ordinary files without individual DXF attributes', async () => {
  const { vm } = await uploadPage('DXF', ['dxf', 'pdf'])
  vm.handleFileDrop([new File(['PDF A'], 'a.pdf'), new File(['PDF B'], 'b.pdf')])
  assert.equal(vm.requiresDxfMetadata, false)
  assert.equal(vm.canSubmitFile, true)
  let body
  vm.createPmpFilesByFactory = async form => { body = form }
  await vm.addFile()
  assert.deepEqual(body.getAll('files[]').map(file => file.name), ['a.pdf', 'b.pdf'])
  for (const key of ['quantity', 'material_type', 'thickness']) assert.equal(body.get(key), null)
})

test('the upload store retains every file from a successful batch if refreshing the project fails', async () => {
  const { actions } = await import(moduleUrl(read('store/pmp/index.js')))
  const commits = []
  await actions.createPmpFilesByFactory.call({ $axios: { post: async () => ({ data: { files: [{ id: 1 }, { id: 2 }] } }) } }, { commit: (...args) => commits.push(args) }, {})
  assert.deepEqual(commits, [['ADD_FILE', { id: 1 }], ['ADD_FILE', { id: 2 }], ['SET_ERROR', null]])
})
const failure = status => ({ response: { status, data: { message: 'Rejected', errors: { file: ['Configured format rejected'] } } } })

for (const [code, extensions, accepted, rejected] of [
  ['SW', ['sldprt', 'sldasm', 'slddrw'], 'model.SLDPRT', 'drawing.pdf'],
  ['DLD', ['pdf'], 'bend.pdf', 'part.dxf'],
  ['DXF', ['dxf'], 'part.DXF', 'note.txt'],
  ['IQS', ['iqs'], 'laser.iqs', 'part.dxf'],
  ['INFO', ['*'], 'attachment.docx', 'payload.php.jpg'],
  ['PDF', ['pdf'], 'drawing.PDF', 'model.sldprt'],
]) {
  test(`${code} uses its configured extensions for picker and validation`, async () => {
    const { inputAccept, validateFactoryFile } = await policy
    assert.equal(inputAccept(extensions), extensions[0] === '*' ? '' : extensions.map(ext => `.${ext}`).join(','))
    assert.equal(validateFactoryFile(fakeFile(accepted), extensions), '')
    assert.ok(validateFactoryFile(fakeFile(rejected), extensions))
  })
}

test('admin changes replace defaults, and an empty policy does not permit files', async () => {
  const { normalizeExtensions, inputAccept, validateFactoryFile } = await policy
  assert.deepEqual(normalizeExtensions([{ extension: '.PDF' }, 'pdf', ' .TXT ', null]), ['pdf', 'txt'])
  assert.equal(inputAccept(['pdf', 'txt']), '.pdf,.txt')
  assert.equal(validateFactoryFile(fakeFile('part.dxf'), ['pdf']), 'format_not_allowed')
  assert.equal(validateFactoryFile(fakeFile('note.txt'), []), 'format_not_allowed')
  const { vm } = await uploadPage('INFO', [])
  vm.infoMode = 'text'; vm.infoText = 'note'
  assert.equal(vm.canSubmitFile, false)
})

test('INFO accepts text, images, audio, and attachments while preserving server safety rules', async () => {
  const { inputAccept, validateFactoryFile, MAX_UPLOAD_BYTES } = await policy
  assert.equal(inputAccept(['*'], 'audio'), 'audio/*')
  assert.equal(inputAccept(['*'], 'image'), 'image/*')
  for (const name of ['note.txt', 'photo.png', 'voice.wav', 'archive.zip', 'model.step']) assert.equal(validateFactoryFile(fakeFile(name), ['*']), '')
  for (const name of ['attack.php.png', 'page.html', 'vector.svg', '../file.txt', 'note\u0000.txt', 'file.exe']) assert.equal(validateFactoryFile(fakeFile(name), ['*']), 'unsafe_file')
  assert.equal(validateFactoryFile(fakeFile('voice.wav', MAX_UPLOAD_BYTES), ['*'], 'audio'), '')
  assert.equal(validateFactoryFile(fakeFile('voice.wav', MAX_UPLOAD_BYTES + 1), ['*']), 'too_large')
  assert.equal(validateFactoryFile(fakeFile('note.txt', 0), ['*']), 'empty_file')
  assert.equal(validateFactoryFile(fakeFile('note.txt'), ['*'], 'audio'), 'audio_required')
})

test('typed Armenian text becomes an ordinary UTF-8 attachment available to orders', async () => {
  const { textAttachment, validateFactoryFile } = await policy
  const text = 'Տեքստ\nТекст\n<script>plain text</script>'
  const file = textAttachment('Նշում'.repeat(30), text)
  assert.equal(await file.text(), text)
  assert.equal(file.type, 'text/plain;charset=utf-8')
  assert.ok(new Blob([file.name]).size <= 255)
  assert.equal(validateFactoryFile(file, ['*']), '')
})

test('unknown and CAD files always have a download fallback; text and audio have previews', async () => {
  const { previewType } = await policy
  for (const [name, type] of [['info.txt', 'text'], ['info.json', 'text'], ['voice.m4a', 'audio'], ['photo.png', 'image'], ['movie.mp4', 'video'], ['model.sldprt', 'file'], ['laser.iqs', 'file'], ['graphic.eps', 'file']]) assert.equal(previewType(name), type)
})

test('policy requests use the engineer read-only endpoint and propagate failures', async () => {
  const { actions } = await import(moduleUrl(read('store/factory/index.js').replace("'@/utils/task-workflow'", `'${taskUrl}'`)))
  const commits = []
  const factories = [{ id: 6, value: 'INFO', extensions: [] }]
  const result = await actions.fetchFactoryFilePolicies.call({ $axios: { get: async url => { assert.equal(url, '/api/factory-file-policies'); return { data: { data: factories } } } } }, { commit: (...args) => commits.push(args) })
  assert.equal(result, factories)
  assert.deepEqual(commits, [['SET_FILE_CATEGORIES', factories]])
  await assert.rejects(actions.fetchFactoryFilePolicies.call({ $axios: { get: async () => ({ data: {} }) } }, { commit() {} }))
})

test('failed policy load clears old rules, disables upload, and retains the open modal', async () => {
  const { vm } = await uploadPage()
  vm.fetchFactoryFilePolicies = async () => { throw failure(403) }
  await vm.loadFactoryPolicy()
  assert.equal(vm.policyLoading, false)
  assert.equal(vm.policyError, 'file_upload.policy_failed')
  assert.deepEqual(vm.allowedExtensions, [])
  assert.equal(vm.isOpenAddFileModal, true)
  vm.createPmpFilesByFactory = () => assert.fail('upload must not run')
  await vm.addFile()
})

test('upload failures preserve file, text, DXF fields, and show server validation', async () => {
  const { vm, notifications } = await uploadPage('DXF', ['dxf'])
  const file = new File(['DXF'], 'part.dxf')
  vm.fileData = { file, quantity: '2', material: 'Steel', thickness: '1.5' }
  vm.createPmpFilesByFactory = async () => { throw failure(422) }
  await vm.addFile()
  assert.equal(vm.fileData.file, file)
  assert.equal(vm.fileData.thickness, '1.5')
  assert.equal(vm.uploadError, 'Configured format rejected')
  assert.equal(vm.isOpenAddFileModal, true)
  assert.equal(vm.uploading, false)
  assert.ok(!notifications.some(item => item.type === 'success'))
  const info = (await uploadPage()).vm
  info.infoMode = 'text'; info.infoText = 'keep my text'; info.infoTitle = 'Note'
  info.createPmpFilesByFactory = async () => { throw failure(409) }
  await info.addFile()
  assert.equal(info.infoText, 'keep my text')
  assert.equal(info.infoTitle, 'Note')
})

test('DXF accepts zero thickness and sends metadata only for DXF', async () => {
  for (const code of ['DXF', 'SW']) {
    const { vm } = await uploadPage(code, code === 'DXF' ? ['dxf'] : ['sldprt'])
    vm.fileData = { file: new File(['fixture'], code === 'DXF' ? 'part.dxf' : 'part.sldprt'), quantity: '2', material: ' Steel ', thickness: '0' }
    let submitted
    vm.createPmpFilesByFactory = async form => { submitted = form; return { file: { id: 1 } } }
    await vm.addFile()
    assert.equal(submitted.get('factory_id'), '6')
    assert.equal(submitted.get('remote_number_id'), '8')
    assert.equal(submitted.get('material_type'), code === 'DXF' ? 'Steel' : null)
    assert.equal(submitted.get('thickness'), code === 'DXF' ? '0' : null)
  }
})

test('one click cannot submit twice, and a successful upload is retained if refresh fails', async () => {
  const { vm, notifications } = await uploadPage()
  vm.fileData.file = new File(['note'], 'note.txt')
  let resolve, calls = 0
  vm.createPmpFilesByFactory = () => { calls++; return new Promise(done => { resolve = done }) }
  vm.fetchPmp = async () => { throw failure(500) }
  const first = vm.addFile()
  await vm.addFile()
  assert.equal(calls, 1)
  resolve({ file: { id: 1 } }); await first
  assert.equal(vm.isOpenAddFileModal, false)
  assert.ok(notifications.some(item => item.text === 'file_upload.refresh_failed'))
})

test('PMP mutations reject failures instead of reporting success to pages', async () => {
  const { actions } = await import(moduleUrl(read('store/pmp/index.js')))
  for (const action of ['createPmp', 'rememberNumberPmp', 'createPmpFilesByFactory', 'deleteFile']) {
    await assert.rejects(actions[action].call({ $axios: { post: async () => { throw failure(422) }, delete: async () => { throw failure(403) } } }, { commit() {} }, { id: 7 }))
  }
  const commits = []
  const result = await actions.rememberNumberPmp.call({ $axios: { post: async () => ({ data: { remote_number_id: 123 } }) } }, { commit: (...args) => commits.push(args) }, { id: 7 })
  assert.equal(result.remote_number_id, 123)
})

test('PMP creation failures keep entered values and do not announce success', async () => {
  const page = await component('pages/engineer/files/index.vue')
  const notifications = []
  const vm = { ...page.data(), pmpGroup: '990', pmpGroupName: 'QA', $notify: item => notifications.push(item), createPmp: async () => { throw failure(422) } }
  await page.methods.addPmpGroup.call(vm)
  assert.equal(vm.pmpGroup, '990')
  assert.equal(vm.pmpGroupName, 'QA')
  assert.equal(vm.saving, false)
  assert.ok(!notifications.some(item => item.type === 'success'))
})

function recordingHarness(VoiceRecorder, { pending = false, denied = false, extensions = ['*'] } = {}) {
  let stopped = 0, resolve, mediaCalls = 0
  const files = [], errors = [], states = [], recorders = []
  const stream = { getTracks: () => [{ stop: () => stopped++ }] }
  class Recorder {
    static isTypeSupported(mime) { return mime.startsWith('audio/') }
    constructor(_, options) { this.mimeType = options.mimeType; this.state = 'inactive'; recorders.push(this) }
    start() { this.state = 'recording' }
    stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['final audio chunk']) }); this.onstop?.() }
  }
  const voice = new VoiceRecorder({ Recorder, extensions, mediaDevices: { getUserMedia: async () => { mediaCalls++; if (denied) throw { name: 'NotAllowedError' }; if (pending) return await new Promise(done => { resolve = done }); return stream } }, onFile: file => files.push(file), onError: error => errors.push(error), onState: state => states.push(state) })
  return { voice, files, errors, states, recorders, resolve: () => resolve(stream), stopped: () => stopped, mediaCalls: () => mediaCalls }
}

test('voice recording includes the final audio chunk and releases the microphone', async () => {
  const { VoiceRecorder } = await voice
  const h = recordingHarness(VoiceRecorder)
  await h.voice.start(); h.voice.finish()
  assert.equal(h.files.length, 1)
  assert.equal(await h.files[0].text(), 'final audio chunk')
  assert.match(h.files[0].name, /\.webm$/)
  assert.equal(h.stopped(), 1)
  assert.equal(h.voice.state, 'idle')
})

test('closing while microphone permission is pending discards the late stream', async () => {
  const { VoiceRecorder } = await voice
  const h = recordingHarness(VoiceRecorder, { pending: true })
  const pending = h.voice.start()
  h.voice.cancel(); h.resolve(); await pending
  assert.equal(h.stopped(), 1)
  assert.equal(h.recorders.length, 0)
  assert.equal(h.files.length, 0)
  assert.equal(h.voice.state, 'idle')
})

test('cancelled or oversized recordings are discarded and release the microphone', async () => {
  const { VoiceRecorder } = await voice
  const { MAX_UPLOAD_BYTES } = await policy
  for (const oversized of [false, true]) {
    const h = recordingHarness(VoiceRecorder)
    await h.voice.start()
    if (oversized) h.recorders[0].ondataavailable({ data: new Blob([new Uint8Array(MAX_UPLOAD_BYTES + 1)]) })
    else h.voice.cancel()
    assert.equal(h.files.length, 0)
    assert.equal(h.stopped(), 1)
    assert.equal(h.voice.state, 'idle')
    if (oversized) assert.deepEqual(h.errors, ['too_large'])
  }
})

test('recording respects configured audio formats and permission denial does not loop', async () => {
  const { VoiceRecorder } = await voice
  const blocked = recordingHarness(VoiceRecorder, { extensions: ['txt'] })
  await blocked.voice.start()
  assert.equal(blocked.mediaCalls(), 0)
  assert.deepEqual(blocked.errors, ['recording_format_unavailable'])
  const denied = recordingHarness(VoiceRecorder, { denied: true })
  await denied.voice.start()
  assert.equal(denied.mediaCalls(), 1)
  assert.equal(denied.voice.state, 'idle')
  assert.deepEqual(denied.errors, ['microphone_denied'])
  const mp4 = recordingHarness(VoiceRecorder, { extensions: ['m4a'] })
  await mp4.voice.start(); mp4.voice.finish()
  assert.match(mp4.files[0].name, /\.m4a$/)
})

test('late text preview cannot replace the newly selected file', async () => {
  const { vm } = await uploadPage()
  let resolveBytes
  const blob = new Blob(['old text'], { type: 'text/plain' })
  blob.arrayBuffer = () => new Promise(done => { resolveBytes = done })
  vm.$getPmpFileUrl = file => `/api/secure-files/pmp/${file.id}`
  vm.$axios = { get: async url => ({ data: url.endsWith('/1') ? blob : new Blob([new Uint8Array([0, 1, 2, 3, 4])]) }) }
  const first = vm.viewFile('old.txt', { id: 1, factory_id: 6, original_name: 'old.txt' })
  await new Promise(done => setImmediate(done))
  await vm.viewFile('new.iqs', { id: 2, factory_id: 6, original_name: 'new.iqs' })
  resolveBytes(new TextEncoder().encode('old text').buffer); await first
  assert.equal(vm.selectedFile.id, 2)
  assert.equal(vm.fileType, 'file')
  assert.equal(vm.previewText, '')
})

test('invalid replacement files disable submission without discarding DXF metadata', async () => {
  const { vm } = await uploadPage('DXF', ['dxf'])
  vm.fileData = { file: new File(['part'], 'part.dxf'), quantity: '3', material: 'Steel', thickness: '2' }
  vm.handleFileDrop(new File(['note'], 'wrong.pdf'))
  assert.equal(vm.fileData.file, null)
  assert.equal(vm.canSubmitFile, false)
  assert.equal(vm.fileData.quantity, '3')
  assert.equal(vm.uploadError, 'file_upload.format_not_allowed')
})

test('shared numeric inputs put min, step, and name on the input and forward focus', async () => {
  const Vue = require('vue')
  const compiler = require('vue-template-compiler')
  const renderer = require('vue-server-renderer').createRenderer()
  const options = await component('components/form/InputWithLabelIcon.vue')
  const template = read('components/form/InputWithLabelIcon.vue').match(/<template>([\s\S]*?)<\/template>/)[1]
  const compiled = compiler.compileToFunctions(template)
  const html = await renderer.renderToString(new Vue({ render: h => h({ ...options, ...compiled }, { props: { type: 'number', label: 'Thickness', value: '0' }, attrs: { min: '0', step: 'any', name: 'thickness' } }) }))
  assert.match(html, /<input[^>]+min="0"[^>]+step="any"[^>]+name="thickness"/)
  assert.doesNotMatch(html, /<label[^>]+(?:min|step|name)=/)
  let focused = false, emitted
  const listeners = options.computed.inputListeners.call({ $listeners: { focus: () => { focused = true } }, $emit: (name, value) => { emitted = { name, value } } })
  listeners.focus(); listeners.input({ target: { value: '1.5' } })
  assert.equal(focused, true)
  assert.deepEqual(emitted, { name: 'input', value: '1.5' })
})

for (const code of ['SW', 'DXF', 'DLD', 'IQS', 'INFO', 'PDF', 'FILES_CUSTOM']) {
  test(`${code} accepts PDF added in settings without requiring DXF metadata`, async () => {
    const { vm } = await uploadPage(code, ['pdf', 'nc'])
    const file = new File(['%PDF-1.4'], 'drawing.PDF', { type: 'application/pdf' })
    vm.handleFileDrop(file)
    assert.equal(vm.fileAccept, '.pdf,.nc')
    assert.equal(vm.fileData.file, file)
    assert.equal(vm.requiresDxfMetadata, false)
    let submitted
    vm.createPmpFilesByFactory = async body => { submitted = body }
    await vm.addFile()
    assert.equal(submitted.get('file'), file)
    for (const key of ['quantity', 'material_type', 'thickness']) assert.equal(submitted.get(key), null)
  })
}

test('DXF metadata follows the selected file extension when replacing PDF with DXF', async () => {
  const { vm } = await uploadPage('DXF', ['dxf', 'pdf'])
  vm.handleFileDrop(new File(['pdf'], 'drawing.pdf'))
  assert.equal(vm.requiresDxfMetadata, false)
  vm.handleFileDrop(new File(['dxf'], 'part.dxf'))
  assert.equal(vm.requiresDxfMetadata, true)
  vm.createPmpFilesByFactory = () => assert.fail('DXF metadata is required')
  await vm.addFile()
  assert.equal(vm.uploadError, 'file_upload.dxf_fields_required')
})

test('upload errors display the server reason for duplicates and other legacy error responses', async () => {
  const { uploadErrorMessage } = await policy
  assert.equal(uploadErrorMessage({ response: { data: { error: 'This name already exists' } } }, 'Failed'), 'This name already exists')
  assert.equal(uploadErrorMessage({ response: { data: { errors: { file: ['Current policy blocks this format'] }, error: 'Generic' } } }), 'Current policy blocks this format')
})

test('project files accept 100 MiB and reject larger payloads before uploading', async () => {
  const { MAX_UPLOAD_BYTES, validateFactoryFile } = await policy
  assert.equal(MAX_UPLOAD_BYTES, 100 * 1024 * 1024)
  assert.equal(validateFactoryFile(fakeFile('large.pdf', 11 * 1024 * 1024), ['pdf']), '')
  assert.equal(validateFactoryFile(fakeFile('large.pdf', MAX_UPLOAD_BYTES), ['pdf']), '')
  assert.equal(validateFactoryFile(fakeFile('large.pdf', MAX_UPLOAD_BYTES + 1), ['pdf']), 'too_large')
})

test('recording waits for asynchronous final audio chunks and validation before publishing', async () => {
  const { VoiceRecorder } = await voice
  const events = [], tracks = { stop() {} }
  let recorder, approve
  class Recorder {
    static isTypeSupported() { return true }
    constructor() { recorder = this; this.state = 'inactive'; this.mimeType = 'audio/webm' }
    start() { this.state = 'recording' }
    stop() { this.state = 'inactive' }
  }
  const recording = new VoiceRecorder({ Recorder, mediaDevices: { getUserMedia: async () => ({ getTracks: () => [tracks] }) }, extensions: ['webm'],
    onState: state => events.push(state), onError: error => assert.fail(error), onFile: file => events.push(file), validateFile: () => new Promise(resolve => { approve = resolve }) })
  await recording.start()
  recording.finish()
  assert.equal(recording.state, 'stopping')
  recorder.ondataavailable({ data: new Blob(['first-'], { type: 'audio/webm' }) })
  recorder.ondataavailable({ data: new Blob(['last'], { type: 'audio/webm' }) })
  const finalized = recorder.onstop()
  assert.equal(recording.state, 'processing')
  assert.ok(!events.some(item => item instanceof File))
  approve()
  await finalized
  assert.equal(recording.state, 'idle')
  assert.equal(await events.at(-1).text(), 'first-last')
  assert.equal(events.at(-2), 'idle')
})

test('silent or undecodable recordings never become upload files, and cancellation discards late validation', async () => {
  const { VoiceRecorder, validateRecordedAudio } = await voice
  let closed = 0
  class SilentContext {
    async decodeAudioData() { return { duration: 2, numberOfChannels: 1, getChannelData: () => new Float32Array(10) } }
    async close() { closed++ }
  }
  await assert.rejects(validateRecordedAudio(new Blob(['encoded']), SilentContext), /recording_silent/)
  assert.equal(closed, 1)
  class BrokenContext extends SilentContext { async decodeAudioData() { throw Error('decode') } }
  await assert.rejects(validateRecordedAudio(new Blob(['broken']), BrokenContext), /recording_failed/)
  assert.equal(closed, 2)
  const h = recordingHarness(VoiceRecorder)
  h.voice.validateFile = async () => { throw Error('recording_silent') }
  await h.voice.start(); h.voice.finish()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(h.files.length, 0)
  assert.deepEqual(h.errors, ['recording_silent'])
  assert.equal(h.voice.state, 'idle')
  let approve
  h.voice.validateFile = () => new Promise(resolve => { approve = resolve })
  await h.voice.start(); h.voice.finish(); h.voice.cancel(); approve()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(h.files.length, 0)
})
