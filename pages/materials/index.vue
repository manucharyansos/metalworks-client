<template>
  <div>
    <header-layout class="page-header">
      <template #searchInput>
        <input-with-icon
          v-model="searchQuery"
          type="text"
          placeholder="Փնտրել"
          label_class="mb-2 text-sm font-medium text-gray-900 sr-only"
          label="Փնտրել"
        >
          <template #label_svg>
            <svg
              class="w-5 h-5 text-gray-900 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="white"
              viewBox="0 0 24 24"
              :class="{ isActiveInputStyle: openSearchInput }"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </template>
        </input-with-icon>
      </template>
    </header-layout>
    <div class="grid grid-cols-2 min-h-screen w-full">
      <!-- Sidebar -->
      <div
        class="fixed top-0 left-0 w-1/5 h-screen border-r-2 border-gray-200 pt-24 bg-white z-0"
      >
        <h1 class="flex flex-col font-sans italic text-xl text-center mb-12">
          ՆՅՈՒԹԵՐԻ ԽՄԲԵՐ
        </h1>
        <div
          v-for="(materialType, index) in materialsType"
          :key="materialType.id"
          class="flex flex-col items-start justify-start font-sans italic relative"
        >
          <!-- Material Type Button -->
          <button
            class="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none"
            @click="toggleTypeDrover(index)"
          >
            {{ materialType.name }} {{ materialType?.categories.length }}
          </button>
          <!-- Dropdown Content -->
          <transition
            name="slide-down"
            @before-enter="beforeEnter"
            @enter="enter"
            @leave="leave"
          >
            <div
              v-if="openTypeIndex === index"
              class="w-full space-y-4 top-full left-0 bg-white p-4 rounded-lg shadow-lg z-10"
            >
              <ul>
                <li
                  v-for="category in materialType.categories"
                  :key="category.id"
                  class="text-sm text-gray-600"
                >
                  <button
                    class="w-full mx-4 my-1 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none"
                    @click="filterMaterialsByCategory(category)"
                  >
                    {{ category.name }}
                  </button>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>

      <!-- Content Section -->
      <div class="w-full ml-[40%] mt-12 p-8">
        <h2 class="text-2xl font-bold mb-4">
          Բարի Գալուստ Ապրանքների Էջ
        </h2>
        <p class="text-gray-600">
          Ընտրեք ապրանքային խումբը ձախ մենյուից՝ մանրամասն տեղեկատվություն
          ստանալու համար։
        </p>
        <div
          v-if="filteredMaterials"
          class="flex flex-row flex-wrap items-center justify-start gap-4"
        >
          <div
            v-for="material in filteredMaterials"
            :key="material.id"
            class="flex flex-col items-start border border-neutral-300"
          >
            <div class="border-2 p-2 w-60">
              <h3>{{ material.name }}</h3>
              <img
                :src="`http://localhost:8000/storage/${material.image}`"
                alt="Material Image"
                class="w-full h-32 object-cover"
              />
              <p>Size: {{ formatNumber(material.width) }}*{{ formatNumber(material.height) }}*{{ formatNumber(material.thickness)}}</p>
              <p>Description: {{ material.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import HeaderLayout from '~/components/layouts/Header-layout.vue'
import InputWithIcon from '~/components/form/InputWithIcon.vue'

export default {
  components: { InputWithIcon, HeaderLayout },
  data() {
    return {
      openTypeIndex: null,
      selectedCategory: null,
      searchQuery: '',
      allMaterials: [],
    }
  },
  computed: {
    ...mapGetters('categories', ['allMaterialGroups']),
    materialsType() {
      return this.allMaterialGroups || []
    },
    filteredMaterials() {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return this.allMaterials.filter((material) => {
          const width = material.width ? String(material.width).toLowerCase() : '';
          const height = material.height ? String(material.height).toLowerCase() : '';
          return width.includes(query) || height.includes(query);
        });
      }

      if (this.selectedCategory) {
        return this.selectedCategory.materials || [];
      }

      return this.allMaterials || [];
    },

  },
  async mounted() {
    await this.fetchMaterialGroups()
    this.allMaterials = this.getAllMaterials()
  },
  methods: {
    ...mapActions('categories', ['fetchMaterialGroups']),
    toggleTypeDrover(index) {
      this.openTypeIndex = this.openTypeIndex === index ? null : index
    },
    formatNumber(value) {
      if (value === 0) return 0
      if (!value) return ''
      value = Number(value)
      if (isNaN(value)) return ''
      return value % 1 === 0 ? parseInt(value, 10) : parseFloat(value.toFixed(2))
    },
    filterMaterialsByCategory(category) {
      this.selectedCategory = category
      this.searchQuery = ''
    },
    getAllMaterials() {
      return this.allMaterialGroups.flatMap((type) =>
        type.categories.flatMap((category) => category.materials || [])
      )
    },
    beforeEnter(el) {
      el.style.height = 0
      el.style.opacity = 0
    },
    enter(el) {
      el.style.transition = 'height 0.5s ease-out, opacity 1s ease-out'
      el.style.height = `${el.scrollHeight}px`
      el.style.opacity = 1
    },
    leave(el) {
      el.style.transition = 'height 0.3s ease-in, opacity 0.2s ease-in'
      el.style.height = 0
      el.style.opacity = 0
    },
  },
}
</script>

<style scoped>
/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
