<template>
  <div
    class="mt-36 flex flex-row flex-wrap items-center justify-between w-full"
  >
    <div v-for="task in tasks" :key="task.id">
      <div
        class="block w-64 cursor-pointer p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
      >
        <h5
          class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          {{ task.name }}
        </h5>
        <p class="font-normal text-gray-700 dark:text-gray-400">
          {{ task.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  middleware: 'laser',
  data() {
    return {
      // tasks: []
    }
  },
  computed: {
    ...mapGetters('factory', ['getTasks']),
    tasks() {
      return this.getTasks
    },
  },
  mounted() {
    this.fetchTasks()
  },
  methods: {
    ...mapActions('factory', ['fetchTasks']),
  },
}
</script>

<style scoped></style>
