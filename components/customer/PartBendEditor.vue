<template>
  <section class="space-y-3" data-part-bends>
    <p class="builder-legend">{{ m.bends.title }}</p>
    <p class="builder-hint">{{ m.bends.lead }}</p>
    <div v-if="bends.length">
      <span class="builder-label">{{ m.bends.axis }}</span>
      <div class="flex gap-2">
        <button
          v-for="value in ['x', 'y']"
          :key="value"
          type="button"
          class="builder-chip"
          :class="{ 'builder-chip--on': axis === value }"
          :data-bend-axis="value"
          @click="$emit('axis', value)"
        >
          {{ m.bends[value] }}
        </button>
      </div>
    </div>
    <div
      v-for="(bend, index) in bends"
      :key="index"
      class="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/40 p-3 dark:border-rose-900/50 dark:bg-rose-950/10"
      :class="{ 'ring-2 ring-rose-400/40': issue && issue.index === index }"
      :data-bend="index"
    >
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-bold text-slate-700 dark:text-slate-200">
          {{ m.bends.title }} {{ index + 1 }}
        </p>
        <button
          type="button"
          class="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-300"
          :data-bend-remove="index"
          @click="$emit('remove', index)"
        >
          {{ m.bends.remove }}
        </button>
      </div>
      <label class="builder-field">
        <span class="builder-label">{{ m.bends.at(axis) }}</span>
        <span class="builder-input">
          <input
            v-model.number="bend.at"
            type="number"
            min="0"
            :max="length"
            step="any"
            inputmode="decimal"
            data-bend-field="at"
          />
          <em>{{ t.mm }}</em>
        </span>
      </label>
      <input
        v-model.number="bend.at"
        type="range"
        min="0"
        :max="length"
        step="1"
        class="w-full accent-rose-600"
        :aria-label="m.bends.at(axis)"
        data-bend-range
      />
      <div class="grid grid-cols-2 gap-3">
        <label class="builder-field">
          <span class="builder-label">{{ m.bends.angle }}</span>
          <span class="builder-input">
            <input
              v-model.number="bend.angle"
              type="number"
              :min="limits.min"
              :max="limits.max"
              step="1"
              inputmode="numeric"
              data-bend-field="angle"
            />
            <em>°</em>
          </span>
        </label>
        <div>
          <span class="builder-label">&nbsp;</span>
          <div class="flex gap-2">
            <button
              v-for="value in [true, false]"
              :key="String(value)"
              type="button"
              class="builder-chip"
              :class="{ 'builder-chip--on': bend.up === value }"
              :data-bend-up="value ? 'up' : 'down'"
              @click="bend.up = value"
            >
              {{ value ? m.bends.up : m.bends.down }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <button
      type="button"
      class="work-button w-full"
      data-variant="open"
      data-bend-add
      @click="$emit('add')"
    >
      + {{ m.bends.add }}
    </button>
  </section>
</template>

<script>
import { BEND_LIMITS } from '@/utils/part-bends'

export default {
  name: 'PartBendEditor',
  props: {
    bends: { type: Array, required: true },
    // The flat part the bends cross.
    part: { type: Object, default: null },
    issue: { type: Object, default: null },
    t: { type: Object, required: true },
    m: { type: Object, required: true },
  },
  computed: {
    axis() {
      return this.bends[0]?.axis === 'y' ? 'y' : 'x'
    },
    length() {
      if (!this.part) return 0
      return Math.round(this.axis === 'y' ? this.part.height : this.part.width)
    },
    limits() {
      return BEND_LIMITS
    },
  },
}
</script>
