<template>
  <div class="mx-2 h-full">
    <h2 class="font-sans italic text-lg mb-4">
      {{ paragraph }}
    </h2>
    <ul>
      <li
        v-for="(extension, index) in extensions"
        :key="extension.id"
        class="flex justify-between items-center"
      >
        <div
          v-if="editIndex !== index"
          class="flex flex-row items-center justify-around cursor-pointer w-full"
        >
          <p @click="startEditing(index)">{{ extension.extension }}</p>
          <button
            class="text-red-500 ml-2 float-right"
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
        <div v-else>
          <input
            v-model="editedExtension"
            class="border rounded px-2 py-1"
            type="text"
            @input="onEditInput(editedExtension)"
          />
          <button class="text-green-500 ml-2" @click="saveEdit(extension.id)">
            Պահպանել
          </button>
          <button class="text-gray-500 ml-2" @click="cancelEdit">
            Չեղարկել
          </button>
        </div>
      </li>
      <li class="flex flex-row items-center justify-center mt-4">
        <slot name="custom"></slot>
      </li>
    </ul>
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
