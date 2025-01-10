<template>
  <div class="shadow-md sm:rounded-lg mt-8">
    <!-- Action & Search Section -->
    <div
      class="flex items-center justify-between flex-row flex-wrap my-8 space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900"
    >
      <!-- Action Button -->
      <div>
        <button
          id="dropdownActionButton"
          data-dropdown-toggle="dropdownAction"
          class="inline-flex items-center mt-12 text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          type="button"
          @click="openAction"
        >
          Action
          <svg
            class="w-2.5 h-2.5 ms-2.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        <!-- Dropdown Menu -->
        <div
          v-if="isOpenAction"
          id="dropdownAction"
          class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
        >
          <ul
            v-for="group in allMaterialGroups"
            :key="group.id"
            class="py-1 text-sm text-gray-700 dark:text-gray-200"
          >
            <li class="py-1 px-2 cursor-pointer" @click="selectCroup(group)">
              {{ group.name }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Search Bar -->
      <input-with-label-icon
        v-model="searchable"
        label="Որոնել"
        type="text"
        label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
        classes="block px-2.5 mt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      >
        <template #label_svg>
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </template>
      </input-with-label-icon>
    </div>

    <!-- Orders Table -->
    <div class="overflow-x-auto">
      <table
        class="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <!-- Table Headers -->
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Նկարագրություն</th>
            <th scope="col" class="px-6 py-3">Լայնություն</th>
            <th scope="col" class="px-6 py-3">Երկարություն</th>
            <th scope="col" class="px-6 py-3">Բարձրություն</th>
            <th scope="col" class="px-6 py-3">Հաստություն</th>
          </tr>
        </thead>
        <tbody>
          <!-- Dynamic Rows -->
          <tr
            v-for="material in filteredMaterials"
            :key="material.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td class="px-6 py-4">{{ material.description }}</td>
            <td class="px-6 py-4">{{ material.width }}</td>
            <td class="px-6 py-4">{{ material.height }}</td>
            <td class="px-6 py-4">{{ material.length }}</td>
            <td class="px-6 py-4">{{ material.thickness }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'

export default {
  components: { InputWithLabelIcon },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      searchable: null,
      selectedGroupId: null,
      isOpenAction: false,
    }
  },
  computed: {
    ...mapGetters('materials', ['getMaterials']),
    ...mapGetters('categories', ['allMaterialGroups', 'getCategoryById']),
    filteredMaterials() {
      if (this.selectedGroupId) {
        return this.getMaterials.filter(
          (material) => material.material_category_id === this.selectedGroupId
        )
      }

      if (this.searchable) {
        const searchTerm = this.searchable.toLowerCase()
        return this.getMaterials.filter((material) => {
          return (
            (material.description || '').toLowerCase().includes(searchTerm) ||
            (material.width || '').toLowerCase().includes(searchTerm) ||
            (material.height || '').toLowerCase().includes(searchTerm) ||
            (material.length || '').toLowerCase().includes(searchTerm) ||
            (material.thickness || '').toLowerCase().includes(searchTerm)
          )
        })
      }
      return this.getMaterials
    },
  },

  watch: {
    // materials: {
    //   handler(newMaterials) {
    //     this.getMaterials = newMaterials
    //   },
    //   immediate: true,
    // },
  },
  mounted() {
    this.fetchMaterials()
    this.fetchMaterialGroups()
  },
  methods: {
    ...mapActions('materials', ['fetchMaterials']),
    ...mapActions('categories', [
      'fetchMaterialGroups',
      'fetchMaterialCategory',
    ]),
    openAction() {
      this.isOpenAction = !this.isOpenAction
    },
    selectCroup(group) {
      this.selectedGroupId = group.id
      this.fetchMaterialCategory(group.id)
      this.isOpenAction = false
    },
  },
}
</script>
