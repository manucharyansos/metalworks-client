<template>
  <div>
    <div class="relative">
      <div
        class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none"
      >
        <slot name="label_svg"></slot>
      </div>
      <input
        :type="type"
        :class="classes"
        :value="value"
        :placeholder="placeholder"
        @input="$emit('input', $event.target.value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputWithLabels',
  props: {
    type: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    classes: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped></style>
