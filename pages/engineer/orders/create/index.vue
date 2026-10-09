<template>
  <main
    data-workspace-form
    class="order-create-page min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8"
  >
    <div v-if="$can('orders.create')" class="mx-auto max-w-7xl">
      <div
        class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{
              $t(
                isEditingMode ? 'order_create.edit_title' : 'order_create.title'
              )
            }}
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ $t('order_create.subtitle') }}
          </p>
        </div>
        <div
          class="flex items-center gap-2 text-xs font-medium"
          aria-live="polite"
        >
          <span
            class="rounded-lg px-3 py-2"
            :class="
              !isFiles
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            "
            >01 · {{ $t('order_create.details') }}</span
          >
          <span
            class="rounded-lg px-3 py-2"
            :class="
              isFiles
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            "
            >02 · {{ $t('order_create.files') }}</span
          >
        </div>
      </div>

      <div
        v-if="orderFileIssue"
        role="status"
        class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <p>{{ $t(orderFileIssue) }}</p>
        <button
          v-if="pmpFilesLoadError"
          type="button"
          class="mt-2 font-semibold underline"
          @click="loadSelectedPmpFiles"
        >
          {{ $t('order_files.retry') }}
        </button>
      </div>

      <div
        v-if="!isFiles"
        class="grid items-start gap-5 lg:grid-cols-[minmax(260px,_1fr)_2fr]"
      >
        <section
          class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <h2 class="mb-5 text-base font-semibold">
            {{ $t('order_create.client_details') }}
          </h2>
          <select-with-label
            v-model="selectedClient"
            :data-value="users"
            name="orderClient"
            :label="$t('order_create.choose_client')"
            :placeholder="$t('order_create.choose_client')"
            :class="{
              'rounded-xl ring-2 ring-red-400':
                formSubmitted && !selectedClient,
            }"
          />
          <div
            v-if="selectedClient"
            class="mt-5 min-w-0 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
          >
            <div class="mb-5 flex items-start gap-3">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-700"
                >{{ selectedClient?.name?.charAt(0).toUpperCase() }}</span
              >
              <div class="min-w-0">
                <h3 class="break-words text-sm font-semibold">
                  {{ selectedClient?.name }}
                  {{ selectedClient?.last_name || '' }}
                </h3>
                <p
                  class="mt-1 break-words text-xs text-slate-500 dark:text-slate-400"
                >
                  {{
                    selectedClient?.company_name ||
                    $t('order_create.individual')
                  }}
                </p>
              </div>
            </div>
            <dl class="space-y-4 text-sm">
              <div>
                <dt class="text-xs text-slate-500 dark:text-slate-400">
                  {{ $t('order_create.phone') }}
                </dt>
                <dd class="mt-1 break-words">
                  {{ selectedClient?.phone || '—'
                  }}<span
                    v-if="selectedClient?.second_phone"
                    class="mt-1 block"
                    >{{ selectedClient.second_phone }}</span
                  >
                </dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500 dark:text-slate-400">
                  {{ $t('order_create.email') }}
                </dt>
                <dd class="mt-1 break-all">
                  {{ selectedClient?.user?.email || '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500 dark:text-slate-400">
                  {{ $t('order_create.address') }}
                </dt>
                <dd class="mt-1 break-words">
                  {{ selectedClient?.address || '—' }}
                </dd>
              </div>
            </dl>
          </div>
          <div
            v-else
            class="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700"
          >
            <svg
              class="mx-auto mb-3 h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ $t('order_create.client_hint') }}
            </p>
          </div>
        </section>

        <section
          class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <h2 class="mb-5 text-base font-semibold">
            {{ $t('order_create.order_details') }}
          </h2>
          <create-order-form
            :is-editing-mode="isEditingMode"
            :success-button="$t('order_create.create')"
            :cancel-button="$t('order_create.cancel')"
            class="order-form"
            :can-proceed-to-files="canProceedToFiles"
            :can-submit="canSubmit"
            @addButton="pmpFiles"
            @cancelButton="cancelBack"
            @selectFromOtherFactory="selectFromOtherFactory"
          >
            <template #pmpGroup>
              <div class="pmp-selector">
                <label for="pmpGroup" class="order-label"
                  >{{ $t('order_create.group_code') }}
                  <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <input
                    id="pmpGroup"
                    v-model="pmpGroupSearch"
                    type="text"
                    class="order-input pr-10"
                    :class="{
                      'border-red-500 ring-2 ring-red-100':
                        formSubmitted && !selectedPmp,
                    }"
                    :placeholder="$t('order_create.search_group')"
                    @focus="isSelectPmpGroup = true"
                    @input="filterPmpGroups"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 px-3 text-slate-400"
                    :aria-label="$t('order_create.show_options')"
                    :aria-expanded="isSelectPmpGroup"
                    @click="isSelectPmpGroup = !isSelectPmpGroup"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>
                </div>
                <div v-if="isSelectPmpGroup" class="order-menu">
                  <ul class="py-1">
                    <li v-for="pmp in filteredPmpGroups" :key="pmp.id">
                      <button
                        type="button"
                        class="order-option"
                        @click="selectPmpGroup(pmp)"
                      >
                        <span class="font-mono text-sm font-semibold">{{
                          pmp.group
                        }}</span
                        ><span
                          class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                          >{{ pmp.group_name }}</span
                        >
                      </button>
                    </li>
                    <li
                      v-if="filteredPmpGroups.length === 0"
                      class="px-4 py-4 text-center text-sm text-slate-500"
                    >
                      {{ $t('order_create.group_missing') }}
                    </li>
                  </ul>
                </div>
              </div>
            </template>
            <template #pmpName>
              <div class="pmp-selector">
                <label for="pmpRemoteNumberName" class="order-label"
                  >{{ $t('order_create.subgroup') }}
                  <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <input
                    id="pmpRemoteNumberName"
                    v-model="pmpNameSearch"
                    type="text"
                    :disabled="!selectedPmp"
                    class="order-input pr-10"
                    :class="{
                      'border-red-500 ring-2 ring-red-100':
                        formSubmitted && !selectedPmpRemoteNumber,
                    }"
                    :placeholder="$t('order_create.search_subgroup')"
                    @focus="isSelectPmpName = !!selectedPmp"
                    @input="filterPmpNames"
                  />
                  <button
                    type="button"
                    :disabled="!selectedPmp"
                    class="absolute inset-y-0 right-0 px-3 text-slate-400 disabled:opacity-40"
                    :aria-label="$t('order_create.show_options')"
                    :aria-expanded="isSelectPmpName"
                    @click="isSelectPmpName = !isSelectPmpName"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>
                </div>
                <div v-if="isSelectPmpName && selectedPmp" class="order-menu">
                  <ul class="py-1">
                    <li
                      v-for="(remoteNumber, index) in filteredPmpNames"
                      :key="index"
                    >
                      <button
                        type="button"
                        class="order-option"
                        @click="selectPmpRemoteNumber(remoteNumber)"
                      >
                        <span class="font-mono text-sm font-semibold">{{
                          remoteNumber.remote_number
                        }}</span
                        ><span
                          class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                          >{{ remoteNumber.remote_number_name }}</span
                        >
                      </button>
                    </li>
                    <li
                      v-if="filteredPmpNames.length === 0"
                      class="px-4 py-4 text-center text-sm text-slate-500"
                    >
                      {{ $t('order_create.subgroup_missing') }}
                    </li>
                  </ul>
                </div>
              </div>
            </template>
            <template #finishDate>
              <div>
                <label for="finishDate" class="order-label"
                  >{{ $t('order_create.finish_date') }}
                  <span class="text-red-500">*</span></label
                >
                <input-with-labels
                  id="finishDate"
                  v-model="finishDate"
                  type="datetime-local"
                  class="date-field"
                  :class="{
                    'rounded-xl ring-2 ring-red-400':
                      formSubmitted && !finishDate,
                  }"
                />
              </div>
            </template>
            <template #description>
              <div>
                <label for="description" class="order-label"
                  >{{ $t('order_create.description') }}
                  <span class="text-red-500">*</span></label
                >
                <textarea-with-label
                  v-model="description"
                  textarea_id="description"
                  class="description-field"
                  :class="{
                    'rounded-xl ring-2 ring-red-400':
                      formSubmitted && !description,
                  }"
                  :rows="4"
                  :placeholder="$t('order_create.description_placeholder')"
                />
              </div>
            </template>
          </create-order-form>
          <TaskCreationOptions
            :confirmation-required.sync="confirmationRequired"
            :confirmation-method.sync="confirmationMethod"
            :reference-visibility.sync="referenceVisibility"
            :files="effectiveFiles"
            :factories="getFactory || []"
          />
          <p class="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {{ $t('order_create.files_hint') }}
          </p>
        </section>
      </div>

      <section
        v-else
        class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      >
        <show-files
          :pmps="pmpsData"
          :factories="getFactory"
          :auto-open-factory-id="autoOpenFactoryId"
          :selected-files.sync="selectedFiles"
          :file-quantities.sync="fileQuantities"
          :remote-number-id="remote_number_id"
          class="order-files"
          @files-selected="handleFilesSelected"
          @back="isFiles = false"
        />
        <TaskCreationOptions
          :confirmation-required.sync="confirmationRequired"
          :confirmation-method.sync="confirmationMethod"
          :reference-visibility.sync="referenceVisibility"
          :files="effectiveFiles"
          :factories="getFactory || []"
        />
        <div class="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 class="mb-4 text-sm font-semibold">
            {{ $t('order_create.factory_operators') }}
          </h3>
          <div
            v-for="factory in selectedFactories"
            :key="factory.id"
            class="mb-3 grid items-center gap-2 sm:grid-cols-[180px_1fr]"
          >
            <label
              :for="'factory-operator-' + factory.id"
              class="text-sm text-slate-600 dark:text-slate-300"
              >{{ factory.name }}</label
            >
            <select
              :id="'factory-operator-' + factory.id"
              v-model="factoryOperators[factory.id]"
              class="order-input"
            >
              <option :value="null" disabled>
                {{ $t('order_create.choose_operator') }}
              </option>
              <option
                v-for="user in getFactoryOperatorsFor(factory)"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }}
              </option>
            </select>
          </div>
        </div>
        <div
          class="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800"
        >
          <button
            type="button"
            class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            @click="isFiles = false"
          >
            {{ $t('order_create.back') }}
          </button>
          <button
            type="button"
            :disabled="!canSubmit || isLoading"
            class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            @click="pmpFiles"
          >
            {{ $t('order_create.save') }}
          </button>
        </div>
      </section>
      <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
        role="status"
      >
        <div
          class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-t-white"
          ></div>
          <span class="text-sm font-medium">{{
            $t('order_create.saving')
          }}</span>
        </div>
      </div>
      <notifications />
    </div>
    <PermissionDenied v-else />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import TaskCreationOptions from '@/components/engineer/TaskCreationOptions.vue'
import { isReferenceFactory, taskCopy } from '@/utils/task-workflow'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import CreateOrderForm from '~/components/modals/create/CreateOrderForm.vue'
import ShowFiles from '~/components/File/ShowFactoryFiles/ShowFiles.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

export default {
  components: {
    TaskCreationOptions,
    PermissionDenied,
    InputWithLabels,
    SelectWithLabel,
    CreateOrderForm,
    ShowFiles,
    TextareaWithLabel,
  },
  layout: 'engineer',
  middleware: ['engineer'],
  data() {
    return {
      isSelectedClient: false,
      isSelectPmpGroup: false,
      isSelectPmpName: false,
      selectedClient: null,
      pmpGroupSearch: '',
      pmpNameSearch: '',
      selectedPmp: null,
      selectedPmpRemoteNumber: null,
      quantity: null,
      description: '',
      finishDate: '',
      formSubmitted: false,
      isFiles: false,
      selectedFiles: [],
      fileQuantities: {},
      autoOpenFactoryId: null,
      isLoading: false,
      files_existing: false,
      remote_number_id: null,
      orderPmp: null,
      pmpFilesLoading: false,
      pmpFilesLoadError: false,
      pmpFileRequestId: 0,

      factoryOperators: {},
      confirmationRequired: false,
      confirmationMethod: '',
      referenceVisibility: {},
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('clients', ['allClients']),
    ...mapGetters('pmp', ['getPmpes', 'getPmp']),

    pmpsData() {
      const p = this.orderPmp
      return p && Number(p.id) === Number(this.selectedPmp?.id)
        ? { exists: true, pmp: p }
        : { exists: false }
    },

    subgroupFiles() {
      if (!this.pmpsData.exists || !this.remote_number_id) return []
      return (this.orderPmp.files || []).filter(
        (file) =>
          Number(file.remote_number_id) === Number(this.remote_number_id)
      )
    },

    pmpFilesReady() {
      return !!(
        this.pmpsData.exists &&
        this.remote_number_id &&
        !this.pmpFilesLoading &&
        !this.pmpFilesLoadError
      )
    },

    validSelectedFiles() {
      const allowedIds = new Set(
        this.subgroupFiles.map((file) => Number(file.id))
      )
      return (
        this.selectedFiles.length > 0 &&
        this.selectedFiles.every((id) => {
          const quantity = Number(this.fileQuantities[id])
          return (
            allowedIds.has(Number(id)) &&
            Number.isInteger(quantity) &&
            quantity > 0
          )
        })
      )
    },

    orderFileIssue() {
      if (!this.remote_number_id) return null
      if (this.pmpFilesLoading) return 'order_files.loading'
      if (this.pmpFilesLoadError) return 'order_files.load_failed'
      if (!this.pmpFilesReady) return null
      if (this.subgroupFiles.length === 0) return 'order_files.empty_subgroup'
      if (this.files_existing && this.selectedFiles.length === 0)
        return 'order_files.select_files'
      return null
    },

    effectiveFiles() {
      return this.files_existing
        ? this.subgroupFiles.filter((file) =>
            this.selectedFiles.some((id) => Number(id) === Number(file.id))
          )
        : this.subgroupFiles
    },
    users() {
      return this.allClients
    },

    selectedFactories() {
      const files = this.effectiveFiles
      const factoryIds = new Set(files.map((file) => Number(file.factory_id)))

      this.selectedFiles.forEach((fileId) => {
        const file = files.find((f) => Number(f.id) === Number(fileId))
        if (file && file.factory_id != null) {
          factoryIds.add(Number(file.factory_id))
        }
      })

      const stores = Array.isArray(this.getFactory) ? this.getFactory : []
      return stores
        .filter((f) => factoryIds.has(Number(f.id)) && !isReferenceFactory(f))
        .map((f) => ({ ...f, operators: f.operators || [] }))
    },

    canProceedToFiles() {
      return !!(
        this.selectedClient &&
        this.selectedPmp &&
        this.selectedPmpRemoteNumber &&
        this.finishDate &&
        this.description &&
        this.pmpFilesReady &&
        this.subgroupFiles.length > 0
      )
    },

    canSubmit() {
      // The existing API uses false for all subgroup files, true for a selection.
      return (
        this.canProceedToFiles &&
        (!this.confirmationRequired ||
          ['photo', 'text'].includes(this.confirmationMethod)) &&
        this.selectedFactories.length > 0 &&
        !this.isEditingMode &&
        (!this.files_existing || this.validSelectedFiles)
      )
    },

    filteredPmpGroups() {
      if (!this.pmpGroupSearch) return this.getPmpes?.pmp || []
      const searchTerm = this.pmpGroupSearch.toLowerCase()
      return this.getPmpes?.pmp.filter(
        (pmp) =>
          pmp.group.toLowerCase().includes(searchTerm) ||
          pmp.group_name.toLowerCase().includes(searchTerm)
      )
    },

    filteredPmpNames() {
      if (!this.selectedPmp) return []
      const remoteNumbers = this.selectedPmp.remote_number || []
      if (!this.pmpNameSearch) return remoteNumbers
      const searchTerm = this.pmpNameSearch.toLowerCase()
      return remoteNumbers.filter((rn) =>
        rn.remote_number.toLowerCase().includes(searchTerm)
      )
    },

    isEditingMode() {
      return this.$route.path.includes('/editing')
    },
  },
  watch: {
    confirmationRequired(value) {
      if (!value) this.confirmationMethod = ''
    },
    selectedPmp(newVal, oldVal) {
      if (!newVal || newVal.id !== oldVal?.id) {
        this.selectedPmpRemoteNumber = null
        this.pmpNameSearch = ''
        this.remote_number_id = null
        this.resetPmpFileSelection()
      }
    },
    selectedFactories(newFactories) {
      const allowedIds = new Set(newFactories.map((factory) => factory.id))

      newFactories.forEach((factory) => {
        if (!(factory.id in this.factoryOperators)) {
          this.$set(this.factoryOperators, factory.id, null)
        }
      })

      Object.keys(this.factoryOperators).forEach((factoryId) => {
        if (!allowedIds.has(Number(factoryId))) {
          this.$delete(this.factoryOperators, factoryId)
        }
      })
    },
  },
  mounted() {
    this.fetchClients()
    this.fetchFactory()
    this.fetchPmps()
  },
  methods: {
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('clients', ['fetchClients']),
    ...mapActions('engineer', ['createNewOrder']),
    ...mapActions('pmp', [
      'fetchPmps',
      'checkPmpByRemoteNumber',
      'checkIfGroupExists',
    ]),

    selectPmpGroup(pmp) {
      this.$workspace?.setDirty(true)
      if (this.selectedPmp?.id !== pmp.id) {
        this.selectedPmpRemoteNumber = null
        this.pmpNameSearch = ''
        this.remote_number_id = null
        this.resetPmpFileSelection()
      }
      this.selectedPmp = pmp
      this.pmpGroupSearch = pmp.group
      this.isSelectPmpGroup = false
    },

    async selectPmpRemoteNumber(remoteNumber) {
      this.$workspace?.setDirty(true)
      if (Number(this.remote_number_id) !== Number(remoteNumber.id))
        this.resetPmpFileSelection()
      this.selectedPmpRemoteNumber = remoteNumber.remote_number
      this.pmpNameSearch = remoteNumber.remote_number
      this.isSelectPmpName = false
      this.remote_number_id = remoteNumber.id
      await this.loadSelectedPmpFiles()
    },

    async loadSelectedPmpFiles() {
      if (!this.selectedPmp || !this.remote_number_id) return
      const requestId = ++this.pmpFileRequestId
      const pmpId = this.selectedPmp.id
      const remoteId = this.remote_number_id
      this.pmpFilesLoading = true
      this.pmpFilesLoadError = false
      try {
        const exists = await this.checkPmpByRemoteNumber(remoteId)
        if (requestId !== this.pmpFileRequestId) return
        if (
          !exists ||
          Number(this.getPmp?.id) !== Number(pmpId) ||
          !Array.isArray(this.getPmp?.files)
        ) {
          this.pmpFilesLoadError = true
          return
        }
        this.orderPmp = this.getPmp
      } catch (error) {
        if (requestId === this.pmpFileRequestId) this.pmpFilesLoadError = true
      } finally {
        if (requestId === this.pmpFileRequestId) this.pmpFilesLoading = false
      }
    },

    resetPmpFileSelection() {
      this.selectedFiles = []
      this.fileQuantities = {}
      this.factoryOperators = {}
      this.referenceVisibility = {}
      this.autoOpenFactoryId = null
      this.orderPmp = null
      this.files_existing = false
      this.isFiles = false
      this.pmpFileRequestId++
      this.pmpFilesLoading = false
      this.pmpFilesLoadError = false
    },

    filterPmpGroups() {
      this.isSelectPmpGroup = true
    },

    filterPmpNames() {
      this.isSelectPmpName = true
    },

    handleFilesSelected(files) {
      this.$workspace?.setDirty(true)
      this.selectedFiles = files.map((file) => file.id)
      this.fileQuantities = files.reduce((acc, file) => {
        acc[file.id] = file.quantity
        return acc
      }, {})

      this.$notify({
        text: 'Ֆայլերը ընտրված են, ընտրեք կատարող(ներ) և պահպանեք առաջադրանքը։',
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },

    getFactoryOperatorsFor(factory) {
      return factory.operators || []
    },

    async pmpFiles() {
      if (this.isLoading) return
      this.isLoading = true
      this.formSubmitted = true

      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.remote_number_id ||
        !this.finishDate ||
        !this.description ||
        (this.isEditingMode &&
          (!this.quantity ||
            this.quantity <= 0 ||
            !this.selectedFiles ||
            this.selectedFiles.length === 0))
      ) {
        this.$notify({
          text: `Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը${
            this.isEditingMode ? ' և ընտրել ֆայլեր' : ''
          }։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        this.isLoading = false
        return
      }

      if (!this.validateOrderFiles()) {
        this.isLoading = false
        return
      }

      const invalidFiles = this.selectedFiles.filter(
        (id) =>
          !Number.isInteger(Number(this.fileQuantities[id])) ||
          Number(this.fileQuantities[id]) <= 0
      )
      if (invalidFiles.length > 0) {
        this.$notify({
          text: 'Խնդրում ենք սահմանել վավեր քանակ (1 կամ ավելի) բոլոր ընտրված ֆայլերի համար։',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        this.isLoading = false
        return
      }

      if (
        this.confirmationRequired &&
        !['photo', 'text'].includes(this.confirmationMethod)
      ) {
        this.$notify({
          text: (taskCopy[this.$i18n?.locale] || taskCopy.hy).invalidMethod,
          type: 'error',
        })
        this.isLoading = false
        return
      }
      const factoryOperatorsArray = Object.entries(this.factoryOperators)
        .filter(([factoryId, userId]) => !!userId)
        .map(([factoryId, userId]) => ({
          factory_id: Number(factoryId),
          user_id: userId,
        }))

      const data = {
        confirmation_required: this.confirmationRequired,
        confirmation_method: this.confirmationRequired
          ? this.confirmationMethod
          : null,
        reference_file_visibility: this.effectiveFiles
          .filter((file) =>
            isReferenceFactory(
              (this.getFactory || []).find(
                (factory) => Number(factory.id) === Number(file.factory_id)
              )
            )
          )
          .map((file) => ({
            file_id: file.id,
            factory_ids: (this.referenceVisibility[file.id] || []).filter(
              (id) =>
                this.selectedFactories.some(
                  (factory) => Number(factory.id) === Number(id)
                )
            ),
          })),
        user_id: this.selectedClient.user.id,
        creator_id: this.$auth.user.id,
        name: `${this.selectedPmp.group}.${this.selectedPmpRemoteNumber}`,
        description: this.description,
        quantity: this.quantity,
        status: 'pending',
        finish_date: this.finishDate,
        remote_number_id: this.remote_number_id,
        pmp_id: this.selectedPmp.id,
        link_existing_files: this.files_existing,
        selected_files: this.selectedFiles.map((id) => ({
          id,
          quantity: this.fileQuantities[id],
        })),
        factory_operators: factoryOperatorsArray,
      }

      try {
        await this.createNewOrder(data)
        this.$notify({
          text: `Առաջադրանքը հաջողությամբ ստեղծվեց${
            this.selectedFiles.length > 0
              ? ` ${this.selectedFiles.length} ֆայլով`
              : ''
          }։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
        this.resetForm()
        this.$router.push('/engineer')
      } catch (error) {
        const validationMessage = Object.values(
          error.response?.data?.errors || {}
        )
          .flat()
          .find((message) => typeof message === 'string')
        this.$notify({
          text: `Սխալ՝ ${
            validationMessage || error.response?.data?.error || error.message
          }`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      } finally {
        this.isLoading = false
      }
    },

    selectFromOtherFactory() {
      this.formSubmitted = true

      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.finishDate ||
        !this.description ||
        (this.isEditingMode && (!this.quantity || this.quantity <= 0))
      ) {
        this.$notify({
          text: `Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }

      if (!this.validateOrderFiles(false)) return
      this.files_existing = true
      const factories = Array.isArray(this.getFactory) ? this.getFactory : []

      const factoryWithFiles = factories.find((factory) =>
        this.subgroupFiles.some(
          (file) => Number(file.factory_id) === Number(factory.id)
        )
      )

      this.autoOpenFactoryId = factoryWithFiles
        ? factoryWithFiles.id
        : factories[0]?.id || null

      this.isFiles = true
    },

    validateOrderFiles(requireSelection = this.files_existing) {
      let issue = null
      if (this.pmpFilesLoading) issue = 'order_files.loading'
      else if (!this.pmpFilesReady) issue = 'order_files.load_failed'
      else if (this.subgroupFiles.length === 0)
        issue = 'order_files.empty_subgroup'
      else if (requireSelection && this.selectedFiles.length === 0)
        issue = 'order_files.select_files'
      else {
        const allowedIds = new Set(
          this.subgroupFiles.map((file) => Number(file.id))
        )
        if (this.selectedFiles.some((id) => !allowedIds.has(Number(id))))
          issue = 'order_files.wrong_subgroup'
      }
      if (!issue) return true
      this.$notify({ text: this.$t(issue), type: 'error', duration: 4000 })
      return false
    },

    cancelBack() {
      this.$router.push('/engineer')
    },

    resetForm() {
      this.$workspace?.setDirty(false)
      this.selectedClient = null
      this.selectedPmp = null
      this.selectedPmpRemoteNumber = null
      this.pmpGroupSearch = ''
      this.pmpNameSearch = ''
      this.description = ''
      this.finishDate = ''
      this.quantity = null
      this.formSubmitted = false
      this.confirmationRequired = false
      this.confirmationMethod = ''
      this.isFiles = false
      this.remote_number_id = null
      this.resetPmpFileSelection()
    },
  },
}
</script>

<style scoped>
.pmp-selector {
  position: relative;
  min-width: 0;
}
.order-label {
  @apply mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300;
}
.order-input,
.date-field ::v-deep input,
.description-field ::v-deep textarea {
  @apply block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800;
}
.date-field ::v-deep label,
.description-field ::v-deep label {
  display: none;
}
.order-menu {
  @apply absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900;
}
.order-option {
  @apply w-full break-words px-4 py-3 text-left transition hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800;
}
.order-form {
  @apply border-0 bg-transparent p-0 shadow-none;
  backdrop-filter: none;
}
.order-files {
  @apply border-0 bg-transparent p-0 shadow-none;
  backdrop-filter: none;
}
</style>
