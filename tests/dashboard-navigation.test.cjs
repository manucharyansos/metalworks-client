const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
function load(file) {
 let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
 if (file.endsWith('.vue')) source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
 const code = transformSync(source, { configFile: false, babelrc: false, plugins: [require('@babel/plugin-transform-modules-commonjs')] }).code
 const module = { exports: {} }
 new Function('require','module','exports',code)(name => name.endsWith('.vue') ? {} : name.startsWith('@/') ? load(name.slice(2)+'.js') : require(name),module,module.exports)
 return module.exports
}
function runtime(file) {
 const options = load(file).default, requests = [], vm = {
  ...options.data(), $store: { state: { auth: { user: { id: 7 } }, workspace: { company: { id: 1 } } } },
  $axios: { get(url,config) { return new Promise((resolve,reject) => requests.push({url,params:config?.params,resolve,reject})) } },
  $t: key => key, $emit() {}, $refs: {}, $nextTick() {}, $notify() {},
 }
 for (const [name,fn] of Object.entries(options.methods || {})) vm[name] = fn.bind(vm)
 for (const [name,fn] of Object.entries(options.computed || {})) Object.defineProperty(vm,name,{ get:fn.bind(vm) })
 return {vm,options,requests}
}
const response = (ids,page=1,last=2) => ({data:{orders:ids.map(id=>({id})),pagination:{current_page:page,last_page:last,total:13}}})
test('dashboard cards select independent task lists and overdue opens a modal without altering explorer filters', async () => {
 const {vm,requests} = runtime('pages/admin/index.vue')
 vm.filters.search='previous search';vm.filters.factory_id='12'
 const previous={...vm.filters};vm.activateMetric('overdue')
 assert.deepEqual(vm.filters,previous);assert.equal(requests.length,0)
 assert.deepEqual(vm.taskList.filters,{time_range:'overdue',sort:'deadline_asc'})
 for(const [key,filter] of [['created',{}],['confirmation',{confirmation:'waiting'}],['completed',{order_status:'completed'}],['canceled',{order_status:'canceled'}]]) {
  vm.activateMetric(key);const request=requests.at(-1)
  assert.equal(request.params.search,undefined);assert.equal(request.params.factory_id,undefined)
  for(const [field,value]of Object.entries(filter))assert.equal(request.params[field],value)
  request.resolve(response([key]));await Promise.resolve()
 }
})
test('workload opens current operator work across workshops and completion and cancellation have separate cards', () => {
 const {vm,requests}=runtime('pages/admin/index.vue');vm.summary={total_orders:30,completed_orders:3,canceled_orders:2,awaiting_engineer_confirmation:4}
 vm.filterByOperator({id:9,name:'Operator',factory:{id:2}})
 assert.equal(requests.length,0);assert.deepEqual(vm.taskList.filters,{operator_id:'9',work_state:'open'})
 assert.equal(vm.metrics.find(m=>m.key==='completed').value,3)
 assert.equal(vm.metrics.find(m=>m.key==='canceled').value,2)
 assert.equal(vm.metrics.find(m=>m.key==='confirmation').value,4)
})
test('modal pages use the complete filtered API and retry after an error', async () => {
 const {vm,requests}=runtime('components/admin/dashboard/TasksModal.vue');vm.filters={time_range:'overdue'}
 const first=vm.load();assert.deepEqual(requests[0].params,{time_range:'overdue',page:1,per_page:12});requests[0].resolve(response([1,2]));await first
 const second=vm.load(2);requests[1].reject(new Error('503'));await second;assert.equal(vm.error,true)
 const retry=vm.load(2);requests[2].resolve(response([13],2));await retry
 assert.equal(vm.error,false);assert.deepEqual(vm.orders.map(o=>o.id),[13]);assert.equal(vm.pagination.total,13)
})
test('modal ignores responses from superseded filters, closed dialogs and another company', async () => {
 const {vm,requests,options}=runtime('components/admin/dashboard/TasksModal.vue');vm.filters={operator_id:'1'}
 const old=vm.load();vm.filters={operator_id:'2'};const fresh=vm.load();requests[1].resolve(response([2]));await fresh;requests[0].resolve(response([1]));await old;assert.equal(vm.orders[0].id,2)
 const other=vm.load();vm.$store.state.workspace.company.id=2;requests[2].resolve(response([99]));await other;assert.equal(vm.orders[0].id,2)
 const closed=vm.load();options.beforeDestroy.call(vm);requests[3].resolve(response([98]));await closed;assert.equal(vm.orders[0].id,2)
})
test('modal refresh clamps a page removed by a task state change', async () => {
 const {vm,requests}=runtime('components/admin/dashboard/TasksModal.vue');vm.filters={confirmation:'waiting'}
 const pending=vm.load(2);requests[0].resolve(response([],2,1));await new Promise(r=>setImmediate(r));assert.equal(requests[1].params.page,1)
 requests[1].resolve(response([1],1,1));await pending;assert.equal(vm.pagination.current_page,1)
})
test('explorer rejects stale responses after selecting a different metric or company', async () => {
 const {vm,requests}=runtime('pages/admin/index.vue')
 const first=vm.loadOrders();vm.filters.confirmation='waiting';const latest=vm.loadOrders();requests[1].resolve(response([2]));await latest;requests[0].resolve(response([1]));await first;assert.equal(vm.orders[0].id,2)
 const other=vm.loadOrders();vm.$store.state.workspace.company.id=2;requests[2].reject(new Error('503'));await other;assert.equal(vm.orders[0].id,2)
})
test('general file type validation retains a failed draft and retries the same company API', async () => {
 const {vm,requests}=runtime('components/settings/GlobalFileTypes.vue');vm.newExtension='.JPG';vm.$i18n={locale:'en'};const sent=[]
 vm.$axios.post=async(url,data)=>{sent.push({url,data});if(sent.length===1)throw{response:{data:{errors:{extension:['Already exists']}}}}}
 await vm.save();assert.equal(vm.newExtension,'.JPG');assert.equal(vm.error,'Already exists')
 const retry=vm.save();await Promise.resolve();requests[0].resolve({data:[{id:3,extension:'jpg'}]});await retry
 assert.equal(vm.newExtension,'');assert.equal(vm.rows[0].extension,'jpg');assert.equal(sent[1].url,'/api/admin/file-extensions');assert.equal(sent[1].data.extension,'jpg')
})
test('workspace label keys stay valid across all three languages when visible customer labels change', () => {
 const layouts = ['admin','manager','engineer','factory'].map(name => path.join(__dirname,'../layouts/'+name+'.vue')).filter(file => fs.existsSync(file))
 const keys = new Set(layouts.flatMap(file => fs.readFileSync(file,'utf8').match(/(?:workspace_layout|admin_layout)\.[a-z_]+/g) || []))
 for (const locale of ['hy','ru','en']) {
  const dictionary = JSON.parse(fs.readFileSync(path.join(__dirname,'../locales/'+locale+'.json'),'utf8'))
  for (const key of keys) assert.equal(typeof key.split('.').reduce((value,part) => value?.[part],dictionary),'string',`${locale}: ${key}`)
 }
})
