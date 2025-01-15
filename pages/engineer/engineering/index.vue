<template>
  <div>
    <h1 class="text-2xl text-center font-sans italic w-full my-6">
      Ստեղծել նոր պատվեր
    </h1>
    <div>
      <label
        for="file"
        class="block text-sm font-medium text-gray-900 dark:text-white"
        >File</label
      >
      <input
        type="file"
        multiple
        class="block w-full mt-1"
        @change="handleFileUpload"
      />

      <!-- Displaying the uploaded files -->
      <div class="flex flex-col">
        <div class="flex flex-row items-start justify-between px-4">
          <div v-for="factory in getFactory" :key="factory.id">
            <h2 class="cursor-pointer" @click="selectFactoryForFiles(factory)">
              {{ factory.name }}
            </h2>
            <div v-if="factoryFiles.find((f) => f.id === factory.id)">
              <ul>
                <li
                  v-for="file in factoryFiles.find((f) => f.id === factory.id)
                    ?.files"
                  :key="file"
                  class="flex flex-row items-center justify-between my-1 hover:bg-indigo-300 px-3 py-2"
                >
                  <p class="w-32">
                    {{ file.name || file.original_name || 'Unnamed File' }}
                  </p>

                  <button @click="removeFileFromFactory(factory.id, file)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="20"
                      height="20"
                      fill="red"
                      viewBox="0 0 30 30"
                    >
                      <path
                        d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
                      ></path>
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <button class="px-3 py-1 bg-green-400 rounded-xl" @click="addFiles">
            Add files
          </button>
        </div>
      </div>
    </div>
    <notifications />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  layout: 'EngineerLayout',
  middleware: ['admin', 'roleRedirect'],
  data() {
    return {
      selectedFactory: null,
      factoryFiles: [],
    }
  },
  computed: {
    ...mapGetters('factoryFiles', ['getFactoryFiles']),
    ...mapGetters('factory', ['getFactory']),
  },
  mounted() {
    this.fetchFactory()
  },
  methods: {
    ...mapActions('factoryFiles', ['createFactoryFiles']),
    ...mapActions('factory', ['fetchFactory']),
    handleFileUpload(event) {
      const files = Array.from(event.target.files)
      if (this.selectedFactory) {
        const factory = this.factoryFiles.find(
          (f) => f.id === this.selectedFactory.id
        )
        if (factory) {
          files.forEach((file) => {
            if (!factory.files.some((f) => f.name === file.name)) {
              factory.files.push(file)
            } else {
              this.$notify({
                text: `File "${file.name}" is already added to the factory.`,
                type: 'error',
              })
            }
          })
        } else {
          this.factoryFiles.push({
            id: this.selectedFactory.id,
            name: this.selectedFactory.name,
            files,
          })
        }
      } else {
        this.$notify({
          text: 'Please select a factory first',
          type: 'error',
        })
      }
    },
    addFactory(value) {
      const factoryId = value.id
      const exists = this.stepperData.some((item) => item.id === factoryId)

      if (exists) {
        this.stepperData = this.stepperData.filter(
          (item) => item.id !== factoryId
        )
      } else {
        this.stepperData.push(value)
      }
    },
    addFileForFactory(file) {
      if (this.selectedFactory) {
        const factory = this.factoryFiles.find(
          (f) => f.id === this.selectedFactory.id
        )
        if (factory) {
          if (!factory.files.includes(file)) {
            factory.files.push(file)
          } else {
            this.$notify({
              text: 'This file is already added to the factory',
              type: 'error',
            })
          }
        } else {
          this.factoryFiles.push({
            id: this.selectedFactory.id,
            name: this.selectedFactory.name,
            files: [file],
          })
        }
      } else {
        this.$notify({
          text: 'Please select a factory first',
          type: 'error',
        })
      }
    },

    addFiles() {
      const formData = new FormData()

      let factory = this.factoryFiles.find(
        (f) => f.id === this.selectedFactory.id
      )
      if (!factory) {
        factory = {
          id: this.selectedFactory.id,
          name: this.selectedFactory.name,
          files: [],
        }
        this.factoryFiles.push(factory)
      }

      // Ավելացնում ենք ֆայլերը FormData-ում
      factory.files.forEach((file) => {
        // Երբ ֆայլը արդեն պահված է, ուղարկում ենք միայն տվյալները
        if (file.path && file.original_name) {
          formData.append('files[]', file.path) // Ուղարկում ենք ֆայլի ուղին
          formData.append('original_name[]', file.original_name) // Վերադարձնում ենք ֆայլի անունը
        } else {
          formData.append('files[]', file) // Նոր ֆայլեր ուղարկելու դեպքում
        }
      })

      // Չեմ մոռանում ավելացնել նաև factory_id և order_id
      if (formData.has('files[]')) {
        formData.append('factory_id', this.selectedFactory.id)
        formData.append('order_id', this.getOrder.id)

        // Աշխատանք API կոչի համար
        this.createFactoryFiles(formData)
      } else {
        this.$notify({
          text: 'Please add at least one file.',
          type: 'error',
        })
      }
    },

    removeFileFromFactory(factoryId, file) {
      const factory = this.factoryFiles.find((f) => f.id === factoryId)
      if (factory) {
        const fileIndex = factory.files.indexOf(file)
        if (fileIndex !== -1) {
          factory.files.splice(fileIndex, 1)
        }
      }
    },

    selectFactoryForFiles(factory) {
      if (this.selectedFactory && this.selectedFactory.id === factory.id) {
        this.selectedFactory = null
      } else {
        this.selectedFactory = factory
      }
    },
  },
}
</script>
