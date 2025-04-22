<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <!-- Factory selection -->
    <div v-if="!selectedFactory" class="space-y-4">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Ընտրեք արտադրամաս</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="factory in factoriesWithCount"
          :key="factory.id"
          class="p-4 border rounded-lg cursor-pointer transition-colors flex items-center justify-between"
          :class="{
            'hover:border-blue-300': factory.fileCount > 0,
            'border-green-200 bg-green-50 hover:bg-green-100':
              factory.fileCount > 0,
            'border-gray-100 bg-gray-50 hover:bg-gray-100':
              factory.fileCount === 0,
            'opacity-60': factory.fileCount === 0,
          }"
          @click="factory.fileCount > 0 && selectFactory(factory)"
        >
          <div class="flex items-center">
            <div
              :class="{
                'bg-green-100 text-green-600': factory.fileCount > 0,
                'bg-gray-100 text-gray-400': factory.fileCount === 0,
              }"
              class="p-2 rounded-full mr-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-lg">{{ factory.name }}</h3>
              <p class="text-gray-600 text-sm">{{ factory.value }}</p>
            </div>
          </div>
          <span
            :class="{
              'bg-green-100 text-green-800': factory.fileCount > 0,
              'bg-gray-100 text-gray-400': factory.fileCount === 0,
            }"
            class="px-2 py-1 rounded-full text-sm font-medium"
          >
            {{ factory.fileCount }} ֆայլ
          </span>
        </div>
      </div>
    </div>

    <!-- Files view -->
    <div v-else>
      <!-- Back button -->
      <button
        class="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        @click="selectedFactory = null"
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
        Վերադառնալ արտադրամասերի ցանկին
      </button>

      <!-- PMP files -->
      <div v-if="pmps.exists" class="space-y-6">
        <div class="p-4 bg-gray-50 rounded-md">
          <h2 class="text-2xl font-bold text-gray-800">
            Խումբ: {{ pmps.pmp.group }} - {{ pmps.pmp.group_name }}
          </h2>
          <div class="mt-2 flex items-center justify-between">
            <div class="flex items-center">
              <div
                class="bg-green-100 px-3 py-1 rounded-full text-green-800 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span class="text-sm font-medium">{{
                  selectedFactory.name
                }}</span>
              </div>
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800"
              @click="toggleSelectAll"
            >
              {{ allSelected ? 'Չեղարկել բոլորը' : 'Ընտրել բոլորը' }}
            </button>
          </div>
        </div>

        <!-- Remote numbers section -->
        <div
          v-for="remote in pmps.pmp.remote_number"
          :key="remote.id"
          class="pl-4 border-l-4 border-blue-200"
        >
          <h3 class="text-xl font-semibold text-gray-700">
            Հեռակա համար: {{ remote.remote_number }} -
            {{ remote.remote_number_name }}
          </h3>

          <!-- Filtered files list -->
          <div class="mt-4 space-y-3">
            <div
              v-for="file in getFactoryFiles(remote.id)"
              :key="file.id"
              class="p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              :class="{
                'bg-blue-50 border border-blue-200': selectedFiles.includes(
                  file.id
                ),
              }"
            >
              <div class="flex items-start">
                <input
                  :id="'file_' + file.id"
                  type="checkbox"
                  :checked="selectedFiles.includes(file.id)"
                  class="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  @change="toggleFileSelection(file.id)"
                />
                <div class="ml-3 flex-1">
                  <label :for="'file_' + file.id" class="cursor-pointer">
                    <p class="font-medium text-blue-600 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {{ file.original_name }}
                    </p>
                    <p class="text-sm text-gray-600 ml-7 mt-1">
                      {{ file.path }}
                    </p>
                  </label>
                </div>
                <div class="text-right">
                  <span v-if="file.quantity" class="block text-green-700"
                    >Քանակ: {{ file.quantity }}</span
                  >
                  <span v-if="file.material_type" class="block text-purple-700"
                    >Նյութ: {{ file.material_type }}</span
                  >
                  <span v-if="file.thickness" class="block text-orange-700"
                    >Հաստություն: {{ file.thickness }}</span
                  >
                </div>
              </div>
            </div>
            <!--            ասդադաս-->
            <div
              v-if="getFactoryFiles(remote.id).length === 0"
              class="p-3 text-center text-gray-500"
            >
              Ֆայլեր չեն գտնվել այս հեռակա համարի համար
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-4 text-center text-gray-500">
        Տվյալներ չեն գտնվել
      </div>

      <!-- Submit button when files are selected -->
      <div v-if="selectedFiles.length > 0" class="mt-6 sticky bottom-4">
        <button
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
          @click="submitSelectedFiles"
        >
          Հաստատել ընտրությունը ({{ selectedFiles.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShowFiles',
  props: {
    pmps: {
      type: Object,
      default: () => ({ exists: false }),
    },
    factories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedFactory: null,
      selectedFiles: [],
    }
  },
  computed: {
    factoriesWithCount() {
      return this.factories.map((factory) => {
        const fileCount = this.pmps.exists
          ? this.pmps.pmp.files.filter((file) =>
              file.path.includes(`/${factory.value}/`)
            ).length
          : 0
        return { ...factory, fileCount }
      })
    },
    allSelected() {
      if (!this.pmps.exists || !this.selectedFactory) return false
      const allFiles = this.pmps.pmp.remote_number.flatMap((remote) =>
        this.getFactoryFiles(remote.id)
      )
      return (
        allFiles.length > 0 && this.selectedFiles.length === allFiles.length
      )
    },
  },
  methods: {
    selectFactory(factory) {
      this.selectedFactory = factory
      this.selectedFiles = [] // Reset selection when changing factory
    },
    getFactoryFiles(remoteNumberId) {
      if (!this.pmps.exists) return []
      return this.pmps.pmp.files.filter((file) => {
        const pathMatch = file.path.includes(`/${this.selectedFactory.value}/`)
        return file.remote_number_id === remoteNumberId && pathMatch
      })
    },
    toggleFileSelection(fileId) {
      if (this.selectedFiles.includes(fileId)) {
        this.selectedFiles = this.selectedFiles.filter((id) => id !== fileId)
      } else {
        this.selectedFiles.push(fileId)
      }
    },
    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedFiles = []
      } else {
        const allFiles = this.pmps.pmp.remote_number.flatMap((remote) =>
          this.getFactoryFiles(remote.id).map((file) => file.id)
        )
        this.selectedFiles = [...new Set(allFiles)] // Remove duplicates
      }
    },
    submitSelectedFiles() {
      // Ստեղծել ֆայլերի խմբավորում ըստ գործարանի
      const filesByFactory = {}

      this.pmps.pmp.files.forEach((file) => {
        if (this.selectedFiles.includes(file.id)) {
          if (!filesByFactory[file.factory_id]) {
            filesByFactory[file.factory_id] = []
          }
          filesByFactory[file.factory_id].push(file.id)
        }
      })

      // Ուղարկել բեքենդ ըստ գործարանի
      Object.keys(filesByFactory).forEach((factoryId) => {
        const data = {
          user_id: this.$parent.selectedClient.id,
          creator_id: this.$auth.user.id,
          name: `${this.$parent.selectedPmp.group}.${this.$parent.selectedPmpRemoteNumber}`,
          description: this.$parent.order.description,
          status: 'pending',
          finish_date: this.$parent.finishDate,
          remote_number_id: this.$parent.remote_number_id,
          pmp_id: this.$parent.selectedPmp.id,
          link_existing_files: true,
          factory_id: factoryId, // Ավելացնել factory_id
          selected_files: filesByFactory[factoryId], // Ուղարկել միայն այս գործարանի ֆայլերը
        }

        this.$emit('factory-files-selected', data)
      })

      // Փակել ֆայլերի ընտրության պատուհանը
      this.$emit('back')
    },

    goBack() {
      this.$emit('back')
    },
  },
}
</script>

<style scoped>
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.sticky {
  position: sticky;
  z-index: 10;
}
</style>
