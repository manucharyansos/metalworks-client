<template>
  <div
    class="grid gap-6 lg:grid-cols-[23rem_minmax(0,1fr)]"
    data-part-assembly-step
  >
    <div class="space-y-4">
      <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
        {{ a.lead }}
      </p>
      <label class="builder-field">
        <span class="builder-label">{{ a.name }}</span>
        <span class="builder-input">
          <input
            :value="name"
            type="text"
            maxlength="120"
            :placeholder="a.namePlaceholder"
            data-assembly-name
            @input="$emit('update:name', $event.target.value)"
          />
        </span>
      </label>
      <div class="view-tabs w-full" role="tablist">
        <button
          v-for="value in modes"
          :key="value"
          type="button"
          role="tab"
          class="view-tab flex-1"
          :class="{ 'view-tab--on': mode === value }"
          :aria-selected="mode === value ? 'true' : 'false'"
          :data-assembly-mode="value"
          @click="$emit('update:mode', value)"
        >
          {{ a.modes[value] }}
        </button>
      </div>
      <div v-if="mode === 'free'" class="space-y-2">
        <p class="builder-hint">{{ a.freeHint }}</p>
        <div class="flex gap-2">
          <button
            v-for="value in ['translate', 'rotate']"
            :key="value"
            type="button"
            class="builder-chip"
            :class="{ 'builder-chip--on': tool === value }"
            :data-assembly-tool="value"
            @click="$emit('update:tool', value)"
          >
            {{ a.tools[value] }}
          </button>
        </div>
      </div>
      <p v-if="mode === 'row'" class="builder-hint">{{ a.rowHint }}</p>

      <p class="builder-legend">{{ a.parts }}</p>
      <p
        v-if="!items.length"
        class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700"
      >
        {{ a.empty }}
      </p>
      <ol class="space-y-2">
        <li
          v-for="(item, index) in items"
          :key="item.key"
          class="assembly-item"
          :class="{ 'assembly-item--on': selected === index }"
          :data-assembly-item="index"
          @click="$emit('select', index)"
        >
          <div class="flex items-center gap-2">
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white dark:bg-white dark:text-slate-900"
              >{{ index + 1 }}</span
            >
            <span
              class="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-white"
              >{{ item.name }}</span
            >
            <span class="shrink-0 text-xs text-slate-500"
              >× {{ item.quantity }}</span
            >
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              class="assembly-action"
              :disabled="index === 0"
              @click.stop="$emit('move', index, -1)"
            >
              ↑ {{ a.up }}
            </button>
            <button
              type="button"
              class="assembly-action"
              :disabled="index === items.length - 1"
              @click.stop="$emit('move', index, 1)"
            >
              ↓ {{ a.down }}
            </button>
            <button
              type="button"
              class="assembly-action"
              :data-assembly-edit="index"
              @click.stop="$emit('edit', index)"
            >
              {{ a.edit }}
            </button>
            <button
              type="button"
              class="assembly-action text-rose-600 dark:text-rose-300"
              :data-assembly-remove="index"
              @click.stop="$emit('remove', index)"
            >
              {{ a.remove }}
            </button>
          </div>
          <div
            v-if="mode === 'edge' && index > 0 && joint(index)"
            class="mt-3 grid grid-cols-2 gap-2"
            :data-assembly-joint="index"
            @click.stop
          >
            <label class="builder-field col-span-2">
              <span class="builder-label">{{ a.parent }}</span>
              <select
                :value="placements[index].parent"
                class="builder-select"
                data-joint-field="parent"
                @change="set(index, 'parent', Number($event.target.value))"
              >
                <option v-for="n in index" :key="n" :value="n - 1">
                  {{ a.part(n) }}
                </option>
              </select>
            </label>
            <label class="builder-field">
              <span class="builder-label">{{ a.parentEdge }}</span>
              <select
                :value="placements[index].parentEdge"
                class="builder-select"
                data-joint-field="parentEdge"
                @change="set(index, 'parentEdge', $event.target.value)"
              >
                <option v-for="edge in edges" :key="edge" :value="edge">
                  {{ a.edges[edge] }}
                </option>
              </select>
            </label>
            <label class="builder-field">
              <span class="builder-label">{{ a.edge }}</span>
              <select
                :value="placements[index].edge"
                class="builder-select"
                data-joint-field="edge"
                @change="set(index, 'edge', $event.target.value)"
              >
                <option v-for="edge in edges" :key="edge" :value="edge">
                  {{ a.edges[edge] }}
                </option>
              </select>
            </label>
            <label class="builder-field">
              <span class="builder-label">{{ a.angle }}</span>
              <span class="builder-input">
                <input
                  :value="placements[index].angle"
                  type="number"
                  min="0"
                  max="360"
                  step="1"
                  inputmode="numeric"
                  data-joint-field="angle"
                  @input="set(index, 'angle', Number($event.target.value))"
                />
                <em>°</em>
              </span>
            </label>
            <label class="builder-field">
              <span class="builder-label">{{ a.offset }}</span>
              <span class="builder-input">
                <input
                  :value="placements[index].offset"
                  type="number"
                  step="any"
                  inputmode="decimal"
                  data-joint-field="offset"
                  @input="set(index, 'offset', Number($event.target.value))"
                />
              </span>
            </label>
            <div class="col-span-2 flex flex-wrap items-center gap-2">
              <button
                v-for="value in [90, 180]"
                :key="value"
                type="button"
                class="builder-chip"
                :class="{
                  'builder-chip--on': Number(placements[index].angle) === value,
                }"
                @click="set(index, 'angle', value)"
              >
                {{ value }}°
              </button>
              <label
                class="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <input
                  :checked="placements[index].flip"
                  type="checkbox"
                  class="h-4 w-4"
                  data-joint-field="flip"
                  @change="set(index, 'flip', $event.target.checked)"
                />
                {{ a.flip }}
              </label>
            </div>
          </div>
          <button
            v-if="
              mode === 'edge' &&
              index > 0 &&
              placements[index] &&
              placements[index].type === 'free'
            "
            type="button"
            class="mt-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300"
            @click.stop="$emit('unjoin', index)"
          >
            {{ a.unjoin }}
          </button>
        </li>
      </ol>
      <label
        v-if="weldAvailable && items.length > 1"
        class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <input
          :checked="weld"
          type="checkbox"
          class="h-4 w-4"
          data-assembly-weld
          @change="$emit('update:weld', $event.target.checked)"
        />
        {{ a.weld }}
      </label>
    </div>
    <div
      class="order-first min-w-0 lg:sticky lg:top-0 lg:order-none lg:self-start"
    >
      <figure class="builder-preview h-80 sm:h-[30rem]">
        <PartAssembly3D
          v-if="items.length"
          :items="views"
          :placements="placements"
          :mode="mode"
          :selected="selected"
          :tool="tool"
          :hint="hint"
          :unavailable="unavailable"
          :too-many="tooMany"
          class="h-full w-full"
          @select="$emit('select', $event)"
          @place="$emit('place', $event)"
        />
      </figure>
    </div>
  </div>
</template>

<script>
import PartAssembly3D from '@/components/customer/PartAssembly3D.vue'
import { ASSEMBLY_MODES, EDGES } from '@/utils/part-assembly'

export default {
  name: 'PartAssemblyStep',
  components: { PartAssembly3D },
  props: {
    // [{ key, name, quantity, view: { part, thickness, paint, metal } }]
    items: { type: Array, required: true },
    placements: { type: Array, required: true },
    mode: { type: String, default: 'edge' },
    tool: { type: String, default: 'translate' },
    selected: { type: Number, default: 0 },
    name: { type: String, default: '' },
    weld: Boolean,
    weldAvailable: Boolean,
    a: { type: Object, required: true },
    hint: { type: String, default: '' },
    unavailable: { type: String, default: '' },
    tooMany: { type: String, default: '' },
  },
  computed: {
    modes() {
      return ASSEMBLY_MODES
    },
    edges() {
      return EDGES
    },
    views() {
      return this.items.map((item) => item.view)
    },
  },
  methods: {
    joint(index) {
      return this.placements[index]?.type === 'joint'
    },
    set(index, key, value) {
      this.$emit('joint', index, { [key]: value })
    },
  },
}
</script>
