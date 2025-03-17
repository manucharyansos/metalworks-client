<template>
  <main class="flex flex-row flex-wrap p-4 h-screen">
    <div
      class="flex flex-col justify-between border w-full border-gray-200 rounded-md shadow-sm sm:rounded-md"
    >
      <div
        class="pmp_section w-full grid grid-cols-4 gap-4 py-4 px-4 border-gray-200 rounded-md shadow-sm sm:rounded-md"
      >
        <div class="flex flex-row items-center gap-4">
          <h1 class="my-auto">PMP</h1>
          <div class="flex flex-col items-center gap-4 col-span-2">
            <div class="relative">
              <div
                class="font-medium border-2 border-gray-200 px-3 rounded-lg text-sm text-center inline-flex items-center"
              >
                <input
                  v-model="pmpGroup"
                  type="text"
                  class="border-none outline-0"
                  placeholder="Ծածկագիր"
                />
                <button @click="openPmpGroup">
                  <svg
                    class="w-2.5 h-2.5 ms-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="black"
                    viewBox="0 0 10 6"
                    width="20"
                    height="20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
              </div>

              <!-- Dropdown menu -->
              <div
                v-if="isSelectPmpGroup"
                class="z-20 absolute top-10 right-0 left-0 bg-white divide-y border-gray-300 rounded-lg shadow-md w-72 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  v-for="pmp in filteredPmps"
                  :key="pmp.id"
                  class="py-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <li
                    class="cursor-pointer px-4 py-1"
                    @click="selectPmpGroup(pmp)"
                  >
                    <div>
                      {{ pmp.group }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="relative w-full">
              <div
                class="font-medium border-2 border-gray-200 px-3 rounded-lg text-sm text-center inline-flex items-center"
              >
                <input
                  v-model="pmpGroupName"
                  type="text"
                  class="border-none outline-0"
                  placeholder="Անվանում"
                />
                <button @click="openPmpGroupName">
                  <svg
                    class="w-2.5 h-2.5 ms-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="black"
                    viewBox="0 0 10 6"
                    width="20"
                    height="20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
              </div>

              <!-- Dropdown menu -->
              <div
                v-if="isSelectPmpGroupName"
                class="z-20 absolute top-10 right-0 left-0 bg-white divide-y border-gray-300 rounded-lg shadow-md w-72 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  v-for="pmp in filteredPmpNames"
                  :key="pmp.id"
                  class="py-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <li
                    class="cursor-pointer px-4 py-1"
                    @click="selectPmpGroupName(pmp)"
                  >
                    <div>
                      {{ pmp.group_name }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-start gap-4 col-span-2 text-start">
          <div class="relative">
            <div
              class="font-medium w-full border-2 border-gray-200 px-3 rounded-lg text-sm text-center inline-flex items-center"
            >
              <input
                v-model="pmpRemoteNumber"
                type="text"
                class="border-none outline-0"
              />
              <button @click="openRemoteNumber">
                <svg
                  class="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="black"
                  viewBox="0 0 10 6"
                  width="20"
                  height="20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
            </div>
            <!-- Dropdown menu -->
            <div
              v-if="isPmpRemoteNumber"
              class="z-20 absolute top-10 right-0 left-0 bg-white divide-y border-gray-300 rounded-lg shadow-md w-72 dark:bg-gray-700 dark:divide-gray-600"
            >
              <ul
                v-for="pmp in pmpRemoteNumbers"
                :key="pmp.id"
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <li
                  class="cursor-pointer px-4 py-1"
                  @click="selectPmpRemoteNumber(pmp)"
                >
                  <div>
                    {{ pmp.remote_number }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="relative w-full">
            <div
              class="font-medium w-full border-2 border-gray-200 px-3 rounded-lg text-sm text-center inline-flex items-center"
            >
              <input
                v-model="pmpRemoteNumberName"
                type="text"
                class="border-none outline-0 w-full"
              />
              <button @click="openRemoteNumberName">
                <svg
                  class="w-2.5 h-2.5 ms-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="black"
                  viewBox="0 0 10 6"
                  width="20"
                  height="20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
            </div>

            <!-- Dropdown menu -->
            <div
              v-if="isPmpRemoteNumberName"
              class="z-20 absolute top-10 right-0 left-0 bg-white divide-y border-gray-300 rounded-lg shadow-md w-72 dark:bg-gray-700 dark:divide-gray-600"
            >
              <ul
                v-for="pmp in pmpRemoteNumbers"
                :key="pmp.id"
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
              >
                <li
                  class="cursor-pointer px-4 py-1"
                  @click="selectPmpRemoteNumberName(pmp)"
                >
                  <div>
                    {{ pmp.remote_number_name }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-between gap-4">
          <button
            v-if="isCreatePmp"
            class="flex items-center justify-center font-sans italic bg-green-600 text-white w-52 px-1.5 py-1.5 rounded-lg"
            @click="addPmpGroup"
          >
            Ստեղծել
          </button>
          <button
            v-if="isEditPmp"
            class="flex items-center justify-center font-sans italic bg-indigo-600 text-white w-52 px-1.5 py-1.5 rounded-lg"
            @click="editPmp"
          >
            Դիտել
          </button>
        </div>
      </div>
      <button
        class="flex items-center justify-center font-sans italic bg-indigo-600 text-white w-52 px-1.5 py-1.5 rounded-lg mt-auto"
        @click="updatePmp"
      >
        Խմբագրել
      </button>
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
      isEditPmp: false,
      pmpRemoteNumbers: [],
      remote_number_id: '',
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
            this.isCreatePmp = false
            this.isEditPmp = true
          } else {
            this.isCreatePmp = true
            this.isEditPmp = false
          }
        }
      } else {
        this.isCreatePmp = false
      }
      if (val) {
        this.isSelectPmpGroup = true
      } else {
        this.isSelectPmpGroup = false
      }
    },
    pmpGroupName(val) {
      if (val) {
        this.isSelectPmpGroupName = true
        if (this.getPmpes?.pmp && Array.isArray(this.getPmpes.pmp)) {
          const isGroupExists = this.getPmpes.pmp.some(
            (pmp) => String(pmp.group_name) === String(val)
          )
          if (isGroupExists) {
            this.isCreatePmp = false
            this.isEditPmp = true
          } else {
            this.isCreatePmp = true
            this.isEditPmp = true
          }
        }
      } else {
        this.isCreatePmp = false
        this.isSelectPmpGroupName = false
      }
    },
  },
  created() {
    this.fetchPmps()
  },
  methods: {
    ...mapActions('pmp', ['fetchPmps', 'createPmp', 'checkPmpByRemoteNumber']),

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
      this.pmpGroup = pmp.group
      this.pmpGroupName = pmp.group_name
      this.pmpRemoteNumbers = pmp.remote_number
      this.pmpRemoteNumber = this.pmpRemoteNumbers[pmp.remote_number]
      this.pmpRemoteNumberName = this.pmpRemoteNumbers[pmp.remote_number_name]
      this.isSelectPmpGroup = false
      this.isSelectPmpGroupName = false
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
    },

    selectPmpRemoteNumber(pmp) {
      this.pmpRemoteNumberName = pmp.remote_number_name
      this.pmpRemoteNumber = pmp.remote_number
      this.isPmpRemoteNumber = false
      this.remote_number_id = pmp.id
    },

    selectPmpRemoteNumberName(pmp) {
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
      }
    },
    resetPmpData() {
      this.pmpGroup = ''
      this.pmpGroupName = ''
      this.pmpRemoteNumber = null
      this.pmpRemoteNumberName = null
    },
    editPmp() {
      this.$router.push(`engineer/pmp.files/${this.remote_number_id}`)
    },
    updatePmp() {
      // if (!this.pmpGroup) {
      //   this.$notify({
      //     text: 'Խմբագրելու համար պետք է ընտրել PMP խումբ։',
      //     duration: 3000,
      //     speed: 1000,
      //     position: 'top',
      //     type: 'error',
      //   })
      //   return
      // }

      // const pmpData = {
      //   id: this.pmpGroup,
      //   group: this.pmpGroup,
      //   group_name: this.pmpGroupName,
      //   remote_number: this.pmpRemoteNumber,
      //   remote_number_name: this.pmpRemoteNumberName,
      // }

      // this.checkPmpByRemoteNumber(pmpData)
      this.$router.push(`test/${this.remote_number_id}`)
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
