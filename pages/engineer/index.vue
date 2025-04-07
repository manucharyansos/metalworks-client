<template>
  <main class="min-h-screen bg-gray-50 p-6">
    <div
      class="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden h-screen"
    >
      <!-- Header Section -->
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-3xl font-bold text-gray-800 font-serif italic">
          Նախագծեր
        </h1>
      </div>

      <!-- Main Content Section -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- PMP Group Section -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-700">Խումբ</h2>

          <div class="relative">
            <label
              for="pmpGroup"
              class="block text-sm font-medium text-gray-600 mb-1"
            >
              Ծածկագիր
            </label>
            <div class="relative">
              <input
                id="pmpGroup"
                v-model="pmpGroup"
                type="text"
                class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Նշեք ծածկագիր"
                @focus="openPmpGroup"
              />
              <button
                @click="openPmpGroup"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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
                  v-for="pmp in filteredPmps"
                  :key="pmp.id"
                  class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                  @click="selectPmpGroup(pmp)"
                >
                  {{ pmp.group }}
                </li>
              </ul>
            </div>
          </div>

          <div class="relative">
            <label class="block text-sm font-medium text-gray-600 mb-1">
              Անվանում
            </label>
            <div class="relative">
              <input
                v-model="pmpGroupName"
                type="text"
                class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Նշեք անվանում"
                @focus="openPmpGroupName"
              />
              <button
                @click="openPmpGroupName"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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
              v-if="isSelectPmpGroupName"
              class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
            >
              <ul class="py-1">
                <li
                  v-for="pmp in filteredPmpNames"
                  :key="pmp.id"
                  class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                  @click="selectPmpGroupName(pmp)"
                >
                  {{ pmp.group_name }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Remote Number Section -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-700">Ենթախումբ</h2>

          <div class="relative">
            <label class="block text-sm font-medium text-gray-600 mb-1"
              >Ծածկագիր
            </label>
            <div class="relative">
              <input
                v-model="pmpRemoteNumber"
                type="text"
                class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-500"
                :disabled="isExistPmpRemoteNumber"
                @focus="openRemoteNumber"
              />
              <button
                @click="openRemoteNumber"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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
              v-if="isPmpRemoteNumber"
              class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
            >
              <ul class="py-1">
                <li
                  v-for="pmp in pmpRemoteNumbers"
                  :key="pmp.id"
                  class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                  @click="selectPmpRemoteNumber(pmp)"
                >
                  {{ pmp.remote_number }}
                </li>
              </ul>
            </div>
          </div>

          <div class="relative">
            <label class="block text-sm font-medium text-gray-600 mb-1">
              Նկարագրություն
            </label>
            <div class="relative">
              <input
                v-model="pmpRemoteNumberName"
                type="text"
                class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:text-gray-500"
                :disabled="isExistPmpRemoteNumber"
                @focus="openRemoteNumberName"
              />
              <button
                @click="openRemoteNumberName"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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
              v-if="isPmpRemoteNumberName"
              class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
            >
              <ul class="py-1">
                <li
                  v-for="pmp in pmpRemoteNumbers"
                  :key="pmp.id"
                  class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                  @click="selectPmpRemoteNumberName(pmp)"
                >
                  {{ pmp.remote_number_name }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col justify-end gap-4">
          <button
            v-if="isCreatePmp"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition transform hover:scale-105"
            @click="addPmpGroup"
          >
            Ստեղծել
          </button>
          <button
            v-if="isCreatePmpRemoteNumber"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition transform hover:scale-105"
            @click="addPmpGroupRemoteNumber"
          >
            Ստեղծել հերթական համար
          </button>
          <button
            v-if="isEditPmp"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition transform hover:scale-105"
            @click="editPmp"
          >
            Դիտել
          </button>
        </div>
      </div>
    </div>
    <notifications />
  </main>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EngineerPage',
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      pmpGroup: '',
      pmpGroupName: '',
      pmpRemoteNumber: '',
      pmpRemoteNumberName: '',
      isSelectPmpGroup: false,
      isSelectPmpGroupName: false,
      isPmpRemoteNumber: false,
      isPmpRemoteNumberName: false,
      isCreatePmp: false,
      isCreatePmpRemoteNumber: false,
      isEditPmp: false,
      pmpRemoteNumbers: [],
      remote_number_id: '',
      isExistPmpRemoteNumber: true,
      pmpId: null,
      remoteNumberId: null,
    }
  },
  computed: {
    ...mapGetters('pmp', ['getPmpes']),
    filteredPmps() {
      if (!this.pmpGroup) return this.getPmpes?.pmp || []
      return this.getPmpes?.pmp.filter((pmp) =>
        pmp.group.startsWith(this.pmpGroup)
      )
    },
    filteredPmpNames() {
      if (!this.pmpGroupName) return this.getPmpes?.pmp || []
      return this.getPmpes?.pmp.filter((pmp) =>
        pmp.group_name.toLowerCase().startsWith(this.pmpGroupName.toLowerCase())
      )
    },
  },
  watch: {
    pmpGroup(val) {
      if (val && val.length >= 3) {
        if (this.getPmpes?.pmp && Array.isArray(this.getPmpes.pmp)) {
          const isGroupExists = this.getPmpes.pmp.some(
            (pmp) => String(pmp.group) === String(val)
          )
          if (isGroupExists) {
            this.isExistPmpRemoteNumber = false
          } else {
            this.isExistPmpRemoteNumber = false
            this.isCreatePmp = true
          }
        }
      } else if (!val) {
        this.isSelectPmpGroup = false
        this.pmpGroupName = ''
        this.isCreatePmp = false
      }
    },
    pmpRemoteNumber(val) {
      if (!val) {
        this.isEditPmp = false
        this.isCreatePmpRemoteNumber = false
        this.pmpRemoteNumber = ''
        this.pmpRemoteNumberName = ''
        this.remote_number_id = ''
        return
      }
      if (val.length >= 2) {
        const currentPmp = this.getPmpes?.pmp?.find(
          (pmp) => String(pmp.group) === String(this.pmpGroup.padStart(3, '0'))
        )
        if (currentPmp?.remote_number?.length > 0) {
          const paddedVal = val.padStart(2, '0')
          const remoteExists = currentPmp.remote_number.some(
            (remote) => String(remote.remote_number) === paddedVal
          )

          if (remoteExists) {
            this.isPmpRemoteNumber = true
            this.isEditPmp = true
            this.isCreatePmpRemoteNumber = false
            const selectedRemote = currentPmp.remote_number.find(
              (remote) => String(remote.remote_number) === paddedVal
            )
            this.remote_number_id = selectedRemote?.id || ''
            this.pmpRemoteNumberName = selectedRemote?.remote_number_name || ''
          } else {
            this.isPmpRemoteNumber = false
            this.isEditPmp = false
            this.isCreatePmpRemoteNumber = true
            this.remote_number_id = ''
            this.pmpRemoteNumberName = ''
          }
        } else {
          this.isEditPmp = false
          this.isCreatePmpRemoteNumber = false
          this.remote_number_id = ''
        }
      }
    },
    pmpGroupName(val) {
      if (val) {
        if (this.getPmpes?.pmp && Array.isArray(this.getPmpes.pmp)) {
          const isGroupExists = this.getPmpes.pmp.some(
            (pmp) => String(pmp.group_name) === String(val)
          )
          if (isGroupExists) {
            this.isExistPmpRemoteNumber = false
          }
        }
      } else if (!val) {
        this.isSelectPmpGroupName = false
        this.pmpGroup = ''
      }
    },
    pmpRemoteNumberName(val) {
      if (val) {
        const currentPmp = this.getPmpes?.pmp?.find(
          (pmp) => String(pmp.group) === String(this.pmpGroup.padStart(3, '0'))
        )

        if (currentPmp?.remote_number?.length > 0) {
          const remoteExists = currentPmp.remote_number.some(
            (remote) => String(remote.remote_number_name) === String(val)
          )

          if (remoteExists) {
            const selectedRemote = currentPmp.remote_number.find(
              (remote) => String(remote.remote_number_name) === String(val)
            )

            if (selectedRemote) {
              this.pmpRemoteNumber = selectedRemote.remote_number
              this.remote_number_id = selectedRemote.id
              this.isEditPmp = true
              this.isCreatePmpRemoteNumber = false
              this.isPmpRemoteNumber = false
            }
          } else {
            this.isEditPmp = false
            this.isCreatePmpRemoteNumber = true
          }
        }
      } else {
        this.isEditPmp = false
        this.isCreatePmpRemoteNumber = false
        this.pmpRemoteNumber = ''
        this.remote_number_id = ''
      }
    },
  },
  created() {
    this.fetchPmps()
  },
  methods: {
    ...mapActions('pmp', [
      'fetchPmps',
      'createPmp',
      'checkPmpByRemoteNumber',
      'rememberNumberPmp',
    ]),

    openPmpGroup() {
      this.isSelectPmpGroup = !this.isSelectPmpGroup
      this.isSelectPmpGroupName = false
      this.isPmpRemoteNumber = false
      this.isPmpRemoteNumberName = false
    },
    openRemoteNumber() {
      this.isPmpRemoteNumber = !this.isPmpRemoteNumber
      this.isSelectPmpGroup = false
      this.isSelectPmpGroupName = false
      this.isPmpRemoteNumberName = false
    },
    openPmpGroupName() {
      this.isSelectPmpGroupName = !this.isSelectPmpGroupName
      this.isSelectPmpGroup = false
      this.isPmpRemoteNumber = false
      this.isPmpRemoteNumberName = false
    },
    openRemoteNumberName() {
      this.isPmpRemoteNumberName = !this.isPmpRemoteNumberName
      this.isSelectPmpGroup = false
      this.isPmpRemoteNumber = false
      this.isSelectPmpGroupName = false
    },
    selectPmpGroup(pmp) {
      this.isSelectPmpGroupName = false
      this.pmpId = pmp.id
      this.pmpGroup = pmp.group
      this.pmpGroupName = pmp.group_name
      this.pmpRemoteNumbers = pmp.remote_number
      this.pmpRemoteNumber = this.pmpRemoteNumbers[pmp.remote_number]
      this.pmpRemoteNumberName = this.pmpRemoteNumbers[pmp.remote_number_name]
      this.isSelectPmpGroup = false
      this.isSelectPmpGroupName = false
      this.isExistPmpRemoteNumber = false
      const isGroupExists = this.getPmpes.pmp.some(
        (pmp) => pmp.group === this.pmpGroup
      )
      if (!isGroupExists) {
        this.isCreatePmp = true
      }
    },
    selectPmpGroupName(pmp) {
      this.pmpGroup = pmp.group
      this.pmpGroupName = pmp.group_name
      this.pmpRemoteNumbers = pmp.remote_number
      this.pmpRemoteNumber = this.pmpRemoteNumbers[pmp.remote_number]
      this.pmpRemoteNumberName = this.pmpRemoteNumbers[pmp.remote_number_name]
      this.isSelectPmpGroupName = false
      this.isSelectPmpGroup = false
      this.isExistPmpRemoteNumber = false
    },

    selectPmpRemoteNumber(pmp) {
      this.remoteNumberId = pmp.id
      this.pmpRemoteNumberName = pmp.remote_number_name
      this.pmpRemoteNumber = pmp.remote_number
      this.isPmpRemoteNumber = false
      this.remote_number_id = pmp.id
    },

    selectPmpRemoteNumberName(pmp) {
      this.remoteNumberId = pmp.id
      this.pmpRemoteNumberName = pmp.remote_number_name
      this.pmpRemoteNumber = pmp.remote_number
      this.isPmpRemoteNumberName = false
    },

    async addPmpGroup() {
      if (
        !this.pmpGroup ||
        !this.pmpGroupName ||
        !this.pmpRemoteNumber ||
        !this.pmpRemoteNumberName
      ) {
        this.$notify({
          text: `Group or Remote Number is missing:`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }
      const pmp = {
        group: this.pmpGroup.padStart(3, '0'),
        group_name: this.pmpGroupName,
        remote_number: this.pmpRemoteNumber.padStart(2, '0'),
        remote_number_name: this.pmpRemoteNumberName,
        admin_confirmation: true,
      }
      const response = await this.createPmp(pmp)
      if (response) {
        await this.resetPmpData()
        await this.fetchPmps()
        // await this.$router.push(`engineer/pmp.files/${this.remoteNumberId}`)
      }
    },
    resetPmpData() {
      this.pmpGroup = ''
      this.pmpGroupName = ''
      this.pmpRemoteNumber = null
      this.pmpRemoteNumberName = null
    },
    editPmp() {
      this.$router.push(`engineer/pmp.files/${this.remoteNumberId}`)
    },
    async addPmpGroupRemoteNumber() {
      if (
        !this.pmpGroup ||
        !this.pmpGroupName ||
        !this.pmpRemoteNumberName ||
        !this.pmpRemoteNumberName
      ) {
        return
      }

      const data = {
        id: this.pmpId,
        group: this.pmpGroup,
        group_name: this.pmpGroupName,
        remote_number: this.pmpRemoteNumber,
        remote_number_name: this.pmpRemoteNumberName,
      }

      const res = await this.rememberNumberPmp(data)
      await this.resetPmpData()
      if (res) {
        this.isExistPmpRemoteNumber = true
        this.isCreatePmp = false
        this.isEditPmp = false
        this.isCreatePmpRemoteNumber = false
        await this.$router.push(`engineer/pmp.files/${this.remoteNumberId}`)
      }
    },
  },
}
</script>
<style scoped>
input:focus {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
  background: inherit !important;
  color: inherit !important;
}
</style>
