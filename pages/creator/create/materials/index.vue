<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-800 overflow-y-auto">
    <header-component class="ml-auto bg-transparent mb-8" />
    <div class="flex flex-col items-center py-12 px-12 mt-24">
      <p class="text-gray-800 dark:text-white font-bold italic mb-8 text-2xl">
        Նոր նյութի ստեղծում
      </p>
      <div class="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <select-with-label
          v-model="selectedOption"
          class="shadow-md rounded-lg p-3"
          :dates="categories"
          label="Ընտրել բաժինը"
        ></select-with-label>
        <input-with-labels
          id="name"
          v-model="materials.name"
          label="Անուն"
          type="text"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="size"
          v-model="materials.size"
          label="Չափս"
          type="number"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="price"
          v-model="materials.price"
          type="number"
          label="Արժեք"
          class="shadow-md rounded-lg p-3"
        ></input-with-labels>
        <input-with-labels
          id="image"
          type="file"
          class="shadow-md rounded-lg p-3"
          @change="handleFileUpload"
        />
      </div>
      <textarea-with-label
        id="description"
        v-model="materials.description"
        label="Նկարագրություն"
        type="text"
        class="shadow-md rounded-lg p-3 w-full my-6"
      ></textarea-with-label>
      <button
        class="mt-10 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="addNewMaterial"
      >
        Ստեղծել նոր նյութ
      </button>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import HeaderComponent from '~/components/header/HeaderComponent.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  components: {
    TextareaWithLabel,
    SelectWithLabel,
    InputWithLabels,
    HeaderComponent,
  },
  layout: 'creatorLayout',
  middleware: 'creator',
  data() {
    return {
      selectedOption: null,
      materials: {
        name: '',
        description: '',
        size: '',
        image: null,
        price: '',
      },
    }
  },
  computed: {
    ...mapGetters('categories', ['allCategories']),
    categories() {
      return this.allCategories
    },
  },
  mounted() {
    this.fetchCategories()
  },
  methods: {
    ...mapActions('categories', ['fetchCategories']),
    ...mapActions('materials', ['createMaterials']),
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.materials.image = file
        console.log('File selected:', file)
      } else {
        this.materials.image = null
      }
    },
    addNewMaterial() {
      const formData = new FormData()
      if (!this.selectedOption) {
        alert('Please select a category first')
        return
      }

      formData.append('category_id', this.selectedOption.id)
      formData.append('name', this.materials.name)
      formData.append('size', this.materials.size)
      formData.append('description', this.materials.description)
      formData.append('price', this.materials.price)

      if (this.materials.image) {
        formData.append('image', this.materials.image)
      } else {
        alert('Please upload an image')
        return
      }

      this.createMaterials(formData)
    },
  },
}
</script>
