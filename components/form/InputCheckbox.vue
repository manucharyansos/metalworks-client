<template>
  <div class="flex items-center">
    <input
      :id="id"
      type="checkbox"
      :value="value"
      :checked="modelValue.includes(value)"
      class="rounded-md w-6 h-6 border-2"
      @change="handleChange"
    />
    <label :for="id" class="ml-2">{{ label }}</label>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => [] // Ensure it's an empty array by default
    },
    id: {
      type: String,
      required: true
    }
  },
  methods: {
    handleChange(event) {
      const isChecked = event.target.checked;
      const newSelectedFactories = [...this.modelValue];

      if (isChecked) {
        if (!newSelectedFactories.includes(this.value)) {
          newSelectedFactories.push(this.value);
        }
      } else {
        const index = newSelectedFactories.indexOf(this.value);
        if (index > -1) {
          newSelectedFactories.splice(index, 1);
        }
      }

      this.$emit('update:modelValue', newSelectedFactories);
    }
  }
}
</script>
