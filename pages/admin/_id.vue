<template>
  <div
    class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 overflow-y-auto"
  >
    <div class="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      <div
        v-if="getOrder && getFactory && !loading"
        class="transition-all duration-300 animate-fade-in"
      >
        <OrderDetail :order-id="getOrder.id">
          <!-- Name -->
          <template #name>
            <input-with-labels
              id="name"
              v-model="getOrder.name"
              label="Անուն"
              type="text"
              class="w-full rounded-lg p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              :class="{ 'border-red-500 ring-1 ring-red-500': errors.name }"
              label_class="py-2.5"
              @input="clearError('name')"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1.5">
              {{ errors.name }}
            </p>
          </template>

          <!-- Order Number -->
          <template #orderNumber>
            <input-with-labels
              id="orderNumber"
              v-model="getOrder.order_number.number"
              label="Պատվերի համարը"
              class="w-full rounded-lg p-3 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
              label_class="py-2.5"
              disabled
            />
          </template>

          <!-- Start Date -->
          <template #startDate>
            <input-with-labels
              id="startDate"
              v-model="getOrder.created_at"
              label="Ստեղծված ամսաթիվ"
              class="w-full rounded-lg p-3 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
              label_class="py-2.5"
              disabled
            />
          </template>

          <!-- Finish Date -->
          <template #finishDate>
            <input-with-labels
              id="finishDate"
              v-model="getOrder.dates.finish_date"
              label="Անհաժեշտ ավարտի ամսաթիվ"
              type="datetime-local"
              class="w-full rounded-lg p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              :class="{
                'border-red-500 ring-1 ring-red-500': errors.finish_date,
              }"
              label_class="py-2.5"
              @input="clearError('finish_date')"
            />
            <p v-if="errors.finish_date" class="text-red-500 text-sm mt-1.5">
              {{ errors.finish_date }}
            </p>
          </template>

          <!-- Description -->
          <template #description>
            <textarea-with-label
              v-model="getOrder.description"
              label="Նկարագրություն"
              placeholder="Մուտքագրեք նկարագրություն..."
              class="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              :class="{
                'border-red-500 ring-1 ring-red-500': errors.description,
              }"
              rows="5"
              @input="clearError('description')"
            />
            <p v-if="errors.description" class="text-red-500 text-sm mt-1.5">
              {{ errors.description }}
            </p>
          </template>

          <!-- Factory Status -->
          <template #factoryStatus>
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Գործարանային կարգավիճակ
              </h3>
              <div class="space-y-3">
                <div
                  v-for="factoriesStatus in getOrder.factory_orders"
                  :key="factoriesStatus.id"
                  class="rounded-xl p-4 transition-all duration-200"
                  :class="getStatusStyles(factoriesStatus.status)"
                >
                  <div
                    class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div class="space-y-1">
                      <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Գործարան</span
                      >
                      <p
                        class="text-base font-medium text-gray-900 dark:text-white"
                      >
                        {{ getFactoryName(factoriesStatus.factory_id) }} ({{
                          getFactoryValue(factoriesStatus.factory_id)
                        }})
                      </p>
                    </div>
                    <div class="space-y-1 sm:text-right">
                      <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Կարգավիճակ</span
                      >
                      <div class="flex items-center gap-2 sm:justify-end">
                        <span class="text-base font-medium">
                          {{ factoriesStatus?.status }}
                          <template v-if="factoriesStatus.canceling">
                            ({{ factoriesStatus.canceling }})
                          </template>
                        </span>
                        <span
                          v-if="
                            factoriesStatus.cancel_date ||
                            factoriesStatus.operator_finish_date
                          "
                          class="text-xs text-gray-500 dark:text-gray-400"
                        >
                          {{
                            $formatDate(
                              factoriesStatus.cancel_date ||
                                factoriesStatus.operator_finish_date
                            )
                          }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    v-if="factoriesStatus.status === 'Ավարտել'"
                    class="mt-3 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                    @click="confirmStatus(factoriesStatus)"
                  >
                    Հաստատել
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Action Buttons -->
          <template #buttons>
            <button
              type="button"
              class="inline-flex justify-center items-center gap-2 py-2.5 px-6 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
              @click="doneOrder"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ loading ? 'Բեռնվում է...' : 'Հաստատել' }}
            </button>
            <button
              type="button"
              class="inline-flex justify-center items-center gap-2 py-2.5 px-6 text-sm font-medium text-red-600 hover:text-white border border-red-600 hover:bg-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              @click="deleteOrder(getOrder.id)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Ջնջել
            </button>
          </template>
        </OrderDetail>
        <notifications />
      </div>
      <div v-else class="flex justify-center items-center h-96">
        <spinner-component class="h-12 w-12 text-blue-500" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SpinnerComponent from '~/components/spinner/index.vue'
import OrderDetail from '~/components/modals/admin/OrderDetail.vue'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'

export default {
  components: {
    TextareaWithLabel,
    InputWithLabels,
    OrderDetail,
    SpinnerComponent,
  },
  layout: 'AdminLayout',
  middleware: ['admin', 'roleRedirect'],
  data() {
    return {
      id: null,
      stepperData: [],
      selectedFactories: [],
      selectedFactory: null,
      factoryFiles: [],
      loading: false,
      errors: {},
    }
  },
  computed: {
    ...mapGetters('orders', ['order', 'errorMessage']),
    ...mapGetters('factory', ['getFactory']),
    getOrder() {
      return this.order ? JSON.parse(JSON.stringify(this.order)) : {}
    },
    factories() {
      return this.getFactory ? JSON.parse(JSON.stringify(this.getFactory)) : []
    },
  },
  async mounted() {
    this.loading = true
    try {
      await Promise.all([this.fetchOrder(this.id), this.fetchFactory()])
    } catch (error) {
      this.$notify({
        type: 'error',
        title: 'Սխալ',
        message: 'Չհաջողվեց բեռնել տվյալները',
      })
    } finally {
      this.loading = false
    }
  },
  created() {
    this.id = this.$route.params.id
  },
  methods: {
    ...mapActions('orders', ['fetchOrder', 'updateOrder', 'orderDelete']),
    ...mapActions('factory', ['fetchFactory', 'adminConfirmFactoryStatus']),
    ...mapActions('factoryFiles', ['createFactoryFiles']),

    getStatusStyles(status) {
      const baseStyles = 'border border-transparent'
      const statusStyles = {
        confirmed:
          'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-800/50',
        Հաստատել:
          'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-800/50',
        Մերժել:
          'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-100 dark:border-red-800/50',
        'Կատարման ժամկետի փոխարինում':
          'bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-100 dark:border-orange-800/50',
        Ավարտել:
          'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-300 border-green-200 dark:border-green-800/50',
        default:
          'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600/50',
      }
      return `${baseStyles} ${statusStyles[status] || statusStyles.default}`
    },

    getFactoryName(factoryId) {
      const factory = this.factories.find((f) => f.id === factoryId)
      return factory ? factory.name : 'Անհայտ գործարան'
    },

    getFactoryValue(factoryId) {
      const factory = this.factories.find((f) => f.id === factoryId)
      return factory ? factory.value : 'N/A'
    },

    clearError(field) {
      this.$set(this.errors, field, '')
    },

    validateFields() {
      this.errors = {}
      let isValid = true

      if (!this.getOrder.name?.trim()) {
        this.errors.name = 'Անուն դաշտը պարտադիր է'
        isValid = false
      }

      if (!this.getOrder.dates?.finish_date) {
        this.errors.finish_date = 'Անհաժեշտ ավարտի ամսաթիվը պարտադիր է'
        isValid = false
      }

      if (!this.getOrder.description?.trim()) {
        this.errors.description = 'Նկարագրությունը պարտադիր է'
        isValid = false
      }

      return isValid
    },

    async doneOrder() {
      if (!this.validateFields()) {
        this.$notify({
          type: 'error',
          title: 'Սխալ',
          message: 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը',
        })
        return
      }

      this.loading = true
      try {
        const payload = {
          name: this.getOrder.name,
          description: this.getOrder.description,
          status: this.getOrder.status || 'in process',
          finish_date: this.getOrder.dates.finish_date,
          factories: this.getOrder.factory_orders.map((fo) => ({
            id: fo.factory_id,
            status: fo.status || 'pending',
          })),
          store_link: this.getOrder.store_link?.url
            ? { url: this.getOrder.store_link.url }
            : null,
        }

        await this.updateOrder({ id: this.id, payload })

        this.$notify({
          type: 'success',
          title: 'Հաջողություն',
          message: 'Պատվերը հաջողությամբ թարմացվել է',
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Սխալ',
          message:
            error.response?.data?.message || 'Սխալ պատվերի թարմացման ընթացքում',
        })
      } finally {
        this.loading = false
      }
    },
    async deleteOrder(id) {
      const confirmed = confirm(
        'Դուք վստահ ե՞ք, որ ցանկանում եք ջնջել այս պատվերը'
      )
      if (!confirmed) return

      this.loading = true
      try {
        await this.orderDelete(id)
        this.$notify({
          type: 'success',
          title: 'Հաջողություն',
          message: 'Պատվերը հաջողությամբ ջնջվել է',
        })
        await this.$router.push('/admin/orders')
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Սխալ',
          message: error.message || 'Սխալ պատվերի ջնջման ընթացքում',
        })
      } finally {
        this.loading = false
      }
    },

    async confirmStatus(factoryStatus) {
      try {
        const confirmed = confirm(
          `Հաստատե՞լ ${this.getFactoryName(
            factoryStatus.factory_id
          )} գործարանի կարգավիճակի ավարտը`
        )
        if (!confirmed) return

        const confirmData = {
          id: factoryStatus.order_id,
          factory_id: factoryStatus.factory_id,
        }

        await this.adminConfirmFactoryStatus(confirmData)

        this.$notify({
          type: 'success',
          title: 'Հաջողություն',
          message: `Գործարան ${this.getFactoryName(
            factoryStatus.factory_id
          )}-ի կարգավիճակը հաստատվել է`,
        })
      } catch (error) {
        this.$notify({
          type: 'error',
          title: 'Սխալ',
          message: error.message || 'Սխալ կարգավիճակի հաստատման ընթացքում',
        })
      }
    },
  },
}
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1280px;
}

/* Smooth transitions for dark mode */
.bg-white {
  transition: background-color 0.3s ease;
}
.dark .bg-white {
  transition: background-color 0.3s ease;
}

/* Better focus states */
:focus-visible {
  outline: none;
  ring: 2px;
}

/* Fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>
