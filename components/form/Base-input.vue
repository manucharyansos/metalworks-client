<template>
  <div class="flex items-center justify-between">
    <div class="relative">
      <input
        id="input-group-1"
        :type="type"
        :class="classes"
        :value="value"
        :placeholder="placeholder"
        @input="$emit('input', $event.target.value)"
      >
    </div>

  </div>
</template>

<script>
  export default {
    name: 'FormInput',
    props: {
      type: {
        type: String,
        default: ''
      },
      value: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: ''
      },
      classes: {
        type: String,
        default: ''
      },
    }
  }
</script>

<style scoped>

</style>
