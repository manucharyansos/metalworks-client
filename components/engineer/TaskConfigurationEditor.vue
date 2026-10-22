<template>
  <section
    id="task-configuration"
    data-task-configuration
    class="mt-5 min-w-0 scroll-mt-24 overflow-hidden rounded-2xl border border-blue-200 bg-slate-50 dark:border-blue-900 dark:bg-slate-950/40"
    :aria-label="$t('order_configuration.title')"
  >
    <header class="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
      <h3 class="text-base font-bold">{{ $t('order_configuration.title') }}</h3>
      <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {{ $t('order_configuration.help') }}
      </p>
      <p class="mt-3 text-xs font-semibold text-blue-700 dark:text-blue-300">
        {{
          $t('order_configuration.summary', {
            files: fileCount,
            workshops: workshopCount,
          })
        }}
      </p>
    </header>

    <div class="space-y-2 p-3 sm:p-4">
      <div
        v-for="(section, index) in sections"
        :key="section"
        class="overflow-hidden rounded-xl border"
        :class="
          activeSection === section
            ? 'border-blue-400 dark:border-blue-800'
            : 'border-slate-200 dark:border-slate-700'
        "
      >
        <button
          :id="`task-config-toggle-${section}`"
          type="button"
          :data-task-config-toggle="section"
          :aria-expanded="activeSection === section"
          :aria-controls="`task-config-panel-${section}`"
          :disabled="disabled"
          class="flex w-full min-w-0 items-start gap-3 p-3 text-left transition disabled:opacity-50 sm:p-4"
          :class="
            activeSection === section
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-800 hover:bg-blue-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
          "
          @click="toggleSection(section)"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-400/15 text-xs font-bold"
            aria-hidden="true"
            >{{ String(index + 1).padStart(2, '0') }}</span
          >
          <span class="min-w-0 flex-1">
            <span class="block break-words text-sm font-semibold">{{
              $t(`order_configuration.${section}`)
            }}</span>
            <span
              class="mt-1 block break-words text-[11px] leading-4"
              :class="
                activeSection === section
                  ? 'text-blue-100'
                  : 'text-slate-500 dark:text-slate-400'
              "
              >{{ $t(`order_configuration.${section}_hint`) }}</span
            >
          </span>
          <span class="shrink-0 text-lg leading-6" aria-hidden="true">{{
            activeSection === section ? '−' : '+'
          }}</span>
        </button>
        <section
          v-show="activeSection === section"
          :id="`task-config-panel-${section}`"
          :data-task-config-panel="section"
          :aria-labelledby="`task-config-toggle-${section}`"
          class="min-w-0 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:p-4"
        >
          <p
            v-if="
              !workshopCount && !['files', 'confirmation'].includes(section)
            "
            class="text-sm text-slate-500"
          >
            {{ $t('order_configuration.no_workshops') }}
          </p>
          <slot :name="section" />
        </section>
      </div>
    </div>

    <footer
      class="flex justify-end border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4"
    >
      <button
        type="button"
        data-finish-task-configuration
        :disabled="disabled"
        class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        @click="$emit('close')"
      >
        {{ $t('order_configuration.done') }}
      </button>
    </footer>
  </section>
</template>

<script>
export default {
  props: {
    disabled: Boolean,
    fileCount: { type: Number, default: 0 },
    workshopCount: { type: Number, default: 0 },
  },
  data() {
    return {
      activeSection: 'files',
      sections: [
        'files',
        'routing',
        'route',
        'confirmation',
        'workshops',
        'operators',
      ],
    }
  },
  methods: {
    toggleSection(section) {
      if (this.disabled || !this.sections.includes(section)) return
      this.activeSection = this.activeSection === section ? null : section
    },
  },
}
</script>
