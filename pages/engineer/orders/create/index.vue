<template>
  <div class="container flex flex-col">
    <h1 class="text-3xl font-montserrat leading-6 my-6 text-start mx-4">
      {{
        isEditingMode ? 'Ստեղծել նոր պատվեր խմբագրելով' : 'Ստեղծել նոր պատվեր'
      }}
    </h1>

    <div
      v-if="!isFiles"
      class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12"
    >
      <div class="w-full h-full ml-auto mr-4 p-6 bg-white rounded-xl shadow-lg">
        <select-with-label
          v-model="selectedClient"
          :data-value="users"
          label="Ընտրել հաճախորդ"
          :class="{ 'border-red-600': formSubmitted && !selectedClient }"
        ></select-with-label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <input-with-labels
            id="name"
            :value="selectedClient?.name"
            label="Անուն"
            type="text"
            :disabled="true"
            class="shadow-md rounded-lg p-5"
          ></input-with-labels>
          <input-with-labels
            id="phone"
            :value="selectedClient?.client?.phone"
            label="Հեռախոսահամար"
            type="text"
            :disabled="true"
            class="shadow-md rounded-lg p-5"
          ></input-with-labels>
          <input-with-labels
            id="email"
            :value="selectedClient?.email"
            label="Էլ․ փոստ"
            type="text"
            :disabled="true"
            class="shadow-md rounded-lg p-5"
          ></input-with-labels>
          <input-with-labels
            id="address"
            :value="selectedClient?.client?.address"
            label="Հասցե"
            type="text"
            class="shadow-md rounded-lg p-5"
            :disabled="true"
          ></input-with-labels>
        </div>
      </div>
      <div class="w-full">
        <create-order-form
          :is-editing-mode="isEditingMode"
          :open-files-button="'Ընտրել ֆայլերը'"
          :success-button="'Հաստատել'"
          :cancel-button="'Չեղարկել'"
          :edit-button="'Խմբագրել'"
          @openFiles="openFiles(true)"
          @addButton="pmpFiles"
          @cancelButton="cancelBack"
        >
          <template #pmpGroup>
            <div class="relative shadow-md rounded-lg p-3 pt-5">
              <label
                for="pmpGroup"
                class="block text-sm font-medium text-gray-600 mb-1"
              >
                Ծածկագիր
              </label>
              <div class="relative">
                <input
                  id="pmpGroup"
                  v-model="pmpGroupSearch"
                  type="text"
                  class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Փնտրել ծածկագիր"
                  @focus="isSelectPmpGroup = true"
                  @input="filterPmpGroups"
                />
                <button
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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
                class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
              >
                <ul class="py-1">
                  <li
                    v-for="pmp in filteredPmpGroups"
                    :key="pmp.id"
                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                    :class="{ 'border-red-600': formSubmitted && !selectedPmp }"
                    @click="selectPmpGroup(pmp)"
                  >
                    {{ pmp.group }} : {{ pmp.group_name }}
                  </li>
                </ul>
              </div>
            </div>
          </template>

          <template #pmpName>
            <div class="relative shadow-md rounded-lg p-3 pt-5">
              <label
                for="pmpRemoteNumberName"
                class="block text-sm font-medium text-gray-600 mb-1"
              >
                Ընտրել Անունը
              </label>
              <div class="relative">
                <input
                  id="pmpRemoteNumberName"
                  v-model="pmpNameSearch"
                  type="text"
                  class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Փնտրել անուն"
                  :disabled="!selectedPmp"
                  @focus="isSelectPmpName = !!selectedPmp"
                  @input="filterPmpNames"
                />
                <button
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  :disabled="!selectedPmp"
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
                class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
              >
                <ul class="py-1">
                  <li
                    v-for="(remoteNumber, index) in filteredPmpNames"
                    :key="index"
                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                    :class="{
                      'border-red-600':
                        formSubmitted && !selectedPmpRemoteNumber,
                    }"
                    @click="selectPmpRemoteNumber(remoteNumber)"
                  >
                    {{ remoteNumber.remote_number }}
                    {{ remoteNumber.remote_number_name }}
                  </li>
                </ul>
              </div>
            </div>
          </template>

          <template #finishDate>
            <input-with-labels
              id="finishDate"
              v-model="finishDate"
              label="Անհաժեշտ ավարտի ամսաթիվ"
              type="datetime-local"
              class="shadow-md rounded-lg p-3 pt-5"
              :class="{ 'border-red-600': formSubmitted && !finishDate }"
            ></input-with-labels>
          </template>

          <template #description>
            <textarea-with-label
              id="description"
              v-model="description"
              label="Նկարագրություն"
              type="text"
              class="shadow-md rounded-lg p-3 pt-5"
              :class="{ 'border-red-600': formSubmitted && !description }"
            ></textarea-with-label>
          </template>
        </create-order-form>
      </div>
    </div>
    <div v-else>
      <show-files
        :pmps="getPmp"
        :factories="getFactory"
        :auto-open-factory-id="autoOpenFactoryId"
        :selected-files.sync="selectedFiles"
        :file-quantities.sync="fileQuantities"
        @files-selected="handleFilesSelected"
        @back="isFiles = false"
      />
    </div>
    <notifications />
  </div>
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
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
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
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory']),
    ...mapGetters('users', ['getUsers']),
    ...mapGetters('pmp', ['getPmpes', 'getPmp']),
    users() {
      return this.getUsers
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
      }
    },
  },
  mounted() {
    this.fetchUsers()
    this.fetchFactory()
    this.fetchPmps()
  },
  methods: {
    ...mapActions('factory', ['fetchFactory']),
    ...mapActions('users', ['fetchUsers']),
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

    openFiles(arg) {
      this.formSubmitted = true
      this.files_existing = arg

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
      const factoryWithFiles = this.getFactory.find(
        (factory) => factory.files && factory.files.length > 0
      )
      this.autoOpenFactoryId = factoryWithFiles ? factoryWithFiles.id : null
      this.isFiles = true
    },

    handleFilesSelected(files) {
      this.selectedFiles = files.map((file) => file.id)
      this.fileQuantities = files.reduce((acc, file) => {
        acc[file.id] = file.quantity
        return acc
      }, {})
      this.isFiles = false
      this.pmpFiles()
    },

    async pmpFiles() {
      if (this.isLoading) return
      this.isLoading = true
      this.formSubmitted = true

      // Validate required fields
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

      // Validate that all selected files have valid quantities
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

      // Prepare data with selected files and their quantities
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
        this.$router.push('/engineer/orders')
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
    },
  },
}
</script>

<style scoped>
.container {
  padding: 1rem;
}
</style>
