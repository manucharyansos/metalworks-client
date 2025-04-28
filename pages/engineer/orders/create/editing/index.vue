<template>
  <div class="container flex flex-col">
    <h1 class="text-3xl font-sans italic leading-6 my-6 text-start mx-4">
      Ստեղծել նոր պատվեր խմբագրելով
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
        <create-by-editing
          open-files-button="Ընտրել ֆայլերը"
          success-button="Հաստատել"
          cancel-button="Չեղարկել"
          @cancelButton="cancelBack"
          @openFiles="openFiles"
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

              <!-- Dropdown menu -->
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

              <!-- Dropdown menu -->
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
              :class="{
                'border-red-600': formSubmitted && !finishDate,
              }"
            ></input-with-labels>
          </template>

          <template #quantity>
            <input-with-labels
              id="quantity"
              v-model.number="quantity"
              label="Քանակ"
              min="1"
              type="number"
              class="shadow-md rounded-lg p-3 pt-5"
              :class="{
                'border-red-600': formSubmitted && !quantity,
              }"
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
        </create-by-editing>
      </div>
    </div>
    <div v-else>
      <ShowFiles
        :pmps="getPmp"
        :factories="getFactory"
        @files-selected="handleFilesSelected"
        @factory-files-selected="handleFactoryFilesSelected"
        @back="isFiles = false"
      />
    </div>
    <!--      notifications-->
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import CreateByEditing from '~/components/modals/create/CreateByEditing.vue'
import ShowFiles from '~/components/File/ShowFactoryFiles/ShowFiles.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  components: {
    TextareaWithLabel,
    InputWithLabels,
    CreateByEditing,
    SelectWithLabel,
    ShowFiles,
  },
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      isSelectedClient: false,
      isSelectPmpGroup: false,
      isSelectPmpName: false,
      factories: {
        ids: [],
        files: {},
      },
      selectedClient: null,
      pmpGroupSearch: '',
      pmpNameSearch: '',
      selectedPmp: null,
      selectedPmpRemoteNumber: null,
      quantity: 0,
      description: '',
      finishDate: '',
      formSubmitted: false,
      isSelectedLaser: false,
      isSelectedBend: false,
      fileNames: [],
      dxfUrl: '',
      files: [],
      selectedFactoryId: null,
      selectedFileIndex: null,
      remote_number_id: null,
      pmpGroupInput: null,
      isFiles: false,
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
      'checkIfGroupExists',
      'fetchPmps',
      'checkPmpByRemoteNumber',
      'checkIfGroupExists',
    ]),

    handleFactoryFilesSelected(data) {
      this.createNewOrder(data)
        .then(() => {
          this.$notify({
            text: `Պատվերի մասը հաջողությամբ ստեղծվեց ${data.selected_files.length} ֆայլով։`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'success',
          })
        })
        .catch((error) => {
          this.$notify({
            text: `Սխալ՝ ${error.response?.data?.error || error.message}`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'error',
          })
        })
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

    openFiles() {
      this.formSubmitted = true
      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.finishDate ||
        this.quantity === null ||
        this.quantity <= 0 ||
        !this.description
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
      this.isFiles = true
    },

    filterPmpGroups() {
      this.isSelectPmpGroup = true
    },

    filterPmpNames() {
      this.isSelectPmpName = true
    },

    handleFilesSelected(files) {
      this.selectedFiles = files.map((file) => file.id)
      this.isFiles = false
      this.pmpFiles() 
    },

    async pmpFiles() {
      this.formSubmitted = true

      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.finishDate ||
        this.quantity === null ||
        this.quantity <= 0 ||
        !this.description ||
        this.description.trim() === '' ||
        !this.selectedFiles ||
        this.selectedFiles.length === 0
      ) {
        this.$notify({
          text: `Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը և ընտրել ֆայլեր։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
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
        link_existing_files: true,
        selected_files: this.selectedFiles,
      }

      try {
        await this.createNewOrder(data)

        this.$notify({
          text: `Պատվերը հաջողությամբ ստեղծվեց ${this.selectedFiles.length} ֆայլով։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })

        this.resetForm()
        this.selectedFiles = []
        this.$router.push('/engineer/orders')
      } catch (error) {
        this.$notify({
          text: `Սխալ՝ ${error.response?.data?.error || error.message}`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
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
      this.finishDate = null
      this.quantity = null
      this.formSubmitted = false
    },
  },
}
</script>
