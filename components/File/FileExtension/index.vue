<template>
  <div
    class="mx-2 h-full rounded-2xl bg-white/80 border border-slate-200 shadow-sm backdrop-blur-sm p-4 md:p-5 flex flex-col justify-between transition duration-200 ease-out hover:shadow-lg hover:-translate-y-0.5"
  >
    <h2
      class="font-montserrat text-sm md:text-base font-semibold mb-3 md:mb-4 min-h-[3rem] text-slate-800"
    >
      {{ paragraph }}
    </h2>

    <ul class="space-y-1 max-h-64 overflow-y-auto pr-1">
      <li
        v-for="(extension, index) in extensions"
        :key="extension.id"
        class="group flex items-center rounded-xl px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-slate-100"
      >
        <!-- Դիտման ռեժիմ -->
        <div
          v-if="editIndex !== index"
          class="grid grid-cols-[1fr_auto] items-center gap-2 w-full"
        >
          <p
            class="mx-auto font-mono text-sm text-slate-700 cursor-pointer group-hover:text-indigo-600 transition-colors"
            @click="startEditing(index)"
          >
            {{ extension.extension }}
          </p>

          <button
            class="text-red-500 mx-auto p-1 rounded-full hover:bg-red-50 transition"
            @click="deleteExtension(extension.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 30 30"
              class="transition-transform group-hover:scale-110"
            >
              <path
                fill="currentColor"
                d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Խմբագրման ռեժիմ -->
        <div v-else class="flex w-full items-center justify-between gap-2">
          <input
            v-model="editedExtension"
            class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-28 sm:w-40 md:w-44"
            type="text"
            @input="onEditInput(editedExtension)"
          />
          <div class="flex items-center gap-1 sm:gap-2">
            <button
              class="text-green-500 p-1 rounded-full hover:bg-green-50 transition"
              @click="saveEdit(extension.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                class="transition-transform hover:scale-110"
              >
                <path
                  fill="currentColor"
                  d="M 43.470703 8.9863281 A 1.50015 1.50015 0 0 0 42.439453 9.4394531 L 16.5 35.378906 L 5.5605469 24.439453 A 1.50015 1.50015 0 1 0 3.4394531 26.560547 L 15.439453 38.560547 A 1.50015 1.50015 0 0 0 17.560547 38.560547 L 44.560547 11.560547 A 1.50015 1.50015 0 0 0 43.470703 8.9863281 z"
                ></path>
              </svg>
            </button>
            <button
              class="text-red-500 p-1 rounded-full hover:bg-red-50 transition"
              @click="cancelEdit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 50 50"
                class="transition-transform hover:scale-110"
              >
                <path
                  fill="currentColor"
                  d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 37.690466 12.309534 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 13.390466 46 4 36.609534 4 25 C 4 13.390466 13.390466 4 25 4 z M 32.990234 15.986328 A 1.0001 1.0001 0 0 0 32.292969 16.292969 L 25 23.585938 L 17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031 L 23.585938 25 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 25 26.414062 L 32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969 L 26.414062 25 L 33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.990234 15.986328 z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div
      class="flex flex-row items-center justify-center mt-4 gap-3 pt-3 border-t border-slate-100"
    >
      <slot name="custom"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileExtension',
  props: {
    paragraph: {
      type: String,
      default: '',
    },
    extensions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      editIndex: null,
      editedExtension: '',
    }
  },
  methods: {
    startEditing(index) {
      this.editIndex = index
      this.editedExtension = this.extensions[index].extension
    },
    saveEdit(id) {
      if (!this.editedExtension?.trim()) {
        return
      }
      this.$emit('update-extension', { id, value: this.editedExtension.trim() })
      this.editIndex = null
      this.editedExtension = ''
    },
    cancelEdit() {
      this.editIndex = null
      this.editedExtension = ''
    },
    deleteExtension(id) {
      this.$emit('delete-extension', id)
    },
    onEditInput(value) {
      this.editedExtension = value
    },
  },
}
</script>
