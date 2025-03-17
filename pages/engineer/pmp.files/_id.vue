<template>
  <main class="p-4 flex flex-col items-start gap-1">
    <!-- Breadcrumb -->
    <nav
      v-if="breadcrumb.length > 0"
      class="flex py-3 px-1.5 border border-gray-300 shadow-md shadow-gray-600 w-full"
      aria-label="Breadcrumb"
    >
      <ol
        class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse"
      >
        <li
          v-for="(item, index) in breadcrumb"
          :key="index"
          class="inline-flex items-center cursor-pointer"
        >
          <div
            class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            @click="selectBreadcrumb(index)"
          >
            <template v-if="index === 0">
              <svg
                class="w-3 h-3 me-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
                />
              </svg>
            </template>
            <template v-else>
              <svg
                class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </template>
            {{ item }}
          </div>
        </li>
      </ol>
    </nav>

    <div class="flex flex-row items-start gap-4">
      <div
        class="flex items-start gap-4 border-r border-r-gray-300 pr-4 h-screen pt-6"
      >
        <div v-if="isOpen === 'remote_number'" class="flex flex-col gap-2">
          <div
            v-for="number in getPmp.remote_number"
            :key="number.id"
            class="grid grid-cols-3 items-center border border-gray-300 rounded-lg w-64 cursor-pointer p-2"
            @click="showFiles(number)"
          >
            <img class="size-16" src="/dxf.png" alt="DXF" />
            <div class="flex flex-col col-span-2 px-2">
              <span>{{ number.remote_number }}</span>
              <span>{{ number.remote_number_name }}</span>
            </div>
          </div>
        </div>

        <div v-if="isOpen === 'factories'" class="flex flex-col gap-2">
          <div v-for="factory in getFactory" :key="factory.id">
            <button
              class="border border-gray-300 rounded-lg w-64 p-2"
              :class="{
                'bg-gray-900 text-white': selectedFactoryId === factory.id,
                'bg-gray-600 text-white': hasFiles(factory.id),
              }"
              @click="selectFactory(factory)"
            >
              {{ factory?.value }}
            </button>
          </div>
        </div>

        <div v-if="isOpen === 'files_by_id'" class="flex flex-col gap-2">
          <div
            v-for="file in selectedFiles"
            :key="file.id"
            class="flex justify-between border border-gray-300 rounded-lg w-64 p-2 cursor-pointer truncate hover:!truncate"
            @click="viewFile(file.path, file)"
          >
            {{ file.original_name }}
          </div>
        </div>
      </div>
      <div
        v-if="dxfUrl && isOpen === 'files_by_id'"
        class="flex items-center justify-center"
      >
        <DxfViewer
          v-if="dxfUrl"
          :key="dxfUrl"
          :dxf-url="dxfUrl"
          width="500px"
          style="width: 800px"
        />
      </div>
    </div>
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewer from '~/components/File/DxfViewer.vue'

export default {
  components: { DxfViewer },
  layout: 'EngineerLayout',
  middleware: ['engineer', 'roleRedirect'],
  data() {
    return {
      isOpen: 'remote_number',
      id: '',
      dxfUrl: '',
      selectedFactoryId: null,
      selectedRemoteNumber: null,
      selectedFiles: [],
      breadcrumb: [],
      test: null,
    }
  },
  computed: {
    ...mapGetters('pmp', ['getPmp']),
    ...mapGetters('factory', ['getFactory']),
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        this.id = newId
        this.fetchPmp(this.id)
        this.fetchFactory()
      },
    },
  },
  methods: {
    ...mapActions('pmp', ['fetchPmp']),
    ...mapActions('factory', ['fetchFactory']),

    showFiles(number) {
      this.isOpen = 'factories'
      this.test = number
      this.selectedRemoteNumber = number.id
      this.selectedFiles = this.getPmp.files.filter(
        (f) => f.remote_number_id === number.id
      )
      this.updateBreadcrumb(number.remote_number_name)
    },

    selectFactory(factory) {
      this.isOpen = 'files_by_id'
      this.selectedFactoryId = factory.id
      this.selectedFiles = this.getPmp.files.filter(
        (file) => file.factory_id === factory.id
      )
      this.updateBreadcrumb(factory.name)
    },

    viewFile(filePath, file) {
      if (!this.breadcrumb.includes(file.original_name)) {
        if (this.breadcrumb.length > 2) {
          this.breadcrumb.pop()
        }
        this.breadcrumb.push(file.original_name)
      }
      this.dxfUrl = filePath
    },

    selectBreadcrumb(index) {
      this.breadcrumb = this.breadcrumb.slice(0, index + 1)
      if (index === 0) {
        this.isOpen = 'remote_number'
        this.selectedFactoryId = null
        this.selectedRemoteNumber = null
        this.dxfUrl = null
        this.selectedFiles = []
      } else if (index === 1) {
        this.isOpen = 'factories'
        this.selectedRemoteNumber = null
        this.dxfUrl = null
        this.selectedFiles = this.getPmp.files.filter(
          (f) => f.remote_number_id === this.selectedRemoteNumber
        )
      } else if (index === 2) {
        this.isOpen = 'files_by_id'
        this.selectedFiles = this.getPmp.files.filter(
          (f) => f.factory_id === this.selectedFactoryId
        )
      }
    },

    hasFiles(factoryId) {
      return this.selectedFiles.some((f) => f.factory_id === factoryId)
    },

    updateBreadcrumb(item) {
      if (!this.breadcrumb.includes(item)) {
        this.breadcrumb.push(item)
      }
    },
  },
}
</script>
