<template>
  <div>
    <h3>{{ stepTitle }}</h3>
    <input type="file" multiple @change="handleFileUpload" />
    <button :disabled="!canProceed" @click="uploadFiles">
      Հաստատել
    </button>
  </div>
</template>

<script>
export default {
  props: ['currentStep'],
  data() {
    return {
      files: [],
      steps: ['Լազերային ֆայլ', 'Բենդինգի ֆայլ', 'Այլ տվյալներ'],
    };
  },
  computed: {
    stepTitle() {
      return this.steps[this.currentStep];
    },
    canProceed() {
      return this.files.length > 0;
    },
  },
  methods: {
    handleFileUpload(event) {
      this.files = Array.from(event.target.files);
    },
    uploadFiles() {
      this.$emit('filesUploaded', { step: this.currentStep, files: this.files });
    },
  },
};
</script>
