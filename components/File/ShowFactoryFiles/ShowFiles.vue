<template>
  <div
    class="p-4 md:p-5 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-white/60"
  >
    <!-- Factory selection -->
    <div v-if="!selectedFactory" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">
          Ընտրեք արտադրամաս
        </h2>
        <!-- Back to details is already above -->
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="factory in factoriesWithCount"
          :key="factory.id"
          class="text-left p-4 border rounded-xl transition-colors flex items-center justify-between shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :class="{
            'hover:border-blue-300 border-green-200 bg-green-50 hover:bg-green-100':
              factory.fileCount > 0,
            'border-gray-100 bg-gray-50 hover:bg-gray-100 opacity-70 cursor-not-allowed':
              factory.fileCount === 0,
          }"
          :disabled="factory.fileCount === 0"
          @click="factory.fileCount > 0 && selectFactory(factory)"
        >
          <div class="flex items-center">
            <div
              :class="{
                'bg-green-100 text-green-600': factory.fileCount > 0,
                'bg-gray-100 text-gray-400': factory.fileCount === 0,
              }"
              class="p-2 rounded-full mr-3"
              aria-hidden="true"
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
        </button>
      </div>
    </div>

    <!-- Files view -->
    <div v-else>
      <!-- PMP header -->
      <div
        v-if="pmps.exists"
        class="p-4 bg-gray-50 rounded-xl border border-gray-100"
      >
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <h2 class="text-xl md:text-2xl font-bold text-gray-800">
            Խումբ: {{ pmps.pmp.group }} — {{ pmps.pmp.group_name }}
          </h2>
          <div class="flex items-center gap-3">
            <span
              class="bg-green-100 px-3 py-1 rounded-full text-green-800 text-sm"
            >
              {{ selectedFactory.name }}
            </span>
            <button
              class="text-sm text-indigo-600 hover:text-indigo-800"
              @click="toggleSelectAll"
            >
              {{ allSelected ? 'Չեղարկել բոլորը' : 'Ընտրել բոլորը' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="p-4 text-center text-gray-500">
        Տվյալներ չեն գտնվել
      </div>

      <!-- Remote numbers & files -->
      <div v-if="pmps.exists" class="space-y-6 mt-4">
        <section
          v-for="remote in pmps.pmp.remote_number"
          :key="remote.id"
          class="pl-4 border-l-4 border-indigo-200"
        >
          <h3 class="text-lg md:text-xl font-semibold text-gray-700">
            Հեռակա համար: {{ remote.remote_number }} —
            {{ remote.remote_number_name }}
          </h3>

          <div class="mt-3 space-y-3">
            <article
              v-for="file in getFactoryFiles(remote.id)"
              :key="file.id"
              class="p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
              :class="{
                'bg-indigo-50 ring-1 ring-indigo-200': selectedFiles.includes(
                  file.id
                ),
              }"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <label
                  :for="'file_' + file.id"
                  class="flex items-start cursor-pointer flex-1"
                >
                  <input
                    :id="'file_' + file.id"
                    type="checkbox"
                    :checked="selectedFiles.includes(file.id)"
                    class="mt-1 h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                    @change="toggleFileSelection(file.id)"
                  />
                  <div class="ml-3">
                    <p class="font-medium text-indigo-700 flex items-center">
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
                    <p class="text-sm text-gray-500 ml-7 mt-1 break-all">
                      {{ file.path }}
                    </p>

                    <transition name="fade">
                      <div
                        v-if="selectedFiles.includes(file.id)"
                        class="mt-2 ml-7"
                      >
                        <label
                          :for="'quantity_' + file.id"
                          class="text-sm text-gray-600"
                          >Քանակ *</label
                        >
                        <input
                          :id="'quantity_' + file.id"
                          :value="fileQuantities[file.id]"
                          type="number"
                          min="1"
                          required
                          class="w-24 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          :class="{
                            'border-red-500': !isQuantityValid(file.id),
                          }"
                          placeholder="1"
                          @input="updateQuantity(file.id, $event.target.value)"
                        />
                        <p
                          v-if="!isQuantityValid(file.id)"
                          class="text-red-500 text-xs mt-1"
                        >
                          Քանակը պետք է լինի 1 կամ ավելի
                        </p>
                        <p
                          v-if="isEditingMode && file.quantity"
                          class="text-sm text-gray-600 mt-1"
                        >
                          <span class="line-through">{{ file.quantity }}</span>
                          → {{ fileQuantities[file.id] || 1 }}
                        </p>
                      </div>
                    </transition>
                  </div>
                </label>

                <div class="text-right min-w-[160px]">
                  <span
                    v-if="file.quantity"
                    class="block text-sm text-green-700"
                    >Քանակ: {{ file.quantity }}</span
                  >
                  <span
                    v-if="file.material_type"
                    class="block text-sm text-purple-700"
                    >Նյութ: {{ file.material_type }}</span
                  >
                  <span
                    v-if="file.thickness"
                    class="block text-sm text-orange-700"
                    >Հաստություն: {{ file.thickness }}</span
                  >
                </div>
              </div>
            </article>

            <div
              v-if="getFactoryFiles(remote.id).length === 0"
              class="p-3 text-center text-gray-500"
            >
              Ֆայլեր չեն գտնվել այս հեռակա համարի համար
            </div>
          </div>
        </section>
      </div>

      <!-- Sticky action bar (with back to details) -->
      <transition name="slide-up">
        <div
          v-if="selectedFiles.length > 0"
          class="mt-6 sticky bottom-3 sm:bottom-4 flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white/95 backdrop-blur p-3 rounded-2xl shadow-xl border border-gray-100"
        >
          <button
            class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition disabled:opacity-60"
            :disabled="!areQuantitiesValid"
            type="button"
            @click="submitSelectedFiles"
          >
            Հաստատել ընտրությունը ({{ selectedFiles.length }})
          </button>

          <button
            class="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl shadow-md transition"
            type="button"
            @click="selectedFactory = null"
          >
            Ընտրել այլ գործարանից
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShowFiles',
  props: {
    pmps: { type: Object, default: () => ({ exists: false }) },
    factories: { type: Array, default: () => [] },
    autoOpenFactoryId: { type: [String, Number], default: null },
    selectedFiles: { type: Array, default: () => [] },
    fileQuantities: { type: Object, default: () => ({}) },
    isEditingMode: { type: Boolean, default: false },
  },
  data() {
    return { selectedFactory: null }
  },
  computed: {
    factoriesWithCount() {
      return this.factories?.map((factory) => {
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
    areQuantitiesValid() {
      return this.selectedFiles.every((fileId) => this.isQuantityValid(fileId))
    },
  },
  mounted() {
    if (this.autoOpenFactoryId) {
      const f = this.factoriesWithCount.find(
        (x) => x.id === this.autoOpenFactoryId
      )
      if (f && f.fileCount > 0) this.selectFactory(f)
    } else {
      const firstWith = this.factoriesWithCount.find((f) => f.fileCount > 0)
      if (firstWith) this.selectFactory(firstWith)
    }
  },
  methods: {
    selectFactory(factory) {
      this.selectedFactory = factory
    },
    getFactoryFiles(remoteNumberId) {
      if (!this.pmps.exists || !this.selectedFactory) return []
      return this.pmps.pmp.files.filter((file) => {
        const pathMatch = file.path.includes(`/${this.selectedFactory.value}/`)
        return file.remote_number_id === remoteNumberId && pathMatch
      })
    },
    toggleFileSelection(fileId) {
      let updated = [...this.selectedFiles]
      const qty = { ...this.fileQuantities }
      if (updated.includes(fileId)) {
        updated = updated.filter((id) => id !== fileId)
        delete qty[fileId]
      } else {
        updated.push(fileId)
        qty[fileId] = 1
      }
      this.$emit('update:selectedFiles', updated)
      this.$emit('update:fileQuantities', qty)
    },
    updateQuantity(fileId, value) {
      const qty = { ...this.fileQuantities, [fileId]: Number(value) }
      this.$emit('update:fileQuantities', qty)
    },
    toggleSelectAll() {
      let updated = [...this.selectedFiles]
      const qty = { ...this.fileQuantities }
      if (this.allSelected) {
        const current = this.pmps.pmp.remote_number.flatMap((r) =>
          this.getFactoryFiles(r.id).map((f) => f.id)
        )
        updated = updated.filter((id) => !current.includes(id))
        current.forEach((id) => delete qty[id])
      } else {
        const add = this.pmps.pmp.remote_number
          .flatMap((r) => this.getFactoryFiles(r.id))
          .map((f) => f.id)
        updated = [...new Set([...updated, ...add])]
        add.forEach((id) => {
          if (!qty[id]) qty[id] = 1
        })
      }
      this.$emit('update:selectedFiles', updated)
      this.$emit('update:fileQuantities', qty)
    },
    isQuantityValid(fileId) {
      const q = this.fileQuantities[fileId]
      return q !== undefined && q > 0
    },
    submitSelectedFiles() {
      if (!this.areQuantitiesValid) {
        this.$notify({
          text: 'Խնդրում ենք մուտքագրել վավեր քանակ բոլոր ընտրված ֆայլերի համար (քանակը պետք է լինի > 0):',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }
      const selectedWithQ = this.pmps.pmp.files
        .filter((f) => this.selectedFiles.includes(f.id))
        .map((f) => ({ ...f, quantity: this.fileQuantities[f.id] }))
      this.$emit('files-selected', selectedWithQ)

      const byFactory = {}
      this.pmps.pmp.files.forEach((file) => {
        if (this.selectedFiles.includes(file.id)) {
          if (!byFactory[file.factory_id]) byFactory[file.factory_id] = []
          byFactory[file.factory_id].push({
            id: file.id,
            quantity: this.fileQuantities[file.id],
          })
        }
      })

      Object.keys(byFactory).forEach((factoryId) => {
        const data = {
          user_id: this.$parent.selectedClient.id,
          creator_id: this.$auth.user.id,
          name: `${this.$parent.selectedPmp.group}.${this.$parent.selectedPmpRemoteNumber}`,
          description: this.$parent.description,
          status: 'pending',
          finish_date: this.$parent.finishDate,
          remote_number_id: this.$parent.remote_number_id,
          pmp_id: this.$parent.selectedPmp.id,
          link_existing_files: this.$parent.link_existing_files,
          factory_id: factoryId,
          selected_files: byFactory[factoryId],
        }
        this.$emit('factory-files-selected', data)
      })

      this.$emit('back')
    },
  },
}
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-up-enter,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
