<template>
  <div class="flex flex-row items-start justify-start w-full m-0 p-0">
    <div
      class="w-1/4 h-screen overflow-y-auto border-r-2 border-gray-800 bg-indigo-300 pt-8"
    >
      <h1 class="text-center text-xl italic font-sans leading-loose">
        Authors
      </h1>
      <div v-for="author in getMessage" :key="author._id">
        <button
          class="w-full py-2 border border-indigo-500 hover:bg-indigo-600"
          @click="selectMessage(author)"
        >
          {{ author.name }}
        </button>
      </div>
    </div>
    <div class="w-full flex flex-col items-start justify-start">
      <h1 class="text-center mx-auto text-xl italic font-sans leading-loose">
        Messages
      </h1>
      <div v-if="messages" class="text-start px-2 flex items-center">
        {{ messages.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  layout: 'creatorLayout',
  middleware: ['creator', 'roleRedirect'],
  data() {
    return {
      messages: null,
    }
  },
  computed: {
    ...mapGetters('contact', ['getMessage']),
  },
  mounted() {
    this.fetchMessages()
  },
  methods: {
    ...mapActions('contact', ['fetchMessages']),
    selectMessage(author) {
      this.messages = author
    },
  },
}
</script>

<style scoped></style>
