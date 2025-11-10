<template>
  <div
    class="absolute top-0 min-h-screen w-full flex items-center justify-center bg-gray-100 rounded p-4 text-gray-700"
  >
    <!-- Close button -->
    <button class="fixed top-10 right-20" @click="$emit('close')">
      <svg
        class="w-6 h-6 text-gray-800"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="red"
        viewBox="0 0 24 24"
      >
        <path
          stroke="red"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18 17.94 6M18 18 6.06 6"
        />
      </svg>
    </button>

    <div
      class="grid lg:grid-cols-2 grid-cols-1 justify-between gap-2 bg-white p-6 rounded-lg shadow-slate-500 lg:w-5/6 w-full"
    >
      <!-- DXF Viewer Section -->
      <div
        class="flex items-center justify-center show_file_section mx-auto text-center"
      >
        <slot name="showFiles"></slot>
      </div>

      <!-- Order Details Section -->
      <div class="flex flex-col items-start justify-center">
        <h3 class="text-lg font-bold mb-4">Առաջադրանքի մանրամասներ</h3>
        <ul class="text-base font-medium leading-7">
          <li>Անուն: {{ details.name || 'N/A' }}</li>
          <li>Քանակ: {{ details.quantity || 'N/A' }}</li>
          <li>Նկարագրություն: {{ details.description || 'N/A' }}</li>
        </ul>

        <!-- File List -->
        <div
          v-if="details.factory_orders && details.factory_orders.length > 0"
          class="flex flex-col items-center justify-center w-full"
        >
          <h4 class="text-lg font-bold mt-4">Ֆայլեր</h4>
          <ul class="w-full">
            <li v-for="order in details.factory_orders" :key="order.id">
              <div v-if="order.files && order.files.length > 0">
                <div class="flex items-center justify-between mb-2 px-1">
                  <div class="text-sm font-semibold">
                    {{ order.factory?.name || 'Արտադրամաս' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Կատարող՝ <span class="font-medium">{{ order.operator?.name || '—' }}</span>
                  </div>
                </div>
                <div
                  v-for="file in order.files"
                  :key="file.id"
                  class="border border-gray-200 rounded-md my-1 shadow-slate-600 shadow-md rounded-b-lg w-full"
                >
                  <div class="flex items-center gap-4 justify-between p-3">
                    <button
                      class="text-blue-500 hover:text-blue-700"
                      @click="$emit('view-file', file.path)"
                    >
                      Դիտել
                    </button>
                    <button
                      class="text-green-500 hover:text-green-700 flex items-center gap-2 justify-between"
                      :class="{ 'text-black': file.status === 'downloaded' }"
                      @click="$emit('download-file', file)"
                    >
                      {{ file.original_name }}
                      <img
                        class="w-8 h-8"
                        src="/images/img.png"
                        alt="File Icon"
                      />
                    </button>
                  </div>
                  <div class="flex items-center justify-between gap-2 my-2 p-3">
                    <p class="flex flex-col items-center gap-2">
                      <span class="font-montserrat font-bold">Քանակ։</span>
                      <span
                        v-if="
                          details.link_existing_files &&
                          getSelectedFileQuantity(file)
                        "
                      >
                        <span class="line-through">{{
                          file.quantity || 'N/A'
                        }}</span>
                        <span class="ml-2 text-blue-500">{{
                          getSelectedFileQuantity(file)
                        }}</span>
                      </span>
                      <span v-else>{{ file.quantity || 'N/A' }}</span>
                    </p>
                    <p class="flex flex-col items-center gap-2">
                      <span class="italic font-sans font-bold"
                        >Նյութի տեսակ։</span
                      >
                      {{ file.material_type || 'N/A' }}
                    </p>
                    <p class="flex flex-col items-center gap-2">
                      <span class="font-montserrat font-bold"
                        >Հաստություն։</span
                      >
                      {{ file.thickness || 'N/A' }}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderDetailsModal',
  props: {
    details: {
      type: Object,
      required: true,
      default: () => ({
        name: '',
        quantity: null,
        description: '',
        factory_orders: [],
        selectedFiles: [],
        link_existing_files: false,
      }),
    },
    dxfUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'view-file', 'download-file'],
  methods: {
    getSelectedFileQuantity(file) {
      const selectedFile = this.details.selectedFiles?.find(
        (sf) => sf.pmp_file_id === file.id
      )
      return selectedFile ? selectedFile.quantity : null
    },
  },
}
</script>

<style scoped>
.absolute {
  z-index: 50;
}
</style>
