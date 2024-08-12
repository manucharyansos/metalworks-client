<template>
  <div class="flex items-center justify-between">

<!--    <label :for="label_for" :class="label_class">{{label}}</label>-->
    <div class="relative">
      <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
        <slot name="label_svg"></slot>
      </div>
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
      },
      value: {
        type: String,
      },
      placeholder: {
        type: String
      },
      classes: {
        type: String
      },
      label_class: {
        type: String
      },
      label: {
        type: String
      },
      label_for: {
        type: String
      }
    }
  }
</script>

<style scoped>

</style>
