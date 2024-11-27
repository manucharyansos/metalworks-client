<template>
  <div
    class="w-full min-h-screen bg-gray-100 dark:bg-gray-800 flex flex-col items-center py-12 px-6"
  >
    <p
      class="text-gray-800 dark:text-white font-bold italic mb-8 text-2xl text-center"
    >
      Նոր նյութի ստեղծում
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Նոր տեսակ -->
        <div
          class="bg-neutral-50 dark:bg-gray-700 rounded-xl p-6 shadow-md flex flex-col items-center space-y-4 relative"
        >
          <template v-if="!isOpenMaterialCategoriesDrover || !isOpenMaterial">
            <button
              class="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-800 transition-colors"
              @click="isOpenTypeDrover = !isOpenTypeDrover"
            >
              Նոր տեսակ
            </button>
            <transition name="slide-down">
              <div
                v-if="isOpenTypeDrover"
                class="w-full space-y-4 absolute top-full left-0 bg-white p-4 rounded-lg shadow-lg"
              >
                <input-with-label-icon
                  v-model="materialType"
                  class="w-full"
                  label="Տեսակ"
                  type="text"
                />
                <button
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                  @click="addNewType"
                >
                  Ավելացնել
                </button>
              </div>
            </transition>
          </template>
          <template v-else>
            <select-with-label
              v-model="selectedType"
              :dates="materialsType"
              class="w-full"
            />
          </template>
        </div>

        <!-- Նոր Կատեգորիա -->

        <div
          class="bg-neutral-50 dark:bg-gray-700 rounded-xl p-6 shadow-md flex flex-col items-center space-y-4 relative"
        >
          <template v-if="!isOpenMaterial">
            <button
              class="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-800 transition-colors"
              @click="
                isOpenMaterialCategoriesDrover = !isOpenMaterialCategoriesDrover
              "
            >
              Նոր Կատեգորիա
            </button>
            <transition name="slide-down">
              <div
                v-if="isOpenMaterialCategoriesDrover"
                class="w-full space-y-4 absolute top-full left-0 bg-white p-4 rounded-lg shadow-lg"
              >
                <input-with-label-icon
                  v-model="materialCategories"
                  class="w-full"
                  label="Կատեգորիա"
                  type="text"
                />
                <button
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                  @click="addNewCategory"
                >
                  Ավելացնել
                </button>
              </div>
            </transition>
          </template>
          <template v-else>
            <select-with-label
              v-model="selectedMaterialCategory"
              :dates="filteredCategories"
              class="w-full"
            />
          </template>
        </div>
      </div>

      <!-- Նոր Նյութ -->
      <div
        class="bg-neutral-50 dark:bg-gray-700 rounded-xl p-6 shadow-md flex flex-col items-center space-y-4 relative"
      >
        <button
          class="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-800 transition-colors"
          @click="openMaterialCategoriesDrover"
        >
          Նոր Նյութ
        </button>
        <transition name="slide-down">
          <div
            v-if="isOpenMaterial"
            class="w-full space-y-4 absolute top-full left-0 bg-white p-4 rounded-lg shadow-lg"
          >
            <input-with-label-icon
              v-model="materials.name"
              label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              classes="block px-2.5 py-5 mt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              label="Անվանում"
              type="text"
            />
            <input-with-label-icon
              v-model="materials.description"
              label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              classes="block px-2.5 py-5 mt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              label="Նկարագրություն"
              type="text"
            />
            <input-with-label-icon
              v-model="materials.size"
              label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              classes="block px-2.5 py-5 mt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              label="Չափ"
              type="text"
            />
            <input
              type="file"
              accept="image/png, image/jpeg"
              class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              @change="handleFileUpload($event)"
            />
            <input-with-label-icon
              v-model="materials.price"
              label="Արժեք"
              type="text"
              label_class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-3 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              classes="block px-2.5 py-5 mt-4 w-full text-sm text-gray-900 bg-transparent border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <button
              class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="addNewMaterial"
            >
              Ավելացնել
            </button>
          </div></transition
        >
      </div>
    </div>

    <!-- Notification -->
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'

export default {
  components: { SelectWithLabel, InputWithLabelIcon },
  layout: 'creatorLayout',
  middleware: ['creator', 'roleRedirect'],
  data() {
    return {
      selectedOption: null,
      materialType: '',
      materialCategories: '',
      selectedType: null,
      selectedMaterialCategory: null,
      materials: {
        name: '',
        description: '',
        size: '',
        image: null,
        price: '',
      },
      isOpenTypeDrover: false,
      isOpenMaterial: false,
      isOpenMaterialCategoriesDrover: false,
    }
  },
  computed: {
    ...mapGetters('categories', ['allMaterialTypes', 'allMaterialCategories']),
    materialsType() {
      return this.allMaterialTypes
    },
    materialsCategories() {
      return this.allMaterialCategories
    },
    filteredCategories() {
      if (!this.selectedType) {
        return this.materialsCategories
      }
      return this.materialsCategories.filter(
        (category) => category.material_type_id === this.selectedType.id
      )
    },
  },
  mounted() {
    this.fetchMaterialTypes()
    this.fetchMaterialCategories()
  },
  methods: {
    ...mapActions('categories', [
      'fetchMaterialTypes',
      'createMaterialsType',
      'createMaterialsCategories',
      'fetchMaterialCategories',
    ]),
    ...mapActions('materials', ['createMaterials']),
    openMaterialCategoriesDrover() {
      this.isOpenMaterial = !this.isOpenMaterial
      this.isOpenMaterialCategoriesDrover = !this.isOpenMaterialCategoriesDrover
      this.isOpenTypeDrover = !this.isOpenTypeDrover
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.materials.image = file
      } else {
        this.materials.image = null
      }
    },

    addNewType() {
      this.createMaterialsType({ name: this.materialType })
      this.materialType = ''
      this.isOpenTypeDrover = false
    },
    addNewCategory() {
      if (this.materialCategories !== '' && this.selectedType) {
        const categoryData = {
          name: this.materialCategories,
          material_type_id: this.selectedType.id,
        }
        this.createMaterialsCategories(categoryData)
      } else {
        this.$notify({
          text: 'Բոլոր դաշտերը պարտադիր են: ',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
    async addNewMaterial() {
      const formData = new FormData()
      formData.append('material_category_id', this.selectedMaterialCategory?.id)
      formData.append('name', this.materials.name)
      formData.append('size', this.materials.size)
      formData.append('description', this.materials.description)
      formData.append('price', this.materials.price)
      if (this.materials.image) formData.append('image', this.materials.image)
      else return alert('Please upload an image')

      try {
        await this.createMaterials(formData)
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Error creating material',
          text: error.response?.data || error.message,
        })
      }
    },
  },
}
</script>
<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 200px; /* Կարող եք փոխել ըստ բովանդակության բարձրության */
  opacity: 1;
}
</style>
