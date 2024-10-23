<template>
  <div class="relative">
    <input
      type="file"
      class="block py-2.5 ps-6 pe-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      :class="classes"
      @change="handleFileChange"
    />
    <label
      :for="id"
      class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform scale-75 top-0 origin-[0] peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-focus:scale-75 peer-focus:-translate-y-6"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'FileInputWithLabel',
  props: {
    id: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: 'Choose File',
    },
    classes: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.$emit('file-uploaded', file) // Emit the file to parent component
      } else {
        this.$emit('file-uploaded', null) // Emit null if no file
      }
    },
  },
}
</script>
