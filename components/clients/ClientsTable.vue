<template>
  <div class="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-700 dark:text-gray-200">
        <thead class="text-xs uppercase bg-gray-100 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3">Անուն</th>
            <th class="px-6 py-3">Հեռախոս</th>
            <th class="px-6 py-3">Հասցե</th>
            <th class="px-6 py-3">Կարգավիճակ</th>
            <th class="px-6 py-3 w-32 text-right">Գործողություններ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-6 text-center">Բեռնում…</td>
          </tr>
          <tr
            v-for="c in rows"
            :key="c.id"
            class="bg-white dark:bg-gray-800 border-b hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-3 font-medium">{{ c.name }}</td>
            <td class="px-6 py-3">{{ c.phone || '—' }}</td>
            <td class="px-6 py-3">{{ c.address || '—' }}</td>
            <td class="px-6 py-3">
              <span
                class="px-2 py-1 rounded-md text-xs font-medium"
                :class="
                  c.type === 'legalEntity'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                "
              >
                {{ c.type === 'legalEntity' ? 'Իրավաբանական անձ' : 'Ֆիզ․ անձ' }}
              </span>
            </td>
            <td class="px-6 py-3 text-right">
              <button
                class="px-3 py-1 border rounded-lg mr-2"
                @click="$emit('edit', c)"
              >
                Խմբագրել
              </button>
              <button
                class="px-3 py-1 border rounded-lg text-red-600"
                @click="$emit('delete', c)"
              >
                Ջնջել
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    submitting: { type: Boolean, default: false },
  },
}
</script>
