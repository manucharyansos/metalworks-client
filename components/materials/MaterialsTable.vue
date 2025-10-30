<template>
  <div class="overflow-x-auto">
    <table
      class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300"
    >
      <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-700">
        <tr>
          <th class="px-6 py-3">Նկարագրություն</th>
          <th class="px-6 py-3">Լայն</th>
          <th class="px-6 py-3">Երկար</th>
          <th class="px-6 py-3">Բարձր</th>
          <th class="px-6 py-3">Հաստ</th>
          <th class="px-6 py-3 text-right">Գործողություններ</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="m in items"
          :key="m.id"
          class="bg-white dark:bg-gray-800 border-b"
        >
          <td class="px-6 py-3">{{ m.description || '—' }}</td>
          <td class="px-6 py-3">{{ m.width ?? '—' }}</td>
          <td class="px-6 py-3">{{ m.length ?? '—' }}</td>
          <td class="px-6 py-3">{{ m.height ?? '—' }}</td>
          <td class="px-6 py-3">{{ m.thickness ?? '—' }}</td>
          <td class="px-6 py-3 text-right space-x-2">
            <button
              class="px-3 py-1 rounded bg-amber-500 text-white"
              @click="$emit('edit', m)"
            >
              Փոփոխել
            </button>
            <button
              class="px-3 py-1 rounded bg-red-600 text-white"
              @click="$emit('remove', m)"
            >
              Ջնջել
            </button>
          </td>
        </tr>
        <tr v-if="!items || !items.length">
          <td colspan="6" class="px-6 py-6 text-center text-gray-400">
            Տվյալներ չկան
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default { props: { items: { type: Array, default: () => [] } } }
</script>
