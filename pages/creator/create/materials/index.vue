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
              v-model="materials.name"
              label="Անվանում"
              type="text"
              class="w-full"
            />
            <input-with-label-icon
              v-model="materials.description"
              label="Նկարագրություն"
              type="text"
              class="w-full"
            />
            <input-with-label-icon
              v-model="materials.size"
              label="Չափ"
              type="text"
              class="w-full"
            />
            <input
              type="file"
              class="w-full"
              @change="handleFileUpload"
            />
            <input-with-label-icon
              v-model="materials.price"
              label="Արժեք"
              type="text"
              class="w-full"
            />
            <button
              class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
              @click="addNewMaterial"
            >
              Ավելացնել
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
      isOpenMaterialCategoriesDrover: false,
      isOpenMaterial: false,
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
    toggleTypeDrover() {
      this.isOpenTypeDrover = !this.isOpenTypeDrover;
      this.isOpenMaterialCategoriesDrover = false;
      this.isOpenMaterial = false;
    },
    toggleCategoryDrover() {
      this.isOpenMaterialCategoriesDrover = !this.isOpenMaterialCategoriesDrover;
      this.isOpenTypeDrover = false;
      this.isOpenMaterial = false;
    },
    toggleMaterialDrover() {
      this.isOpenMaterial = !this.isOpenMaterial;
      this.isOpenTypeDrover = false;
      this.isOpenMaterialCategoriesDrover = false;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.$notify({
            text: 'Please upload a valid image file.',
            type: 'error',
          });
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          this.$notify({
            text: 'File size is too large. Please upload a file smaller than 5MB.',
            type: 'error',
          });
          return;
        }
        this.materials.image = file;
      } else {
        this.materials.image = null;
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
        };
        this.createMaterialsCategories(categoryData);
        this.materialCategories = '';
        this.selectedType = null;
      } else {
        this.$notify({
          text: 'Both the category and material type are required.',
          type: 'error',
          duration: 3000,
          position: 'top',
        });
      }
    },
    async addNewMaterial() {
      if (!this.selectedMaterialCategory || !this.materials.name || !this.materials.price) {
        this.$notify({
          text: 'All fields must be filled in.',
          type: 'error',
          position: 'top',
          duration: 3000,
        });
        return;
      }

      const formData = new FormData();
      formData.append('material_category_id', this.selectedMaterialCategory.id);
      formData.append('name', this.materials.name);
      formData.append('size', this.materials.size);
      formData.append('description', this.materials.description);
      formData.append('price', this.materials.price);
      if (this.materials.image) formData.append('image', this.materials.image);
      else return alert('Please upload an image');

      try {
        await this.createMaterials(formData);
        this.$notify({
          text: 'Material successfully added.',
          type: 'success',
          position: 'top',
        });
      } catch (error) {
        this.$notify({
          text: error.response?.data || error.message,
          type: 'error',
          position: 'top',
        });
      }
    },
    beforeEnter(el) {
      el.style.height = 0;
      el.style.opacity = 0;
    },
    enter(el, done) {
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;
      el.style.transition = "height 0.3s ease-out, opacity 0.3s ease-out";
      el.style.height = `${el.scrollHeight}px`;
      el.style.opacity = 1;
      done();
    },
    leave(el, done) {
      el.style.transition = "height 0.5s ease-in, opacity 0.5s ease-in";
      el.style.height = 0;
      el.style.opacity = 0;
      done();
    }
  },
}
</script>
<style scoped>

</style>
