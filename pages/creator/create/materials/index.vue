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
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <!-- Նոր տեսակ -->
        <div
          class="bg-neutral-50 dark:bg-gray-700 rounded-xl p-6 shadow-md flex flex-col items-center space-y-4 relative"
        >
          <template v-if="!isOpenMaterial && !isOpenMaterialCategoriesDrover">
            <button
              class="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-800 transition-colors"
              @click="toggleTypeDrover"
            >
              Նոր տեսակ
            </button>
            <transition name="slide-down">
              <div
                v-if="isOpenTypeDrover"
                class="w-full space-y-4 absolute top-full left-0 bg-white p-4 rounded-lg shadow-lg z-10"
              >
                <input-with-label-icon
                  v-model="materialType"
                  class="w-full"
                  label="Տեսակ"
                  type="text"
                />
                <button
                  v-if="!typeLoading"
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                  @click="addNewType"
                >
                  Ավելացնել
                </button>
                <button
                  v-else
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    role="status"
                    class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="#1C64F2"
                    />
                  </svg>
                  Բեռնվում է...
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
              @click="toggleCategoryDrover"
            >
              Նոր Կատեգորիա
            </button>
            <transition name="slide-down">
              <div
                v-if="isOpenMaterialCategoriesDrover"
                class="w-full space-y-4 absolute top-full left-0 bg-white p-4 rounded-lg shadow-lg z-10"
              >
                <input-with-label-icon
                  v-model="categories.name"
                  class="w-full"
                  label="Կատեգորիա"
                  type="text"
                />
                <input
                  type="file"
                  class="w-full"
                  @change="handleFileUploadCategoryImage"
                />
                <button
                  v-if="!categoryLoading"
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                  @click="addNewCategory"
                >
                  Ավելացնել
                </button>
                <button
                  v-else
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    role="status"
                    class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="#1C64F2"
                    />
                  </svg>
                  Բեռնվում է...
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
          @click="toggleMaterialDrover"
        >
          Նոր Նյութ
        </button>
        <transition name="slide-down">
          <div
            v-if="isOpenMaterial"
            class="w-full space-y-4 absolute top-full left-0 bg-white p-4 rounded-lg shadow-lg z-10"
          >
            <input-with-label-icon
              v-model="materials.description"
              label="Նկարագրություն"
              type="text"
              class="w-full"
            />
            <input-with-label-icon
              v-model="materials.width"
              label="Լայնություն"
              type="number"
              class="w-full"
            />
            <input-with-label-icon
              v-model="materials.height"
              label="Բարձրություն"
              type="number"
              class="w-full"
            />
            <input-with-label-icon
              v-model="materials.length"
              label="Երկարություն"
              type="number"
              class="w-full"
            />
            <input-with-label-icon
              v-model="materials.thickness"
              label="Հաստություն"
              type="number"
              class="w-full"
            />
            <input type="file" class="w-full" @change="handleFileUpload" />
            <button
              v-if="!materialLoading"
              class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="addNewMaterial"
            >
              Ավելացնել
            </button>
            <button
              v-else
              class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg
                aria-hidden="true"
                role="status"
                class="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="#1C64F2"
                />
              </svg>
              Բեռնվում է...
            </button>
          </div>
        </transition>
      </div>
    </div>

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
      materialType: '',
      categories: {
        name: '',
        image: null,
      },
      materialCategories: '',
      selectedType: null,
      selectedMaterialCategory: null,
      selectedCategoryByType: null,
      materials: {
        name: '',
        description: '',
        size: '',
        image: null,
        width: '',
        height: '',
        length: '',
        thickness: '',
      },
      isOpenTypeDrover: false,
      isOpenMaterialCategoriesDrover: false,
      isOpenMaterial: false,
      typeLoading: false,
      categoryLoading: false,
      materialLoading: false,
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
      return this.selectedType.categories
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
    toggleTypeDrover() {
      this.isOpenTypeDrover = !this.isOpenTypeDrover
      this.isOpenMaterialCategoriesDrover = false
      this.isOpenMaterial = false
    },
    toggleCategoryDrover() {
      this.isOpenMaterialCategoriesDrover = !this.isOpenMaterialCategoriesDrover
      this.isOpenTypeDrover = false
      this.isOpenMaterial = false
    },
    toggleMaterialDrover() {
      this.isOpenMaterial = !this.isOpenMaterial
      this.isOpenTypeDrover = false
      this.isOpenMaterialCategoriesDrover = false
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.$notify({
            text: 'Please upload a valid image file.',
            type: 'error',
          })
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          this.$notify({
            text: 'File size is too large. Please upload a file smaller than 5MB.',
            type: 'error',
          })
          return
        }
        this.materials.image = file
      } else {
        this.materials.image = null
      }
    },
    handleFileUploadCategoryImage(event) {
      const file = event.target.files[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.$notify({
            text: 'Please upload a valid image file.',
            type: 'error',
          })
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          this.$notify({
            text: 'File size is too large. Please upload a file smaller than 5MB.',
            type: 'error',
          })
          return
        }
        this.categories.image = file
      } else {
        this.categories.image = null
      }
    },

    async addNewType() {
      this.typeLoading = true
      if (this.materialsType !== '') {
        const response = await this.createMaterialsType({
          name: this.materialType,
        })
        if (response) {
          this.materialType = ''
          this.isOpenTypeDrover = false
          await this.fetchMaterialTypes()
          this.$notify({
            text: 'Հաջողությամբ ավելացել է',
            type: 'success',
            duration: 3000,
            position: 'top',
          })
          this.typeLoading = false
        }
      } else {
        this.$notify({
          text: 'Տեղի է ունեցել սխսլ',
          type: 'error',
          duration: 3000,
          position: 'top',
        })
      }
    },
    async addNewCategory() {
      this.categoryLoading = true
      if (this.categories.name !== '' && this.selectedType) {
        const formData = new FormData()
        formData.append('name', this.categories.name)
        formData.append('material_type_id', this.selectedType.id)
        if (this.materials.image)
          formData.append('image', this.categories.image)
        this.$notify({
          text: 'Please upload an image',
          type: 'error',
          position: 'top',
        })
        const response = await this.createMaterialsCategories(formData)
        if (response) {
          this.categories.name = ''
          this.categories.image = ''
          this.selectedType = null
          await this.fetchMaterialTypes()
          await this.fetchMaterialCategories()
          this.$notify({
            text: 'Հաջողությամբ ավելացել է',
            type: 'success',
            duration: 3000,
            position: 'top',
          })
          this.categoryLoading = false
        }
      } else {
        this.$notify({
          text: 'Both the category and material type are required.',
          type: 'error',
          duration: 3000,
          position: 'top',
        })
      }
    },
    async addNewMaterial() {
      this.materialLoading = true
      if (
        !this.selectedMaterialCategory ||
        !this.materials.width ||
        !this.materials.length ||
        !this.materials.height ||
        !this.materials.thickness
      ) {
        this.$notify({
          text: 'All fields must be filled in.',
          type: 'error',
          position: 'top',
          duration: 3000,
        })
        return
      }
      const formData = new FormData()
      formData.append('material_category_id', this.selectedMaterialCategory.id)
      formData.append('width', this.materials.width)
      formData.append('length', this.materials.length)
      formData.append('height', this.materials.height)
      formData.append('thickness', this.materials.thickness)
      formData.append('description', this.materials.description)
      if (this.materials.image) formData.append('image', this.materials.image)
      this.$notify({
        text: 'Please upload an image',
        type: 'error',
        position: 'top',
      })
      try {
        const response = await this.createMaterials(formData)
        if (response) {
          this.$notify({
            text: 'Material successfully added.',
            type: 'success',
            position: 'top',
          })
          this.materials.width = ''
          this.materials.length = ''
          this.materials.height = ''
          this.materials.thickness = ''
          this.materials.image = null
          this.materials.description = ''
          this.materialLoading = false
        }
      } catch (error) {
        this.$notify({
          text: error.response?.data || error.message,
          type: 'error',
          position: 'top',
        })
      }
    },
    beforeEnter(el) {
      el.style.height = 0
      el.style.opacity = 0
    },
    enter(el, done) {
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight
      el.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out'
      el.style.height = `${el.scrollHeight}px`
      el.style.opacity = 1
      done()
    },
    leave(el, done) {
      el.style.transition = 'height 0.5s ease-in, opacity 0.5s ease-in'
      el.style.height = 0
      el.style.opacity = 0
      done()
    },
  },
}
</script>
<style scoped></style>
