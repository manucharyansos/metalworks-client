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

        <button
          type="button"
          class="p-2 hover:bg-gray-100 rounded-xl transition"
          title="Հետ"
          @click="$emit('back')"
        >
          <svg
            class="w-6 h-6 text-gray-500 hover:text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
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
                  d="M4 21h16M5 21V9a1 1 0 011-1h3V5a1 1 0 011-1h4a1 1 0 011 1v3h3a1 1 0 011 1v12"
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
    <div v-else class="w-full">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 truncate">
          {{ selectedFactory.name }}
        </h2>

        <button
          type="button"
          class="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          title="Հետ գործարաններ"
          @click="selectedFactory = null"
        >
          <svg
            class="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <!-- PMP Group Header -->
      <div
        v-if="pmps.exists"
        class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm mb-5"
      >
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800">
              Խումբ: <span class="text-indigo-700">{{ pmps.pmp.group }}</span> —
              {{ pmps.pmp.group_name }}
            </h3>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <!-- Պարզ, վավեր icon -->
                <path
                  d="M10 2a6 6 0 016 6v1a2 2 0 01-.4 1.2l-3.6 4.8A2 2 0 0110.4 16H9.6a2 2 0 01-1.6-.8L4.4 10.2A2 2 0 014 9V8a6 6 0 016-6z"
                />
              </svg>
              {{ selectedFactory.name }}
            </span>
            <button
              class="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline-offset-2 hover:underline transition"
              @click="toggleSelectAll"
            >
              {{ allSelected ? 'Չեղարկել բոլորը' : 'Ընտրել բոլորը' }}
            </button>
          </div>
        </div>
      </div>

      <!-- No PMP Data -->
      <div
        v-else
        class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300"
      >
        <svg
          class="w-12 h-12 mx-auto mb-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4l-2 3h-4l-2-3H4"
          />
        </svg>
        Տվյալներ չեն գտնվել
      </div>

      <!-- Remote Numbers & Files (ONLY selected remote_number) -->
      <div
        v-if="pmps.exists && remoteNumbersWithFiles.length > 0"
        class="space-y-6"
      >
        <section
          v-for="remote in remoteNumbersWithFiles"
          :key="remote.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5"
        >
          <h4
            class="text-base md:text-lg font-semibold text-gray-700 mb-3 flex items-center"
          >
            <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Հեռակա համար:
            <span class="text-indigo-600 ml-1">{{ remote.remote_number }}</span>
            — {{ remote.remote_number_name }}
          </h4>

          <div class="space-y-3">
            <article
              v-for="file in remote.files"
              :key="file.id"
              class="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200"
              :class="{
                'ring-2 ring-indigo-400 bg-indigo-50': selectedFiles.includes(
                  file.id
                ),
              }"
            >
              <div class="flex flex-col lg:flex-row lg:items-start gap-4">
                <!-- Checkbox + Name + Path -->
                <label
                  :for="'file_' + file.id"
                  class="flex items-start cursor-pointer flex-1"
                >
                  <input
                    :id="'file_' + file.id"
                    type="checkbox"
                    :checked="selectedFiles.includes(file.id)"
                    class="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                    @change="toggleFileSelection(file.id)"
                  />
                  <div class="ml-3 flex-1">
                    <p
                      class="font-medium text-indigo-700 flex items-center text-sm md:text-base"
                    >
                      <svg
                        class="w-5 h-5 mr-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <!-- Փաստաթղթի icon -->
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6M9 8h3m3-6H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-6-7z"
                        />
                      </svg>
                      {{ file.original_name }}
                    </p>
                    <p
                      class="text-xs md:text-sm text-gray-500 mt-1 break-all font-mono"
                    >
                      {{ file.path }}
                    </p>

                    <!-- Quantity Input (when selected) -->
                    <transition name="fade">
                      <div v-if="selectedFiles.includes(file.id)" class="mt-3">
                        <label
                          :for="'quantity_' + file.id"
                          class="block text-xs font-medium text-gray-700 mb-1"
                        >
                          Քանակ <span class="text-red-500">*</span>
                        </label>
                        <div class="flex items-center gap-2">
                          <input
                            :id="'quantity_' + file.id"
                            :value="fileQuantities[file.id]"
                            type="number"
                            min="1"
                            required
                            class="w-20 p-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            :class="{
                              'border-red-500 ring-1 ring-red-300':
                                !isQuantityValid(file.id),
                            }"
                            placeholder="1"
                            @input="
                              updateQuantity(file.id, $event.target.value)
                            "
                          />
                          <span
                            v-if="isEditingMode && file.quantity"
                            class="text-xs text-gray-600"
                          >
                            <del class="text-gray-400">{{ file.quantity }}</del>
                            <span class="mx-1">→</span>
                            <strong class="text-indigo-600">
                              {{ fileQuantities[file.id] || 1 }}
                            </strong>
                          </span>
                        </div>
                        <p
                          v-if="!isQuantityValid(file.id)"
                          class="text-xs text-red-500 mt-1"
                        >
                          Պետք է լինի 1 կամ ավելի
                        </p>
                      </div>
                    </transition>
                  </div>
                </label>

                <!-- File Metadata -->
                <div class="text-right space-y-1 text-xs md:text-sm">
                  <p v-if="file.quantity" class="text-emerald-700 font-medium">
                    Քանակ: {{ file.quantity }}
                  </p>
                  <p v-if="file.material_type" class="text-purple-700">
                    Նյութ: {{ file.material_type }}
                  </p>
                  <p v-if="file.thickness" class="text-orange-700">
                    Հաստություն: {{ file.thickness }}
                  </p>
                </div>
              </div>
            </article>

            <!-- No files -->
            <div
              v-if="getFactoryFiles(remote.id).length === 0"
              class="text-center py-6 text-gray-400 text-sm"
            >
              <svg
                class="w-10 h-10 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Ֆայլեր չեն գտնվել
            </div>
          </div>
        </section>
      </div>

      <!-- Sticky Action Bar -->
      <transition name="slide-up">
        <div
          v-if="selectedFiles.length > 0"
          class="mt-8 sticky bottom-4 left-0 right-0 mx-4 md:mx-0"
        >
          <div
            class="bg-white/95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-gray-200 flex flex-col sm:flex-row gap-3"
          >
            <button
              :disabled="!areQuantitiesValid"
              class="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              @click="submitSelectedFiles"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Հաստատել ({{ selectedFiles.length }})
            </button>

            <button
              class="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition-all transform hover:scale-105 flex items-center justify-center"
              @click="selectedFactory = null"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 21h16M5 21V9a1 1 0 011-1h3V5a1 1 0 011-1h4a1 1 0 011 1v3h3a1 1 0 011 1v12"
                />
              </svg>
              Ընտրել այլ գործարանից
            </button>
          </div>
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
    remoteNumberId: { type: [Number, String], default: null },
  },
  data() {
    return { selectedFactory: null }
  },
  computed: {
    remoteNumbersWithFiles() {
      if (!this.pmps?.exists || !this.selectedFactory || !this.remoteNumberId)
        return []

      const allRemotes = this.pmps.pmp.remote_number || []
      const remote = allRemotes.find(
        (r) => Number(r.id) === Number(this.remoteNumberId)
      )
      if (!remote) return []

      const files = (this.pmps.pmp.files || []).filter(
        (file) =>
          Number(file.remote_number_id) === Number(remote.id) &&
          Number(file.factory_id) === Number(this.selectedFactory.id)
      )

      return files.length ? [{ ...remote, files }] : []
    },
    factoriesWithCount() {
      if (
        !this.factories ||
        !Array.isArray(this.factories) ||
        !this.pmps?.exists
      )
        return []
      return this.factories.map((factory) => {
        const fileCount = (this.pmps.pmp.files || []).filter(
          (file) =>
            Number(file.factory_id) === Number(factory.id) &&
            (!this.remoteNumberId ||
              Number(file.remote_number_id) === Number(this.remoteNumberId))
        ).length
        return { ...factory, fileCount }
      })
    },
    allSelected() {
      if (!this.pmps?.exists || !this.selectedFactory) return false
      const allFiles = this.remoteNumbersWithFiles.flatMap(
        (remote) => remote.files
      )
      return (
        allFiles.length > 0 && this.selectedFiles.length === allFiles.length
      )
    },
    areQuantitiesValid() {
      return this.selectedFiles.every((id) => this.isQuantityValid(id))
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.factories?.length || !this.pmps?.exists) return

      if (this.autoOpenFactoryId) {
        const f = (this.factoriesWithCount || []).find(
          (x) => x.id === this.autoOpenFactoryId
        )
        if (f && f.fileCount > 0) this.selectFactory(f)
      } else {
        const firstWith = (this.factoriesWithCount || []).find(
          (f) => f.fileCount > 0
        )
        if (firstWith) this.selectFactory(firstWith)
      }
    })
  },
  methods: {
    close() {
      this.$router.push('/engineer/orders/create')
    },
    selectFactory(factory) {
      this.selectedFactory = factory
    },
    getFactoryFiles(remoteNumberId) {
      if (!this.pmps?.exists || !this.selectedFactory) return []
      return (this.pmps.pmp.files || []).filter(
        (file) =>
          Number(file.remote_number_id) === Number(remoteNumberId) &&
          Number(file.factory_id) === Number(this.selectedFactory.id)
      )
    },
    toggleFileSelection(fileId) {
      const updated = this.selectedFiles.includes(fileId)
        ? this.selectedFiles.filter((id) => id !== fileId)
        : [...this.selectedFiles, fileId]

      const qty = { ...this.fileQuantities }
      if (!updated.includes(fileId)) delete qty[fileId]
      else if (!qty[fileId]) qty[fileId] = 1

      this.$emit('update:selectedFiles', updated)
      this.$emit('update:fileQuantities', qty)
    },
    updateQuantity(fileId, value) {
      this.$emit('update:fileQuantities', {
        ...this.fileQuantities,
        [fileId]: Number(value) || 1,
      })
    },
    toggleSelectAll() {
      const currentFiles = this.remoteNumbersWithFiles.flatMap((r) =>
        r.files.map((f) => f.id)
      )
      let updated = [...this.selectedFiles]
      const qty = { ...this.fileQuantities }

      if (this.allSelected) {
        updated = updated.filter((id) => !currentFiles.includes(id))
        currentFiles.forEach((id) => delete qty[id])
      } else {
        updated = [...new Set([...updated, ...currentFiles])]

        currentFiles.forEach((id) => {
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
          text: 'Խնդրում ենք մուտքագրել վավեր քանակ բոլոր ընտրված ֆայլերի համար',
          type: 'error',
          duration: 3000,
        })
        return
      }

      const selectedWithQ = (this.pmps.pmp.files || [])
        .filter((f) => this.selectedFiles.includes(f.id))
        .map((f) => ({ ...f, quantity: this.fileQuantities[f.id] }))

      this.$emit('files-selected', selectedWithQ)
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
