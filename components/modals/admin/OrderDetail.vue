<template>
  <div class="space-y-6">
    <!-- Order Details -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div class="space-y-4">
        <slot name="name"></slot>
        <slot name="orderNumber"></slot>
        <slot name="quantity"></slot>
        <slot name="startDate"></slot>
        <slot name="finishDate"></slot>
      </div>

      <!-- Factory Status -->
      <div class="space-y-4">
        <!-- Factory Selection -->
        <label class="block text-sm font-medium text-gray-900 dark:text-white"
          >Գործարաններ</label
        >
        <div
          class="flex flex-row flex-wrap items-start justify-between bg-indigo-200 border border-indigo-200 rounded-lg p-4"
        >
          <slot name="factories"></slot>
        </div>
        <slot name="selectFactory"></slot>
      </div>

      <div class="space-y-4">
        <slot name="factoryStatus"></slot>
      </div>
    </div>

    <div class="grid grid-cols-1">
      <div class="space-y-4">
        <slot name="description"></slot>
      </div>
      <div class="space-y-4">
        <slot name="files"></slot>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap items-center justify-end space-x-4 mt-6">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'OrderDetail',
}
</script>
