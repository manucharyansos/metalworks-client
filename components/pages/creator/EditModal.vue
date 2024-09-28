<template>
  <div v-if="isOpen" class="relative p-4 w-full max-w-2xl max-h-full">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <!-- Modal header -->
      <div
        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
      >
        <slot name="header"></slot>
      </div>
      <!-- Modal body -->
      <div class="flex items-center justify-center">
        <p>Id: {{ data.id }}</p>
        <p>Prefix code: {{ data.prefix_code.code }}</p>
        <p>Order number{{ data.order_number.number }}</p>
        <div v-for="detail in data.details" :key="detail.id">
          Details
          <p>Name: {{ detail.name }}</p>
          <p>Quantity: {{ detail.quantity }}</p>
          <p>Description: {{ detail.description }}</p>
        </div>
      </div>
      <!-- Modal footer -->
      <div
        class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600"
      >
        <button
          data-modal-hide="default-modal"
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          I accept
        </button>
        <button
          data-modal-hide="default-modal"
          type="button"
          class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Decline
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

<style scoped></style>
