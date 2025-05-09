<template>
  <div
    class="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
  >
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
      Ստեղծել Նոր Ապրանք
    </h1>
    <form class="space-y-6" @submit.prevent="submitForm">
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
          rows="4"
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

      <!-- Image -->
      <div>
        <label
          for="image"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >Պատկեր</label
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
        <img
          v-if="imagePreview"
          :src="imagePreview"
          alt="Image Preview"
          class="mt-4 w-32 h-32 object-cover rounded-full"
        />
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4">
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
      },
      imagePreview: null,
      errors: {},
      isSubmitting: false,
    }
  },
  methods: {
    ...mapActions('products', ['createProduct']),
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.form.image = file
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        this.form.image = null
        this.imagePreview = null
      }
    },
    validateForm() {
      this.errors = {}
      if (!this.form.name.trim()) {
        this.errors.name = 'Անունը պարտադիր է'
      }
      if (!this.form.description.trim()) {
        this.errors.description = 'Նկարագրությունը պարտադիր է'
      }
      if (!this.form.price || this.form.price < 0) {
        this.errors.price = 'Արժեքը պետք է լինի 0 կամ ավելի'
      }
      return Object.keys(this.errors).length === 0
    },
    async submitForm() {
      if (!this.validateForm()) return

      this.isSubmitting = true
      try {
        const formData = new FormData()
        formData.append('name', this.form.name)
        formData.append('description', this.form.description)
        formData.append('price', this.form.price)
        if (this.form.image) {
          formData.append('image', this.form.image)
        }

        await this.createProduct(formData)
        this.$router.push('/manager/products')
      } catch (error) {
        console.error('Error creating product:', error)
        this.errors.form = 'Սխալ ապրանքը ստեղծելիս: Խնդրում ենք փորձել կրկին:'
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>
