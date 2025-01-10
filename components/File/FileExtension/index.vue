<template>
  <div class="mx-2 h-full">
    <h2 class="font-sans italic text-lg mb-4 h-12">
      {{ paragraph }}
    </h2>
    <ul class="h-56 overflow-y-auto">
      <li
        v-for="(extension, index) in extensions"
        :key="extension.id"
        class="flex justify-between items-center hover:bg-neutral-200"
      >
        <div
          v-if="editIndex !== index"
          class="grid grid-cols-2 gap-2 cursor-pointer w-full px-2"
        >
          <p class="mx-auto" @click="startEditing(index)">
            {{ extension.extension }}
          </p>
          <button
            class="text-red-500 mx-auto"
            @click="deleteExtension(extension.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 30 30"
              fill="red"
            >
              <path
                d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
              ></path>
            </svg>
          </button>
        </div>
        <div v-else class="flex flex-row items-center justify-between mx-auto">
          <input
            v-model="editedExtension"
            class="border rounded px-2 py-1"
            type="text"
            @input="onEditInput(editedExtension)"
          />
          <div class="flex items-center justify-between">
            <button class="text-green-500 ml-2" @click="saveEdit(extension.id)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="green"
              >
                <path
                  d="M 43.470703 8.9863281 A 1.50015 1.50015 0 0 0 42.439453 9.4394531 L 16.5 35.378906 L 5.5605469 24.439453 A 1.50015 1.50015 0 1 0 3.4394531 26.560547 L 15.439453 38.560547 A 1.50015 1.50015 0 0 0 17.560547 38.560547 L 44.560547 11.560547 A 1.50015 1.50015 0 0 0 43.470703 8.9863281 z"
                ></path>
              </svg>
            </button>
            <button class="text-gray-500 ml-2" @click="cancelEdit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="20"
                height="20"
                viewBox="0 0 50 50"
                fill="red"
              >
                <path
                  d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 37.690466 12.309534 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 13.390466 46 4 36.609534 4 25 C 4 13.390466 13.390466 4 25 4 z M 32.990234 15.986328 A 1.0001 1.0001 0 0 0 32.292969 16.292969 L 25 23.585938 L 17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031 L 23.585938 25 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 25 26.414062 L 32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969 L 26.414062 25 L 33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.990234 15.986328 z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </li>
    </ul>
    <div class="flex flex-row items-center justify-center mt-4">
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
      Object,
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
      this.$emit('update-extension', { id, value: this.editedExtension })
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
