<template>
  <main
    class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6"
  >
    <div class="mx-auto max-w-7xl space-y-6">
      <!-- Global header with BACK -->
      <header
        class="rounded-2xl overflow-hidden shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
      >
        <div class="p-5 md:p-8 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold font-montserrat">
                {{
                  isEditingMode
                    ? 'Ստեղծել նոր պատվեր խմբագրելով'
                    : 'Ստեղծել նոր պատվեր'
                }}
              </h1>
              <p class="mt-1 md:mt-2 text-indigo-100">
                Հաճախորդ, PMP և ֆայլերի արագ ընտրություն
              </p>
            </div>
          </div>

          <transition name="fade">
            <div
              v-if="isLoading"
              class="flex items-center gap-2 text-indigo-100"
            >
              <span class="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              <span
                class="h-2 w-2 rounded-full bg-white/80 animate-pulse delay-150"
              ></span>
              <span
                class="h-2 w-2 rounded-full bg-white/60 animate-pulse delay-300"
              ></span>
              <span class="text-sm">Պահպանվում է…</span>
            </div>
          </transition>
        </div>
      </header>

      <!-- Secondary back on details step -->
      <div v-if="!isFiles" class="flex justify-between items-center">
        <button
          class="inline-flex items-center text-indigo-700 hover:text-indigo-900"
          type="button"
          @click="goBackToList"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Վերադառնալ ցանկին
        </button>
        <div class="text-sm text-gray-500">
          Քայլ՝
          <span class="font-medium">{{
            isFiles ? 'Ֆայլեր' : 'Մանրամասներ'
          }}</span>
        </div>
      </div>

      <!-- Main content -->
      <div v-if="!isFiles" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Client card -->
        <section
          class="relative w-full h-full p-5 md:p-6 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/60"
        >
          <select-with-label
            v-model="selectedClient"
            :data-value="clients"
            label="Ընտրել հաճախորդ"
            :class="{ 'ring-2 ring-red-400': formSubmitted && !selectedClient }"
          />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-6">
            <input-with-labels
              id="name"
              :value="selectedClient?.name"
              label="Անուն"
              type="text"
              :disabled="true"
              class="rounded-lg"
            />
            <input-with-labels
              id="phone"
              :value="selectedClient?.client?.phone"
              label="Հեռախոսահամար"
              type="text"
              :disabled="true"
              class="rounded-lg"
            />
            <input-with-labels
              id="email"
              :value="selectedClient?.email"
              label="Էլ․ փոստ"
              type="text"
              :disabled="true"
              class="rounded-lg"
            />
            <input-with-labels
              id="address"
              :value="selectedClient?.client?.address"
              label="Հասցե"
              type="text"
              :disabled="true"
              class="rounded-lg"
            />
          </div>

          <transition name="fade">
            <div
              v-if="!selectedClient"
              class="space-y-3 mt-4"
              aria-hidden="true"
            >
              <div class="h-3 rounded bg-gray-100 animate-pulse"></div>
              <div class="h-3 rounded bg-gray-100 animate-pulse"></div>
              <div class="h-3 rounded bg-gray-100 animate-pulse"></div>
            </div>
          </transition>
        </section>

        <!-- Order form -->
        <section class="w-full">
          <create-order-form
            :is-editing-mode="isEditingMode"
            :open-files-button="'Շարունակել դեպի ֆայլեր'"
            :success-button="'Հաստատել'"
            :edit-button="'Խմբագրել (ֆայլեր)'"
            @openFiles="openFiles(true)"
            @addButton="pmpFiles"
            @cancelButton="goBackToList"
          >
            <!-- PMP Group -->
            <template #pmpGroup>
              <div
                class="relative rounded-xl p-3 pt-5 border border-gray-100 shadow-sm bg-white"
              >
                <label
                  for="pmpGroup"
                  class="block text-sm font-medium text-gray-600 mb-1"
                  >Ծածկագիր</label
                >
                <div class="relative">
                  <input
                    id="pmpGroup"
                    v-model="pmpGroupSearch"
                    type="text"
                    class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Փնտրել ծածկագիր"
                    @focus="isSelectPmpGroup = true"
                    @input="onGroupSearch"
                    @keydown.down.prevent="focusNext('group')"
                    @keydown.esc="isSelectPmpGroup = false"
                    autocomplete="off"
                    aria-haspopup="listbox"
                    :aria-expanded="isSelectPmpGroup ? 'true' : 'false'"
                  />
                  <button
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    type="button"
                    @click="isSelectPmpGroup = !isSelectPmpGroup"
                    aria-label="Բացել ընտրացանկը"
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

                <transition name="dropdown">
                  <div
                    v-if="isSelectPmpGroup"
                    ref="groupMenu"
                    class="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto"
                    role="listbox"
                  >
                    <ul class="py-1">
                      <li
                        v-for="pmp in filteredPmpGroups"
                        :key="pmp.id"
                        class="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700 transition"
                        :class="{
                          'ring-1 ring-red-400': formSubmitted && !selectedPmp,
                        }"
                        @click="selectPmpGroup(pmp)"
                      >
                        <span class="font-medium text-gray-800">{{
                          pmp.group
                        }}</span>
                        <span class="text-gray-500">
                          · {{ pmp.group_name }}</span
                        >
                      </li>
                    </ul>
                  </div>
                </transition>
              </div>
            </template>

            <!-- PMP Name -->
            <template #pmpName>
              <div
                class="relative rounded-xl p-3 pt-5 border border-gray-100 shadow-sm bg-white"
              >
                <label
                  for="pmpRemoteNumberName"
                  class="block text-sm font-medium text-gray-600 mb-1"
                  >Ընտրել Անունը</label
                >
                <div class="relative">
                  <input
                    id="pmpRemoteNumberName"
                    v-model="pmpNameSearch"
                    type="text"
                    class="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition disabled:bg-gray-50"
                    placeholder="Փնտրել անուն"
                    :disabled="!selectedPmp"
                    @focus="isSelectPmpName = !!selectedPmp"
                    @input="onNameSearch"
                    @keydown.down.prevent="focusNext('name')"
                    @keydown.esc="isSelectPmpName = false"
                    autocomplete="off"
                    aria-haspopup="listbox"
                    :aria-expanded="isSelectPmpName ? 'true' : 'false'"
                  />
                  <button
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    :disabled="!selectedPmp"
                    type="button"
                    @click="isSelectPmpName = !isSelectPmpName"
                    aria-label="Բացել ընտրացանկը"
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

                <transition name="dropdown">
                  <div
                    v-if="isSelectPmpName && selectedPmp"
                    ref="nameMenu"
                    class="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto"
                    role="listbox"
                  >
                    <ul class="py-1">
                      <li
                        v-for="(remoteNumber, index) in filteredPmpNames"
                        :key="index"
                        class="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700 transition"
                        :class="{
                          'ring-1 ring-red-400':
                            formSubmitted && !selectedPmpRemoteNumber,
                        }"
                        @click="selectPmpRemoteNumber(remoteNumber)"
                      >
                        <span class="font-medium text-gray-800">{{
                          remoteNumber.remote_number
                        }}</span>
                        <span class="text-gray-500">
                          · {{ remoteNumber.remote_number_name }}</span
                        >
                      </li>
                    </ul>
                  </div>
                </transition>
              </div>
            </template>

            <!-- Finish Date -->
            <template #finishDate>
              <input-with-labels
                id="finishDate"
                v-model="finishDate"
                label="Անհաժեշտ ավարտի ամսաթիվ"
                type="datetime-local"
                class="rounded-xl bg-white border border-gray-100 shadow-sm p-3"
                :class="{ 'ring-2 ring-red-400': formSubmitted && !finishDate }"
              />
            </template>

            <!-- Quantity only in editing -->
            <template #quantity>
              <input-with-labels
                id="quantity"
                v-model.number="quantity"
                label="Քանակ"
                type="number"
                min="1"
                class="rounded-xl bg-white border border-gray-100 shadow-sm p-3"
                :class="{
                  'ring-2 ring-red-400':
                    formSubmitted && (!quantity || quantity <= 0),
                }"
              />
            </template>

            <!-- Description -->
            <template #description>
              <textarea-with-label
                id="description"
                v-model="description"
                label="Նկարագրություն"
                type="text"
                class="rounded-xl bg-white border border-gray-100 shadow-sm p-3"
                :class="{
                  'ring-2 ring-red-400': formSubmitted && !description,
                }"
              />
            </template>
          </create-order-form>
        </section>
      </div>

      <!-- Files step -->
      <transition v-else name="slide-up">
        <div id="files-step">
          <show-files
            :pmps="getPmp"
            :factories="getFactory"
            :auto-open-factory-id="autoOpenFactoryId"
            :selected-files.sync="selectedFiles"
            :file-quantities.sync="fileQuantities"
            :is-editing-mode="isEditingMode"
            @files-selected="handleFilesSelected"
            @back="backToDetails"
          />
        </div>
      </transition>
    </div>

    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import CreateOrderForm from '~/components/modals/create/CreateOrderForm.vue'
import ShowFiles from '~/components/File/ShowFactoryFiles/ShowFiles.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  components: {
    InputWithLabels,
    SelectWithLabel,
    CreateOrderForm,
    ShowFiles,
    TextareaWithLabel,
  },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
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
      // eslint-disable-next-line vue/no-reserved-keys
      _debounceTimer: null,
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('clients', ['allClients']),
    ...mapGetters('pmp', ['getPmpes', 'getPmp']),
    clients() {
      return this.allClients
    },
    filteredPmpGroups() {
      if (!this.pmpGroupSearch) return this.getPmpes?.pmp || []
      const q = this.pmpGroupSearch.toLowerCase()
      return (this.getPmpes?.pmp || []).filter(
        (p) =>
          p.group.toLowerCase().includes(q) ||
          p.group_name.toLowerCase().includes(q)
      )
    },
    filteredPmpNames() {
      if (!this.selectedPmp) return []
      const arr = this.selectedPmp.remote_number || []
      if (!this.pmpNameSearch) return arr
      const q = this.pmpNameSearch.toLowerCase()
      return arr.filter((rn) =>
        (rn.remote_number || '').toLowerCase().includes(q)
      )
    },
    isEditingMode() {
      return this.$route.path.includes('/editing')
    },
  },
  watch: {
    selectedPmp(n) {
      if (!n) {
        this.selectedPmpRemoteNumber = null
        this.pmpNameSearch = ''
      }
    },
  },
  mounted() {
    this.fetchClients()
    this.fetchFactory()
    this.fetchPmps()

    const step = this.$route.query.step
    if (step === 'files') {
      this.isFiles = true
      this.$nextTick(() => {
        const el = document.getElementById('files-step')
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
    document.addEventListener('click', this.onClickOutside, true)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onClickOutside, true)
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

    goBackToList() {
      this.$router.push('/engineer')
    },

    backToDetails() {
      this.$router.replace({ query: { ...this.$route.query, step: 'details' } })
      this.isFiles = false
      this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    },

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

    onGroupSearch() {
      clearTimeout(this._debounceTimer)
      this._debounceTimer = setTimeout(
        () => (this.isSelectPmpGroup = true),
        120
      )
    },
    onNameSearch() {
      clearTimeout(this._debounceTimer)
      this._debounceTimer = setTimeout(() => (this.isSelectPmpName = true), 120)
    },

    focusNext(menu) {
      const ref = menu === 'group' ? 'groupMenu' : 'nameMenu'
      const el = this.$refs[ref]
      if (!el) return
      const first = el.querySelector('li')
      first?.focus?.()
    },
    onClickOutside(e) {
      const g = this.$refs.groupMenu
      const n = this.$refs.nameMenu
      if (g && !g.contains(e.target) && e.target?.id !== 'pmpGroup')
        this.isSelectPmpGroup = false
      if (n && !n.contains(e.target) && e.target?.id !== 'pmpRemoteNumberName')
        this.isSelectPmpName = false
    },

    openFiles(arg) {
      this.formSubmitted = true
      this.files_existing = arg === true
      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.finishDate ||
        !this.description ||
        (this.isEditingMode && (!this.quantity || this.quantity <= 0))
      ) {
        this.$notify({
          text: 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը։',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }
      const factoryWithFiles = this.getFactory.find(
        (f) => f.files && f.files.length > 0
      )
      this.autoOpenFactoryId = factoryWithFiles ? factoryWithFiles.id : null

      this.$router.replace({ query: { ...this.$route.query, step: 'files' } })
      this.isFiles = true
      this.$nextTick(() =>
        document
          .getElementById('files-step')
          ?.scrollIntoView({ behavior: 'smooth' })
      )
    },

    handleFilesSelected(files) {
      this.selectedFiles = files.map((f) => f.id)
      // eslint-disable-next-line no-return-assign,no-sequences
      this.fileQuantities = files.reduce(
        // eslint-disable-next-line no-sequences
        (acc, f) => ((acc[f.id] = f.quantity), acc),
        {}
      )
      this.isFiles = false
      this.pmpFiles()
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

      const data = {
        user_id: this.selectedClient.id,
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
        this.selectedFiles = []
        this.fileQuantities = {}
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
    },
  },
}
</script>

<style scoped>
/* transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-enter,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
