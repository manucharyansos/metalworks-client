<template>
  <div class="flex flex-row mt-44 items-center justify-between p-5">
    <h1>Creator</h1>
    <input-with-labels
      v-model="name"
      classes="focus:outline-none block w-full ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      placeholder="Name"
    ></input-with-labels>

    <button class="px-8 py-2" @click="addRole">Add</button>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import InputWithLabels from '~/components/form/InputWithIcon.vue'

export default {
  name: 'CreatorPage',
  components: { InputWithLabels },
  middleware: 'creator',
  data() {
    return {
      name: '',
    }
  },
  methods: {
    ...mapActions('creator', ['createRole']),
    addRole() {
      this.createRole({ name: this.name })
    },
  },
}
</script>
