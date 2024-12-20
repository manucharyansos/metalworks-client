<template>
  <div class="bg-neutral-100 flex items-center justify-center w-full h-full">
    <template v-if="users && users.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12">
        <div
          class="w-full h-full ml-auto mr-4 p-6 bg-white rounded-xl shadow-lg"
        >
          <select-with-label
            v-model="selectedClient"
            :dates="users"
            label="Ընտրել հաճախորդ"
          ></select-with-label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            <input-with-labels
              id="name"
              :value="selectedClient?.name"
              label="Անուն"
              type="text"
              :disabled="true"
              class="shadow-md rounded-lg p-5"
            ></input-with-labels>
            <input-with-labels
              id="name"
              :value="selectedClient?.client?.phone"
              label="Հեռախոսահամար"
              type="text"
              :disabled="true"
              class="shadow-md rounded-lg p-5"
            ></input-with-labels>
            <input-with-labels
              id="name"
              :value="selectedClient?.email"
              label="Էլ․ փոստ"
              type="text"
              :disabled="true"
              class="shadow-md rounded-lg p-5"
            ></input-with-labels>
            <input-with-labels
              id="name"
              :value="selectedClient?.client?.address"
              label="Հասցե"
              type="text"
              class="shadow-md rounded-lg p-5"
              :disabled="true"
            ></input-with-labels>
          </div>
        </div>
        <div class="w-full">
          <create-order @addButton="addTask">
            <template #detailsType>
              <input-with-labels
                id="name"
                v-model="order.name"
                label="Անուն"
                type="text"
                class="shadow-md rounded-lg p-3"
                :class="{ 'border-red-500': !order.name && formSubmitted }"
                required
              ></input-with-labels>
            </template>

            <template #detailsQuantity>
              <input-with-labels
                id="quantity"
                v-model="order.quantity"
                label="Քանակ"
                type="number"
                class="shadow-md rounded-lg p-3"
                :class="{ 'border-red-500': !order.quantity && formSubmitted }"
                required
              ></input-with-labels>
            </template>

            <template #uploadFile>
              <div class="my-2">
                <input
                  type="file"
                  multiple
                  required
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-200 hover:file:bg-gray-300"
                  @change="handleFileUpload"
                />
              </div>
            </template>

            <template #detailsDesc>
              <textarea-with-label
                v-model="order.description"
                placeholder="Description"
                class="w-full my-2 p-3 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600"
                :class="{
                  'border-red-500': !order.description && formSubmitted,
                }"
                required
              ></textarea-with-label>
            </template>
          </create-order>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center justify-center w-full h-screen">
        <spinner-component />
      </div>
    </template>

    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import CreateOrder from '~/components/modals/create/CreateOrder.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import SpinnerComponent from '~/components/spinner/index.vue'

export default {
  components: {
    SpinnerComponent,
    SelectWithLabel,
    InputWithLabels,
    TextareaWithLabel,
    CreateOrder,
  },
  layout: 'creatorLayout',
  middleware: ['creator', 'roleRedirect'],
  data() {
    return {
      selectedClient: null,
      openTaskDrawer: false,
      openOrderDrawer: false,
      selectedFiles: [],
      order: {
        order_number: '',
        description: '',
        quantity: '',
        name: '',
        store_link: {
          url: '',
        },
      },
      scrollX: 0,
      clientId: null,
      formSubmitted: false,
    }
  },
  computed: {
    ...mapGetters('users', ['getUsers']),
    users() {
      return this.getUsers
    },
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    ...mapActions('orders', ['createOrder']),
    ...mapActions('users', ['fetchUsers']),
    handleFileUpload(event) {
      const allowedExtensions = [
        'pdf',
        'png',
        'jpeg',
        'jpg',
        'eps',
        'step',
        'sldprt',
        'sldasm',
        'dxf',
      ]
      const selectedFiles = event.target.files
      this.selectedFiles = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileExtension = file.name.split('.').pop().toLowerCase()
        if (allowedExtensions.includes(fileExtension)) {
          this.selectedFiles.push(file)
        } else {
          this.$notify({
            text: `File type not allowed: ${file.name}`,
            duration: 3000,
            speed: 1000,
            position: 'top',
            type: 'error',
          })
        }
      }
    },

    async addTask() {
      this.formSubmitted = true // Set formSubmitted to true to show feedback

      if (!this.selectedClient) {
        this.$notify({
          text: 'Հաճախորդի ընտրությունը պարտադիր է',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }

      if (!this.order.name || !this.order.quantity || !this.order.description) {
        this.$notify({
          text: 'Անունը, Քանակը, և Պատմականությունը պարտադիր են',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }

      const formData = new FormData()
      formData.append('user_id', this.selectedClient.id)
      formData.append('store_link[url]', this.order.store_link.url)
      formData.append('name', this.order.name)
      formData.append('quantity', this.order.quantity)
      formData.append('description', this.order.description)

      if (this.selectedFiles.length > 0) {
        this.selectedFiles.forEach((file, index) => {
          formData.append(`files[${index}]`, file)
        })
      }

      try {
        await this.createOrder(formData)
      } catch (error) {
        this.$notify({
          text: error.response.data.message || 'An error occurred.',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      }
    },
  },
}
</script>

<style scoped></style>
