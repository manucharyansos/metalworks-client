<template>
  <div class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
    <div v-if="$can('orders.create')" class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          {{
            isEditingMode
              ? 'Ստեղծել նոր պատվեր խմբագրելով'
              : 'Ստեղծել նոր պատվեր'
          }}
        </h1>
        <div class="w-24 h-1 bg-blue-600 rounded-full"></div>
      </div>

      <!-- Main Form Grid -->
      <div v-if="!isFiles" class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Client Information Card -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 w"
        >
          <div class="flex items-center mb-12 w-full">
            <div class="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
            <h2 class="text-xl font-semibold text-gray-900">
              Հաճախորդի տվյալներ
            </h2>
          </div>

          <select-with-label
            v-model="selectedClient"
            :data-value="users"
            label="Ընտրել հաճախորդ"
            :class="{
              'border-red-500 ring-2 ring-red-200 rounded-xl py-4 px-1.5':
                formSubmitted && !selectedClient,
            }"
            class="mb-6"
          />

          <div class="space-y-4">
            <div
              v-if="selectedClient"
              class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
            >
              <div class="flex items-center mb-4">
                <div
                  class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3"
                >
                  {{ selectedClient?.name?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">
                    {{ selectedClient?.name }}
                    {{ selectedClient?.last_name || '' }}
                  </h3>
                  <p class="text-sm text-blue-600 font-medium">
                    {{ selectedClient?.company_name || 'Անհատ' }}
                  </p>
                </div>
              </div>

              <div class="flex flex-col gap-4 mt-6 text-gray-700">
                <!-- Phone -->
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Հեռախոս</p>
                    <p class="font-medium">
                      {{ selectedClient?.phone || '—' }}
                    </p>
                    <p
                      v-if="selectedClient?.second_phone"
                      class="text-xs text-gray-500"
                    >
                      {{ selectedClient?.second_phone }}
                    </p>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Էլ․ փոստ</p>
                    <p class="font-medium">
                      {{ selectedClient?.user.email || '—' }}
                    </p>
                  </div>
                </div>

                <!-- Address -->
                <div class="flex items-center space-x-3 sm:col-span-2">
                  <div
                    class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-500">Հասցե</p>
                    <p class="font-medium">
                      {{ selectedClient?.address || '—' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- No client selected -->
            <div
              v-else
              class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300"
            >
              <div class="text-gray-400 mb-3">
                <svg
                  class="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p class="text-gray-600 font-medium">
                Խնդրում ենք ընտրել հաճախորդ
              </p>
              <p class="text-sm text-gray-500 mt-1">
                Սկսեք՝ ընտրելով հաճախորդ վերևի ցանկից
              </p>
            </div>
          </div>
        </div>

        <!-- Order Form Card -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
        >
          <div class="flex items-center mb-6">
            <div class="w-2 h-8 bg-indigo-500 rounded-full mr-3"></div>
            <h2 class="text-xl font-semibold text-gray-900">
              Պատվերի մանրամասներ
            </h2>
          </div>

          <create-order-form
            :is-editing-mode="isEditingMode"
            :success-button="'Հաստատել'"
            :cancel-button="'Չեղարկել'"
            class="space-y-6"
            :can-proceed-to-files="canProceedToFiles"
            :can-submit="canSubmit"
            @addButton="pmpFiles"
            @cancelButton="cancelBack"
            @selectFromOtherFactory="selectFromOtherFactory"
          >
            <!-- PMP Group Selection -->
            <template #pmpGroup>
              <div class="pmp-selector">
                <label
                  for="pmpGroup"
                  class="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Ծածկագիր <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="pmpGroup"
                    v-model="pmpGroupSearch"
                    type="text"
                    class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                    :class="{
                      'border-red-500 ring-2 ring-red-100':
                        formSubmitted && !selectedPmp,
                    }"
                    placeholder="Փնտրել ծածկագիր..."
                    @focus="isSelectPmpGroup = true"
                    @input="filterPmpGroups"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    @click="isSelectPmpGroup = !isSelectPmpGroup"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  v-if="isSelectPmpGroup"
                  class="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-auto"
                >
                  <ul class="py-2">
                    <li
                      v-for="pmp in filteredPmpGroups"
                      :key="pmp.id"
                      class="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors border-b border-gray-100 last:border-b-0"
                      @click="selectPmpGroup(pmp)"
                    >
                      <div class="flex justify-between items-center">
                        <div>
                          <p class="font-medium text-gray-900">
                            {{ pmp.group }}
                          </p>
                          <p class="text-sm text-gray-500">
                            {{ pmp.group_name }}
                          </p>
                        </div>
                        <div
                          class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          Ընտրել
                        </div>
                      </div>
                    </li>
                    <li
                      v-if="filteredPmpGroups.length === 0"
                      class="px-4 py-3 text-gray-500 text-center"
                    >
                      Չգտնվեց ծածկագիր
                    </li>
                  </ul>
                </div>
              </div>
            </template>

            <!-- PMP Name Selection -->
            <template #pmpName>
              <div class="pmp-selector">
                <label
                  for="pmpRemoteNumberName"
                  class="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Ընտրել Անունը <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="pmpRemoteNumberName"
                    v-model="pmpNameSearch"
                    type="text"
                    :disabled="!selectedPmp"
                    class="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                    :class="{
                      'border-red-500 ring-2 ring-red-100':
                        formSubmitted && !selectedPmpRemoteNumber,
                      'cursor-not-allowed opacity-50': !selectedPmp,
                    }"
                    placeholder="Փնտրել անուն..."
                    @focus="isSelectPmpName = !!selectedPmp"
                    @input="filterPmpNames"
                  />
                  <button
                    type="button"
                    :disabled="!selectedPmp"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    @click="isSelectPmpName = !isSelectPmpName"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  v-if="isSelectPmpName && selectedPmp"
                  class="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-auto"
                >
                  <ul class="py-2">
                    <li
                      v-for="(remoteNumber, index) in filteredPmpNames"
                      :key="index"
                      class="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors border-b border-gray-100 last:border-b-0"
                      @click="selectPmpRemoteNumber(remoteNumber)"
                    >
                      <div class="flex justify-between items-center">
                        <div>
                          <p class="font-medium text-gray-900">
                            {{ remoteNumber.remote_number }}
                          </p>
                          <p class="text-sm text-gray-500">
                            {{ remoteNumber.remote_number_name }}
                          </p>
                        </div>
                        <div
                          class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                        >
                          Ընտրել
                        </div>
                      </div>
                    </li>
                    <li
                      v-if="filteredPmpNames.length === 0"
                      class="px-4 py-3 text-gray-500 text-center"
                    >
                      Չգտնվեց անուն
                    </li>
                  </ul>
                </div>
              </div>
            </template>

            <!-- Finish Date -->
            <template #finishDate>
              <div>
                <label
                  for="finishDate"
                  class="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Անհաժեշտ ավարտի ամսաթիվ <span class="text-red-500">*</span>
                </label>
                <input-with-labels
                  id="finishDate"
                  v-model="finishDate"
                  type="datetime-local"
                  class="border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl"
                  :class="{
                    'border-red-500 ring-2 ring-red-100':
                      formSubmitted && !finishDate,
                  }"
                />
              </div>
            </template>

            <!-- Description -->
            <template #description>
              <div>
                <label
                  for="description"
                  class="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Նկարագրություն <span class="text-red-500">*</span>
                </label>
                <textarea-with-label
                  id="description"
                  v-model="description"
                  type="text"
                  class="border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl resize-none"
                  :class="{
                    'border-red-500 ring-2 ring-red-100':
                      formSubmitted && !description,
                  }"
                  :rows="4"
                  placeholder="Մուտքագրեք պատվերի նկարագրությունը..."
                />
              </div>
            </template>
          </create-order-form>
        </div>
      </div>

      <!-- Files View -->
      <div
        v-else
        class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <show-files
          :pmps="pmpsData"
          :factories="getFactory"
          :auto-open-factory-id="autoOpenFactoryId"
          :selected-files.sync="selectedFiles"
          :file-quantities.sync="fileQuantities"
          :remote-number-id="remote_number_id"
          @files-selected="handleFilesSelected"
          @back="isFiles = false"
        />

        <!-- Ընտրել կատարող յուրաքանչյուր գործարանի համար -->
        <div class="mt-8 space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Ընտրել կատարող յուրաքանչյուր գործարանի համար
          </h3>

          <div
            v-for="factory in selectedFactories"
            :key="factory.id"
            class="flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <div class="w-full sm:w-64 font-medium text-gray-700">
              {{ factory.name }}
            </div>

            <select
              v-model="factoryOperators[factory.id]"
              class="w-full sm:flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
            >
              <option :value="null" disabled>Ընտրել կատարող</option>
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

        <!-- Կոճակներ -->
        <div class="mt-8 flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="isFiles = false"
          >
            Վերադառնալ
          </button>
          <button
            type="button"
            class="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            @click="pmpFiles"
          >
            Պահպանել պատվերը
          </button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl p-6 shadow-xl">
          <div class="flex items-center space-x-3">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
            <span class="text-gray-700 font-medium">Պահպանվում է...</span>
          </div>
        </div>
      </div>

      <notifications />
    </div>
    <PermissionDenied v-else />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import CreateOrderForm from '~/components/modals/create/CreateOrderForm.vue'
import ShowFiles from '~/components/File/ShowFactoryFiles/ShowFiles.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

export default {
  components: {
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

      factoryOperators: {},
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('clients', ['allClients']),
    ...mapGetters('pmp', ['getPmpes', 'getPmp']),

    pmpsData() {
      const p = this.getPmp || {}
      const exists =
        !!p?.id ||
        (!!p?.group && Array.isArray(p?.remote_number)) ||
        Array.isArray(p?.files)
      return exists ? { exists: true, pmp: p } : { exists: false }
    },

    users() {
      return this.allClients
    },

    selectedFactories() {
      const files = this.getPmp?.files || []
      const factoryIds = new Set()

      this.selectedFiles.forEach((fileId) => {
        const file = files.find((f) => Number(f.id) === Number(fileId))
        if (file && file.factory_id != null) {
          factoryIds.add(Number(file.factory_id))
        }
      })

      const stores = Array.isArray(this.getFactory) ? this.getFactory : []
      return stores
        .filter((f) => factoryIds.has(Number(f.id)))
        .map((f) => ({ ...f, operators: f.operators || [] }))
    },

    canProceedToFiles() {
      return !!(
        this.selectedClient &&
        this.selectedPmp &&
        this.selectedPmpRemoteNumber &&
        this.finishDate &&
        this.description
      )
    },

    canSubmit() {
      return this.canProceedToFiles && !this.isEditingMode
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
    selectedPmp(newVal) {
      if (!newVal) {
        this.selectedPmpRemoteNumber = null
        this.pmpNameSearch = ''
        this.remote_number_id = null
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
      this.remote_number_id = pmp.id
      this.selectedPmp = pmp
      this.pmpGroupSearch = pmp.group
      this.isSelectPmpGroup = false
    },

    async selectPmpRemoteNumber(remoteNumber) {
      this.selectedPmpRemoteNumber = remoteNumber.remote_number
      this.pmpNameSearch = remoteNumber.remote_number
      this.isSelectPmpName = false
      this.remote_number_id = remoteNumber.id
      await this.checkPmpByRemoteNumber(remoteNumber.id)
    },

    filterPmpGroups() {
      this.isSelectPmpGroup = true
    },

    filterPmpNames() {
      this.isSelectPmpName = true
    },

    handleFilesSelected(files) {
      this.selectedFiles = files.map((file) => file.id)
      this.fileQuantities = files.reduce((acc, file) => {
        acc[file.id] = file.quantity
        return acc
      }, {})

      this.$notify({
        text: 'Ֆայլերը ընտրված են, ընտրեք կատարող(ներ) և պահպանեք պատվերը։',
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

      const invalidFiles = this.selectedFiles.filter(
        (id) => !this.fileQuantities[id] || this.fileQuantities[id] <= 0
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

      const factoryOperatorsArray = Object.entries(this.factoryOperators)
        .filter(([factoryId, userId]) => !!userId)
        .map(([factoryId, userId]) => ({
          factory_id: Number(factoryId),
          user_id: userId,
        }))

      const data = {
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
          text: `Պատվերը հաջողությամբ ստեղծվեց${
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
        this.$notify({
          text: `Սխալ՝ ${error.response?.data?.error || error.message}`,
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
      this.files_existing = true

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

      const factories = Array.isArray(this.getFactory) ? this.getFactory : []

      const factoryWithFiles = factories.find(
        (factory) => factory.files && factory.files.length > 0
      )

      this.autoOpenFactoryId = factoryWithFiles
        ? factoryWithFiles.id
        : factories[0]?.id || null

      this.isFiles = true
    },

    cancelBack() {
      this.$router.push('/engineer')
    },

    resetForm() {
      this.selectedClient = null
      this.selectedPmp = null
      this.selectedPmpRemoteNumber = null
      this.pmpGroupSearch = ''
      this.pmpNameSearch = ''
      this.description = ''
      this.finishDate = ''
      this.quantity = null
      this.formSubmitted = false
      this.isFiles = false
      this.autoOpenFactoryId = null
      this.remote_number_id = null
      this.selectedFiles = []
      this.fileQuantities = {}
      this.factoryOperators = {}
      this.files_existing = false
    },
  },
}
</script>

<style scoped>
.pmp-selector {
  position: relative;
}

.min-h-screen {
  min-height: calc(100vh - 4rem);
}

/* Custom scrollbar for dropdowns */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Focus states */
.focus\:ring-4:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
