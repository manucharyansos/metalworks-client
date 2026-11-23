<template>
  <main class="px-4 py-6 sm:px-6" data-workspace-form data-pricing-settings>
    <section class="mb-5 max-w-4xl">
      <h1
        class="text-2xl font-black tracking-tight text-slate-950 dark:text-white"
      >
        {{ t.title }}
      </h1>
      <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {{ t.lead }}
      </p>
      <p
        class="mt-2 rounded-xl bg-slate-100 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
      >
        {{ t.formula }}
      </p>
    </section>

    <div
      v-if="loadError"
      role="alert"
      class="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
    >
      {{ loadError }}
      <button type="button" class="ml-2 font-bold underline" @click="load">
        {{ t.retry }}
      </button>
    </div>
    <form
      v-else-if="state"
      class="max-w-5xl space-y-5"
      novalidate
      @submit.prevent="save"
    >
      <section class="price-card">
        <label class="flex items-center gap-3 text-sm font-bold">
          <input
            v-model="state.settings.enabled"
            type="checkbox"
            class="h-5 w-5"
            data-pricing-enabled
            @change="dirty = true"
          />
          {{ t.enabled }}
        </label>
        <h2 class="mt-5 text-sm font-black">{{ t.services }}</h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label v-for="field in fields" :key="field" class="price-field">
            <span>{{ t[field] }}</span>
            <input
              v-model="state.settings[field]"
              type="number"
              min="0"
              step="any"
              inputmode="decimal"
              class="price-control"
              :data-pricing-field="field"
              @input="dirty = true"
            />
          </label>
        </div>
        <label class="mt-3 flex items-center gap-3 text-sm">
          <input
            v-model="state.settings.vat_included"
            type="checkbox"
            class="h-4 w-4"
            @change="dirty = true"
          />{{ t.vat_included }}
        </label>
        <label class="price-field mt-3">
          <span>{{ t.customer_note }}</span>
          <textarea
            v-model="state.settings.customer_note"
            rows="2"
            maxlength="2000"
            class="price-control resize-y"
            @input="dirty = true"
          />
        </label>

        <h2 class="mt-5 text-sm font-black">{{ t.discounts }}</h2>
        <div class="mt-2 space-y-2">
          <div
            v-for="(tier, index) in state.settings.discounts"
            :key="'tier-' + index"
            class="flex flex-wrap items-end gap-2"
          >
            <label class="price-field w-40"
              ><span>{{ t.fromQty }}</span
              ><input
                v-model="tier.min_qty"
                type="number"
                min="2"
                step="1"
                class="price-control"
                @input="dirty = true"
            /></label>
            <label class="price-field w-32"
              ><span>{{ t.percent }}</span
              ><input
                v-model="tier.percent"
                type="number"
                min="0"
                max="90"
                step="0.5"
                class="price-control"
                @input="dirty = true"
            /></label>
            <button
              type="button"
              class="price-link price-link--danger"
              @click="
                state.settings.discounts.splice(index, 1)
                dirty = true
              "
            >
              {{ t.remove }}
            </button>
          </div>
          <button
            type="button"
            class="price-link"
            data-pricing-add-discount
            @click="addDiscount"
          >
            + {{ t.addDiscount }}
          </button>
        </div>
      </section>

      <section class="price-card">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-sm font-black">{{ t.materials }}</h2>
          <button
            type="button"
            class="price-link"
            data-pricing-add-material
            @click="addMaterial"
          >
            + {{ t.addMaterial }}
          </button>
        </div>
        <p v-if="!state.materials.length" class="mt-3 text-sm text-slate-500">
          {{ t.noMaterials }}
        </p>
        <div
          v-for="(material, index) in state.materials"
          :key="material.key"
          class="mt-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          :data-pricing-material="index"
        >
          <div
            class="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
          >
            <label class="price-field"
              ><span>{{ t.name }}</span
              ><input
                v-model="material.name"
                type="text"
                maxlength="120"
                class="price-control"
                data-pricing-material-name
                @input="dirty = true"
            /></label>
            <label class="price-field"
              ><span>{{ t.density }}</span
              ><input
                v-model="material.density"
                type="number"
                min="100"
                step="any"
                class="price-control"
                @input="dirty = true"
            /></label>
            <label class="price-field"
              ><span>{{ t.price_per_kg }}</span
              ><input
                v-model="material.price_per_kg"
                type="number"
                min="0"
                step="any"
                class="price-control"
                data-pricing-material-price
                @input="dirty = true"
            /></label>
            <div class="flex items-center gap-3 pb-2.5">
              <label class="flex items-center gap-2 text-sm"
                ><input
                  v-model="material.is_active"
                  type="checkbox"
                  class="h-4 w-4"
                  @change="dirty = true"
                />{{ t.active }}</label
              >
              <button
                type="button"
                class="price-link price-link--danger"
                @click="
                  state.materials.splice(index, 1)
                  dirty = true
                "
              >
                {{ t.remove }}
              </button>
            </div>
          </div>
          <div class="mt-3 overflow-x-auto">
            <table class="w-full min-w-[34rem] text-sm">
              <thead>
                <tr class="text-left text-xs text-slate-500">
                  <th class="pb-1 pr-2 font-semibold">{{ t.thickness }}</th>
                  <th class="pb-1 pr-2 font-semibold">
                    {{ t.cut_price_per_m }}
                  </th>
                  <th class="pb-1 pr-2 font-semibold">{{ t.pierce_price }}</th>
                  <th class="pb-1 pr-2 font-semibold">{{ t.active }}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in material.thicknesses"
                  :key="row.key"
                >
                  <td class="py-1 pr-2">
                    <input
                      v-model="row.thickness"
                      type="number"
                      min="0.1"
                      step="any"
                      class="price-control"
                      :aria-label="t.thickness"
                      data-pricing-thickness
                      @input="dirty = true"
                    />
                  </td>
                  <td class="py-1 pr-2">
                    <input
                      v-model="row.cut_price_per_m"
                      type="number"
                      min="0"
                      step="any"
                      class="price-control"
                      :aria-label="t.cut_price_per_m"
                      data-pricing-cut
                      @input="dirty = true"
                    />
                  </td>
                  <td class="py-1 pr-2">
                    <input
                      v-model="row.pierce_price"
                      type="number"
                      min="0"
                      step="any"
                      class="price-control"
                      :aria-label="t.pierce_price"
                      @input="dirty = true"
                    />
                  </td>
                  <td class="py-1 pr-2 text-center">
                    <input
                      v-model="row.is_active"
                      type="checkbox"
                      class="h-4 w-4"
                      :aria-label="t.active"
                      @change="dirty = true"
                    />
                  </td>
                  <td class="py-1 text-right">
                    <button
                      type="button"
                      class="price-link price-link--danger"
                      @click="
                        material.thicknesses.splice(rowIndex, 1)
                        dirty = true
                      "
                    >
                      {{ t.remove }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              type="button"
              class="price-link mt-2"
              data-pricing-add-thickness
              @click="addThickness(material)"
            >
              + {{ t.addThickness }}
            </button>
          </div>
        </div>
      </section>

      <div
        class="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/95 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
      >
        <p
          v-if="error"
          role="alert"
          class="mr-auto max-w-xl break-words text-sm text-rose-600 dark:text-rose-300"
        >
          {{ error }}
        </p>
        <p
          v-else-if="dirty"
          class="mr-auto text-sm text-amber-700 dark:text-amber-300"
        >
          {{ t.unsaved }}
        </p>
        <button
          type="submit"
          class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          :disabled="saving"
          data-pricing-save
        >
          {{ saving ? t.saving : t.save }}
        </button>
      </div>
    </form>
    <notifications />
  </main>
</template>

<script>
import { apiErrorMessage } from '@/utils/task-workflow'
import {
  pricingCopy,
  pricingPayload,
  SERVICE_FIELDS,
} from '@/utils/pricing-copy'

let keys = 0
const key = () => `row-${++keys}`

export default {
  name: 'PricingSettings',
  data() {
    return {
      state: null,
      loadError: '',
      error: '',
      saving: false,
      dirty: false,
    }
  },
  computed: {
    t() {
      return pricingCopy(this.$i18n?.locale)
    },
    fields() {
      return SERVICE_FIELDS
    },
  },
  created() {
    this.load()
  },
  methods: {
    adopt(data) {
      this.state = {
        settings: {
          ...data.settings,
          discounts: (data.settings.discounts || []).map((tier) => ({
            ...tier,
          })),
        },
        materials: data.materials.map((material) => ({
          ...material,
          key: key(),
          thicknesses: material.thicknesses.map((row) => ({
            ...row,
            key: key(),
          })),
        })),
      }
      this.dirty = false
    },
    async load() {
      this.loadError = ''
      try {
        this.adopt(await this.$axios.$get('/api/pricing'))
      } catch (error) {
        this.loadError = apiErrorMessage(error, this.t.loadFailed)
      }
    },
    addDiscount() {
      const last =
        this.state.settings.discounts[this.state.settings.discounts.length - 1]
      this.state.settings.discounts.push({
        min_qty: last ? Number(last.min_qty) * 5 : 10,
        percent: last ? Number(last.percent) + 5 : 5,
      })
      this.dirty = true
    },
    addMaterial() {
      this.state.materials.push({
        id: null,
        key: key(),
        name: '',
        density: 7850,
        price_per_kg: 0,
        is_active: true,
        thicknesses: [],
      })
      this.addThickness(this.state.materials[this.state.materials.length - 1])
    },
    addThickness(material) {
      material.thicknesses.push({
        id: null,
        key: key(),
        thickness: '',
        cut_price_per_m: 0,
        pierce_price: 0,
        is_active: true,
      })
      this.dirty = true
    },
    async save() {
      if (this.saving) return
      this.saving = true
      this.error = ''
      try {
        this.adopt(
          await this.$axios.$put('/api/pricing', pricingPayload(this.state))
        )
        this.$notify({ type: 'success', text: this.t.saved })
      } catch (error) {
        this.error = apiErrorMessage(error, this.t.failed)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.price-card {
  @apply rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900;
}
.price-field {
  @apply block text-xs font-bold text-slate-600 dark:text-slate-300;
}
.price-field > span {
  @apply mb-1.5 block;
}
.price-control {
  @apply block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white;
}
.price-link {
  @apply rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/30;
}
.price-link--danger {
  @apply text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30;
}
</style>
