<template>
  <div
    class="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
  >
    <h1
      class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6"
    >
      Ստեղծել Նոր Ապրանք
    </h1>
    <form class="space-y-4 sm:space-y-6" @submit.prevent="submitForm">
      <!-- Name -->
      <div>
        <label
          for="name"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Անուն</label
        >
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          :class="{ 'border-red-500': errors.name }"
          placeholder="Մուտքագրեք ապրանքի անունը"
        />
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">
          {{ errors.name }}
        </p>
      </div>

      <!-- Description -->
      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Նկարագրություն</label
        >
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          :class="{ 'border-red-500': errors.description }"
          placeholder="Մուտքագրեք ապրանքի նկարագրությունը"
        ></textarea>
        <p v-if="errors.description" class="mt-1 text-sm text-red-600">
          {{ errors.description }}
        </p>
      </div>

      <!-- Price -->
      <div>
        <label
          for="price"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Արժեք (դրամ)</label
        >
        <input
          id="price"
          v-model.number="form.price"
          type="number"
          min="0"
          step="1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          :class="{ 'border-red-500': errors.price }"
          placeholder="Մուտքագրեք ապրանքի արժեքը"
        />
        <p v-if="errors.price" class="mt-1 text-sm text-red-600">
          {{ errors.price }}
        </p>
      </div>

      <!-- Main Image -->
      <div>
        <label
          for="image"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Հիմնական Պատկեր</label
        >
        <input
          id="image"
          type="file"
          accept="image/*"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
          @change="handleImageUpload"
        />
        <p v-if="errors.image" class="mt-1 text-sm text-red-600">
          {{ errors.image }}
        </p>
        <div v-if="imagePreview" class="mt-4 flex justify-center">
          <img
            :src="imagePreview"
            alt="Image Preview"
            class="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>
      </div>

      <!-- Gallery Images -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Գալերեայի Պատկերներ</label
        >
        <div class="mt-1 flex flex-wrap gap-2">
          <div
            v-for="(preview, index) in galleryPreviews"
            :key="index"
            class="relative group"
          >
            <img
              :src="preview"
              :alt="`Gallery image ${index + 1}`"
              class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
            <button
              type="button"
              @click="removeGalleryImage(index)"
              class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </div>
          <label
            for="gallery"
            class="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
          >
            <span class="text-gray-400 dark:text-gray-500 text-2xl">+</span>
            <input
              id="gallery"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleGalleryUpload"
            />
          </label>
        </div>
        <p v-if="errors.gallery" class="mt-1 text-sm text-red-600">
          {{ errors.gallery }}
        </p>
      </div>

      <!-- Submit Button -->
      <div
        class="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 pt-4"
      >
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="$router.push('/manager/products')"
        >
          Չեղարկել
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-blue-300"
        >
          {{ isSubmitting ? 'Հաշվարկվում է...' : 'Ստեղծել' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'CreateProduct',
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      form: {
        name: '',
        description: '',
        price: null,
        image: null,
        gallery: [],
      },
      imagePreview: null,
      galleryPreviews: [],
      errors: {},
      isSubmitting: false,
    }
  },
  methods: {
    ...mapActions('products', ['createProduct']),
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        if (!file.type.match('image.*')) {
          this.errors.image = 'Ընտրված ֆայլը պատկեր չէ'
          return
        }
        if (file.size > 2 * 1024 * 1024) {
          this.errors.image = 'Պատկերը չպետք է գերազանցի 2MB'
          return
        }

        this.form.image = file
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
        this.errors.image = null
      } else {
        this.form.image = null
        this.imagePreview = null
      }
    },
    handleGalleryUpload(event) {
      const files = Array.from(event.target.files)
      if (files.length + this.form.gallery.length > 5) {
        this.errors.gallery = 'Դուք կարող եք ավելացնել առավելագույնը 5 պատկեր'
        return
      }

      files.forEach((file) => {
        if (!file.type.match('image.*')) {
          this.errors.gallery = 'Ընտրված ֆայլերից մեկը պատկեր չէ'
          return
        }
        if (file.size > 2 * 1024 * 1024) {
          this.errors.gallery = 'Պատկերները չպետք է գերազանցեն 2MB'
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          this.galleryPreviews.push(e.target.result)
          this.form.gallery.push(file)
        }
        reader.readAsDataURL(file)
      })

      if (this.galleryPreviews.length <= 5) {
        this.errors.gallery = null
      }
    },
    removeGalleryImage(index) {
      this.galleryPreviews.splice(index, 1)
      this.form.gallery.splice(index, 1)
      if (this.galleryPreviews.length < 5) {
        this.errors.gallery = null
      }
    },
    validateForm() {
      this.errors = {}
      let isValid = true

      if (!this.form.name.trim()) {
        this.errors.name = 'Անունը պարտադիր է'
        isValid = false
      }

      if (!this.form.description.trim()) {
        this.errors.description = 'Նկարագրությունը պարտադիր է'
        isValid = false
      }

      if (!this.form.price || this.form.price < 0) {
        this.errors.price = 'Արժեքը պետք է լինի 0 կամ ավելի'
        isValid = false
      }

      if (!this.form.image) {
        this.errors.image = 'Հիմնական պատկերը պարտադիր է'
        isValid = false
      }

      if (this.form.gallery.length > 5) {
        this.errors.gallery = 'Դուք կարող եք ավելացնել առավելագույնը 5 պատկեր'
        isValid = false
      }

      return isValid
    },
    async submitForm() {
      if (!this.validateForm()) return

      this.isSubmitting = true
      try {
        const formData = new FormData()
        formData.append('name', this.form.name)
        formData.append('description', this.form.description)
        formData.append('price', this.form.price)
        formData.append('image', this.form.image)

        this.form.gallery.forEach((file, index) => {
          formData.append(`gallery[${index}]`, file)
        })

        await this.createProduct(formData)
        this.$router.push('/manager/products')
        this.$toast.success('Ապրանքը հաջողությամբ ստեղծվել է', {
          position: 'top-right',
          duration: 3000,
        })
      } catch (error) {
        console.error('Error creating product:', error)
        this.$toast.error('Սխալ ապրանքը ստեղծելիս', {
          position: 'top-right',
          duration: 3000,
        })
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
/* Smooth transitions for hover effects */
button,
input[type='file'] + label {
  transition: all 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .flex-wrap {
    justify-content: center;
  }
}
</style>
