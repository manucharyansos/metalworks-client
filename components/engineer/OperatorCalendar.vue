<template>
  <section
    class="space-y-4"
    :class="{ 'app-surface rounded-3xl p-4 sm:p-6': !picker }"
    data-operator-calendar
  >
    <header v-if="!picker" class="max-w-3xl">
      <h2
        class="text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl"
      >
        {{ t.title }}
      </h2>
      <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {{ t.lead }}
      </p>
      <details class="calendar-how">
        <summary>{{ t.how }}</summary>
        <p>{{ t.help }}</p>
      </details>
    </header>

    <div
      class="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/40"
    >
      <div class="min-w-0">
        <span class="calendar-label">{{ c[period] }}</span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="calendar-icon-button"
            :aria-label="c.previous"
            :title="c.previous"
            :disabled="loading"
            @click="shiftDate(-1)"
          >
            ‹
          </button>
          <input
            v-model="date"
            type="date"
            class="app-control !w-auto !py-2.5"
            :aria-label="c[period]"
            @change="refresh"
          />
          <button
            type="button"
            class="calendar-icon-button"
            :aria-label="c.next"
            :title="c.next"
            :disabled="loading"
            @click="shiftDate(1)"
          >
            ›
          </button>
          <button
            type="button"
            class="app-button-secondary !rounded-xl !px-3 !py-2.5"
            :disabled="loading || days.includes(today)"
            @click="goToday"
          >
            {{ c.today }}
          </button>
        </div>
      </div>
      <div>
        <span :id="periodLabelId" class="calendar-label">{{ c.period }}</span>
        <div
          class="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
          role="group"
          :aria-labelledby="periodLabelId"
        >
          <button
            v-for="key in ['day', 'week', 'month']"
            :key="key"
            type="button"
            class="calendar-segment"
            :aria-pressed="String(period === key)"
            @click="setPeriod(key)"
          >
            {{ c[key] }}
          </button>
        </div>
      </div>
      <label class="min-w-[10rem] flex-1 sm:flex-none">
        <span class="calendar-label">{{ c.operator }}</span>
        <select v-model="operatorFilter" class="app-control !py-2.5">
          <option value="">{{ c.all }}</option>
          <option v-for="op in roster" :key="op.id" :value="String(op.id)">
            {{ op.name }}
          </option>
        </select>
      </label>
      <label class="min-w-[12rem] flex-1 sm:flex-none">
        <span class="calendar-label">{{ c.workshop }}</span>
        <select v-model="factoryId" class="app-control !py-2.5">
          <option value="">{{ t.all }}</option>
          <option v-for="f in data.factories" :key="f.id" :value="String(f.id)">
            {{ f.name }}
          </option>
        </select>
      </label>
      <button
        v-if="!hideRefresh"
        type="button"
        :disabled="loading || busy"
        class="app-button-primary gap-2 !rounded-xl !py-2.5"
        @click="refresh"
      >
        <svg
          class="h-4 w-4"
          :class="{ 'animate-spin': loading }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4m-4 5a8 8 0 0 0 14.9 3M20 20v-4h-4"
          />
        </svg>
        {{ t.refresh }}
      </button>
    </div>

    <p v-if="error" role="alert" class="calendar-alert">
      {{ error }}
    </p>
    <p v-if="actionError" role="alert" class="calendar-alert">
      {{ actionError }}
    </p>
    <template v-if="!error">
      <dl class="grid grid-cols-2 gap-2 lg:grid-cols-4" data-calendar-summary>
        <div class="calendar-stat" data-tone="green">
          <dt>{{ t.freeToday }}</dt>
          <dd>
            {{ overview.freeToday
            }}<span class="calendar-stat__of">
              / {{ timelineRows.length }}</span
            >
          </dd>
        </div>
        <div class="calendar-stat" data-tone="blue">
          <dt>{{ t.busyToday }}</dt>
          <dd>{{ overview.busyToday }}</dd>
        </div>
        <div
          class="calendar-stat"
          :data-tone="overview.late ? 'red' : 'neutral'"
        >
          <dt>{{ t.lateJobs }}</dt>
          <dd>{{ overview.late }}</dd>
        </div>
        <div
          class="calendar-stat"
          :data-tone="overview.unassigned ? 'amber' : 'neutral'"
        >
          <dt>{{ t.unassignedJobs }}</dt>
          <dd>{{ overview.unassigned }}</dd>
        </div>
      </dl>

      <div
        ref="scroll"
        class="calendar-scroll"
        :data-period="period"
        :aria-busy="String(loading)"
        :aria-label="t.title"
      >
        <div class="calendar-grid" :style="gridStyle" data-calendar-grid>
          <div class="calendar-corner">{{ t.operator }}</div>
          <div
            v-for="day in days"
            :key="'head-' + day"
            class="calendar-head"
            :data-today="String(day === today)"
            :data-past="String(day < today)"
            :aria-current="day === today ? 'date' : null"
            :title="headTitle(day)"
          >
            <span class="calendar-head__weekday">{{ weekdayOf(day) }}</span>
            <span class="calendar-head__date">{{
              period === 'month' ? Number(day.slice(8, 10)) : dateOf(day)
            }}</span>
            <span
              v-if="day >= today && timelineRows.length"
              class="calendar-head__free"
              :data-none="String(!dayTotals[day].free)"
              >{{
                period === 'month'
                  ? dayTotals[day].free
                  : `${dayTotals[day].free} ${t.freeShort}`
              }}</span
            >
          </div>

          <p v-if="!timelineRows.length" class="calendar-empty">
            {{ loading ? t.loading : t.noOperators }}
          </p>

          <template v-for="row in timelineRows">
            <button
              :key="'name-' + row.operator.id"
              type="button"
              class="calendar-name"
              :aria-expanded="String(expanded === row.operator.id)"
              :title="row.workshops.join(', ')"
              data-operator-row
              @click="toggleRow(row)"
            >
              <span class="calendar-name__person">
                <strong class="truncate">{{ row.operator.name }}</strong>
                <span
                  v-if="row.late"
                  class="calendar-late-badge"
                  :title="t.lateMark"
                  >! {{ row.late }}</span
                >
              </span>
              <span
                class="calendar-name__status"
                :data-tone="statusTone(row)"
                >{{ statusText(row) }}</span
              >
              <template v-if="row.upcomingDays">
                <span
                  class="calendar-meter"
                  :data-tone="row.meterTone"
                  aria-hidden="true"
                >
                  <span :style="{ width: row.busyPercent + '%' }"></span>
                </span>
                <span class="calendar-name__meta">{{ busyText(row) }}</span>
              </template>
            </button>
            <component
              :is="cell.clickable ? 'button' : 'span'"
              v-for="cell in row.cells"
              :key="row.operator.id + '-' + cell.day"
              :type="cell.clickable ? 'button' : null"
              class="calendar-cell"
              :data-level="cell.level"
              :data-past="String(cell.past)"
              :data-today="String(cell.today)"
              :data-slot="String(cell.slot)"
              :data-late="String(cell.late)"
              :data-reserved="String(cell.reserved)"
              :data-focus="
                String(expanded === row.operator.id && focusDay === cell.day)
              "
              :title="cellTitle(row, cell)"
              :aria-label="cellTitle(row, cell)"
              @click="cellClick(row, cell)"
            >
              <template v-if="period === 'day'">
                <span v-if="!cell.jobs.length" class="calendar-cell__free"
                  >{{ t.freeDay
                  }}<template v-if="cell.slot">
                    · + {{ t.placeHere }}</template
                  ></span
                >
                <span
                  v-for="job in cell.jobs"
                  :key="'chip-' + job.id + (job.helper ? '-helper' : '')"
                  class="calendar-chip"
                  :data-state="barState(job)"
                >
                  <strong class="block truncate">{{ jobTitle(job) }}</strong>
                  <span class="block truncate"
                    >{{ job.workshop }} · {{ barDue(job) }}</span
                  >
                  <span
                    v-if="timesOn(job, cell.day)"
                    class="block truncate font-bold"
                    data-chip-hours
                    >{{ t.reserved }}: {{ timesOn(job, cell.day) }}</span
                  >
                </span>
              </template>
              <template v-else>
                <span class="calendar-cell__count">{{
                  cell.count || (cell.slot ? '+' : '')
                }}</span>
                <span
                  v-if="cell.due"
                  class="calendar-cell__due"
                  aria-hidden="true"
                ></span>
                <span
                  v-if="cell.late"
                  class="calendar-cell__late"
                  aria-hidden="true"
                  >!</span
                >
              </template>
            </component>
            <div
              v-if="expanded === row.operator.id"
              :key="'detail-' + row.operator.id"
              class="calendar-detail"
              data-operator-detail
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="calendar-label !mb-0">
                    {{
                      focusDay
                        ? fill(t.jobsOnDay, { day: labelDay(focusDay) })
                        : t.jobs
                    }}
                  </p>
                  <h3
                    class="text-base font-black text-slate-950 dark:text-white"
                  >
                    {{ row.operator.name }}
                  </h3>
                  <p
                    v-if="row.workshops.length || row.minutes"
                    class="text-xs text-slate-500 dark:text-slate-400"
                  >
                    {{ row.workshops.join(', ')
                    }}<template v-if="row.minutes">
                      · {{ t.estimate }}: {{ hoursText(row.minutes) }}</template
                    >
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="focusDay"
                    type="button"
                    class="app-button-secondary !rounded-xl !px-3 !py-1.5 !text-xs"
                    @click="focusDay = ''"
                  >
                    {{ t.showAll }} ({{ row.jobs.length }})
                  </button>
                  <button
                    type="button"
                    class="calendar-detail__close"
                    :aria-label="t.close"
                    :title="t.close"
                    @click="closeDetail"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p
                v-if="!detailJobs(row).length"
                class="mt-3 text-sm text-slate-500 dark:text-slate-400"
              >
                {{ t.noJobs }}
              </p>
              <ul v-else class="mt-3 grid gap-2 xl:grid-cols-2">
                <li
                  v-for="job in detailJobs(row)"
                  :key="'job-' + job.id + (job.helper ? '-helper' : '')"
                  class="calendar-job"
                  :data-state="isUndated(job) ? 'undated' : barState(job)"
                  :title="jobTooltip(job)"
                >
                  <div class="min-w-0 flex-1">
                    <p class="line-clamp-2 break-words text-sm font-bold">
                      {{ jobTitle(job) }}
                    </p>
                    <p class="truncate text-xs opacity-80">
                      {{ job.workshop
                      }}<template v-if="job.engineer">
                        · {{ job.engineer }}</template
                      >
                    </p>
                    <p v-if="jobDates(job)" class="mt-1 text-xs font-semibold">
                      {{ jobDates(job) }}
                    </p>
                    <p
                      v-if="plannedText(job)"
                      class="mt-1 text-xs font-bold text-blue-700 dark:text-blue-300"
                      data-job-planned
                    >
                      {{ fill(t.plannedOn, { when: plannedText(job) }) }}
                    </p>
                    <p
                      v-if="
                        (job.window && job.window.overdue) ||
                        job.blocked ||
                        job.helper ||
                        isUndated(job)
                      "
                      class="mt-1.5 flex flex-wrap gap-1"
                    >
                      <span
                        v-if="job.window && job.window.overdue"
                        class="calendar-tag"
                        data-tone="red"
                        >{{ t.late }}</span
                      >
                      <span
                        v-if="job.blocked"
                        class="calendar-tag"
                        data-tone="slate"
                        >{{ t.waiting }}</span
                      >
                      <span
                        v-if="job.helper"
                        class="calendar-tag"
                        data-tone="violet"
                        >{{ c.helper }}</span
                      >
                      <span
                        v-if="isUndated(job)"
                        class="calendar-tag"
                        data-tone="slate"
                        >{{ t.undated }}</span
                      >
                    </p>
                  </div>
                  <button
                    v-if="!picker && job.can_edit && job.window"
                    type="button"
                    class="calendar-job__action"
                    @click="openBar({ job })"
                  >
                    {{ t.planJob }}
                  </button>
                </li>
              </ul>
              <div v-if="row.reservations.length" class="mt-4">
                <p class="calendar-label">{{ t.reservations }}</p>
                <ul class="flex flex-wrap gap-2">
                  <li
                    v-for="reservation in row.reservations"
                    :key="'reserved-' + reservation.id"
                    class="calendar-item"
                    data-tone="blue"
                  >
                    <strong class="block"
                      >{{
                        formatDay(String(reservation.starts_at).slice(0, 10))
                      }}
                      {{ time(reservation.starts_at) }}–{{
                        time(reservation.ends_at)
                      }}</strong
                    >
                    <span class="block break-words">{{
                      bookingTitle(reservation)
                    }}</span>
                    <span
                      v-if="reservation.is_helper"
                      class="block font-semibold"
                      >{{ c.helper }}</span
                    >
                    <span
                      v-if="reservation.assignment_changed"
                      class="block font-semibold text-rose-600 dark:text-rose-300"
                      >{{ t.changed }}</span
                    >
                    <button
                      v-if="reservation.can_edit && !picker"
                      type="button"
                      :disabled="busy"
                      class="calendar-item__action !text-rose-600 dark:!text-rose-300"
                      @click="remove('bookings', reservation.id)"
                    >
                      {{ t.remove }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div
        class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
        data-calendar-legend
      >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch" data-level="free"></span
          >{{ t.freeDay }}</span
        >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch" data-level="light">1</span
          >{{ loadText(1) }}</span
        >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch" data-level="busy">2</span
          >{{ loadText(2) }}</span
        >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch" data-level="heavy">3+</span
          >{{ loadText(3).replace('3', '3+') }}</span
        >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch calendar-swatch--due"></span
          >{{ t.dueMark }}</span
        >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch calendar-swatch--late">!</span
          >{{ t.lateMark }}</span
        >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch calendar-swatch--reserved"></span
          >{{ t.reservedMark }}</span
        >
        <span class="calendar-legend-item"
          ><span class="calendar-swatch" data-past="true"></span
          >{{ t.pastDay }}</span
        >
        <!-- Outside a form the header already says what a click does. -->
        <span v-if="picker" class="basis-full">{{ t.pickHint }}</span>
      </div>

      <p
        v-if="placedText"
        role="status"
        class="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
      >
        {{ placedText }}
      </p>

      <div
        v-if="slot"
        class="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center"
        data-free-slot
        @click.self="closeSlot"
      >
        <section
          ref="slotDialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="slotTitleId"
          tabindex="-1"
          class="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl outline-none dark:bg-slate-900 sm:p-6"
          @keydown.esc="closeSlot"
        >
          <p class="calendar-label">{{ t.slotTitle }}</p>
          <h3
            :id="slotTitleId"
            class="text-lg font-black text-slate-950 dark:text-white"
          >
            {{ slot.operator.name }}
          </h3>
          <p
            class="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          >
            {{ formatDay(slot.start) }} – {{ formatDay(slot.end) }}
          </p>
          <p
            v-if="slot.late"
            class="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
            data-slot-late
          >
            {{ fill(t.lateWarning, { count: slot.late }) }}
          </p>

          <section
            v-if="canPlace"
            class="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ t.placeExisting }}
            </h4>
            <p
              class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400"
            >
              {{ t.placeHelp }}
            </p>
            <p
              v-if="!slotCandidates.length"
              class="mt-3 text-sm text-slate-500 dark:text-slate-400"
            >
              {{ t.noCandidates }}
            </p>
            <form v-else class="mt-3 space-y-3" @submit.prevent="placeStage">
              <label class="block">
                <span class="calendar-label">{{ t.chooseWork }}</span>
                <select
                  v-model="slot.stageId"
                  required
                  class="app-control !py-2.5"
                  @change="syncSlotDeadline"
                >
                  <option disabled value="">{{ t.chooseWork }}</option>
                  <optgroup
                    v-for="group in slotGroups"
                    :key="group.key"
                    :label="group.label"
                  >
                    <option
                      v-for="task in group.items"
                      :key="task.id"
                      :value="task.id"
                    >
                      {{ candidateText(task) }}
                    </option>
                  </optgroup>
                </select>
              </label>
              <div
                v-if="slotBlocked"
                class="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                data-slot-order-passed
              >
                <p>
                  {{
                    fill(t.orderDuePassed, { date: formatDay(slotStageLimit) })
                  }}
                </p>
                <button
                  type="button"
                  class="mt-2 font-bold underline underline-offset-4"
                  @click="planFromSlot"
                >
                  {{ t.planHoursHere }}
                </button>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block">
                  <span class="calendar-label">{{ t.start }}</span>
                  <input
                    v-model="slot.startsOn"
                    required
                    type="date"
                    class="app-control !py-2.5"
                    :min="today"
                    :max="slot.deadline || null"
                  />
                </label>
                <label class="block">
                  <span class="calendar-label">{{ t.stageDue }}</span>
                  <input
                    v-model="slot.deadline"
                    required
                    type="date"
                    class="app-control !py-2.5"
                    :min="slot.startsOn || today"
                    :max="slotDeadlineMax"
                  />
                </label>
              </div>
              <label
                v-if="slotLimitBinds"
                class="flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-xs font-semibold leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
                data-slot-extend
              >
                <input
                  v-model="slot.extendOrder"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-300 text-slate-950 focus:ring-amber-300"
                  @change="syncSlotLimit"
                />
                <span>{{
                  slotExtends
                    ? fill(t.extendOrderTo, {
                        to: formatDay(slot.deadline),
                        from: formatDay(slotStageLimit),
                      })
                    : fill(t.extendOrder, { from: formatDay(slotStageLimit) })
                }}</span>
              </label>
              <p
                v-if="slotError"
                role="alert"
                class="text-sm font-semibold text-rose-600 dark:text-rose-300"
              >
                {{ slotError }}
              </p>
              <button
                type="submit"
                class="app-button-primary w-full !rounded-xl !py-2.5"
                :disabled="
                  placing || !slot.stageId || !slot.deadline || slotBlocked
                "
              >
                {{ t.place }}
              </button>
            </form>
          </section>

          <section
            v-if="canCreate"
            class="mt-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ t.createNew }}
            </h4>
            <p
              class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400"
            >
              {{ t.createHelp }}
            </p>
            <button
              type="button"
              class="app-button-secondary mt-3 w-full !rounded-xl !py-2.5"
              @click="createFromSlot"
            >
              {{ t.createNew }}
            </button>
          </section>

          <button
            type="button"
            class="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="closeSlot"
          >
            {{ t.close }}
          </button>
        </section>
      </div>

      <details v-if="!picker" ref="planner" class="calendar-panel">
        <summary class="calendar-panel__summary">{{ t.plan }}</summary>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {{ c.hours }}
        </p>
        <form class="mt-4 space-y-4" @submit.prevent="book">
          <label class="block max-w-2xl">
            <span class="calendar-label">{{ c.existing }}</span>
            <select
              v-model="booking.factory_order_id"
              required
              class="app-control !py-2.5"
              @change="selectTask"
            >
              <option disabled value="">
                {{ c.choose }} ({{ editableTasks.length }})
              </option>
              <option
                v-for="task in editableTasks"
                :key="task.id"
                :value="task.id"
              >
                {{ jobTitle(task) }} · {{ task.workshop }}
              </option>
            </select>
          </label>
          <TaskTeamEditor
            v-if="selectedStage"
            :key="selectedStage.id"
            class="w-full"
            :step="selectedStage"
            :workers="data.workers || []"
            :disabled="busy || loading"
            @saved="teamSaved"
            @dirty="teamDirty = $event"
          />
          <p
            v-if="selectedStage"
            class="text-sm text-slate-600 dark:text-slate-300"
          >
            {{ c.primary }}:
            <strong>{{ selectedStage.operator_name || t.unassigned }}</strong>
          </p>
          <div class="flex flex-wrap items-end gap-3">
            <label>
              <span class="calendar-label">{{ t.day }}</span>
              <input
                v-model="booking.day"
                required
                type="date"
                class="app-control !py-2.5"
                :min="today"
                @change="syncBookingDay"
              />
            </label>
            <label>
              <span class="calendar-label">{{ t.start }}</span>
              <input
                v-model="booking.start"
                required
                type="time"
                class="app-control !py-2.5"
              />
            </label>
            <label>
              <span class="calendar-label">{{ t.end }}</span>
              <input
                v-model="booking.end"
                required
                type="time"
                class="app-control !py-2.5"
                :min="booking.start || null"
              />
            </label>
            <button
              :disabled="
                busy ||
                loading ||
                teamDirty ||
                !selectedStage ||
                !booking.operator_id
              "
              type="submit"
              class="app-button-primary !rounded-xl !py-2.5"
            >
              {{ t.save }}
            </button>
          </div>
        </form>
        <p
          v-if="bookingSaved"
          role="status"
          class="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          {{ t.confirmed }} · {{ bookingSaved }}
        </p>
        <p
          v-if="!editableTasks.length"
          class="mt-3 text-sm text-slate-500 dark:text-slate-400"
        >
          {{ c.none }} {{ c.readOnly }}
        </p>
      </details>
    </template>
  </section>
</template>
<script>
import TaskTeamEditor from '@/components/order/TaskTeamEditor.vue'
import { planningCopy } from '@/utils/planning-copy'
import {
  calendarCopy,
  calendarDays,
  firstFreeDay,
  freeSegment,
  holds,
  jobCount,
  jobWindow,
  loadLevel,
} from '@/utils/operator-calendar'
import {
  calendarDayLabel,
  formatWallDate,
  formatWallDateTime,
  isDateOnly,
} from '@/utils/wall-time'

// Moves a "YYYY-MM-DD" day by whole days or months without touching time zones.
function moveDay(day, { days = 0, months = 0 }) {
  const date = new Date(`${day}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return day
  if (months) {
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + months)
  }
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
const yerevanToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yerevan' }).format(
    new Date()
  )
// How far ahead "free from" looks for an operator's first free day.
const FREE_LOOKAHEAD = 120
let calendarIds = 0
const empty = () => ({
  factories: [],
  workers: [],
  shifts: [],
  bookings: [],
  tasks: [],
  can_manage_shifts: false,
})
export default {
  components: { TaskTeamEditor },
  props: {
    // Embedded in a form: a free day is reported with "pick" instead of a dialog.
    picker: Boolean,
    // Where "Create a new task" leads from a free day; empty hides the choice.
    createPath: { type: String, default: '' },
    // The page has its own refresh button, which refreshes this calendar too.
    hideRefresh: Boolean,
  },
  data: () => ({
    data: empty(),
    date: yerevanToday(),
    factoryId: '',
    period: 'week',
    operatorFilter: '',
    actionError: '',
    bookingSaved: '',
    slot: null,
    slotError: '',
    placing: false,
    placedText: '',
    teamDirty: false,
    loading: false,
    busy: false,
    error: '',
    request: 0,
    timer: null,
    uid: ++calendarIds,
    // The operator whose jobs are open under their row, and the day picked.
    expanded: null,
    focusDay: '',
    visibleWidth: 0,
    // The period last scrolled to today, so refreshes do not move the view.
    scrolledView: '',
    booking: {
      operator_id: '',
      factory_order_id: '',
      day: '',
      start: '',
      end: '',
    },
  }),
  computed: {
    c() {
      return planningCopy[this.$i18n?.locale] || planningCopy.hy
    },
    t() {
      return calendarCopy[this.$i18n?.locale] || calendarCopy.hy
    },
    locale() {
      return this.$i18n?.locale || 'hy'
    },
    today() {
      return this.data.today || yerevanToday()
    },
    days() {
      return calendarDays(this.date, this.period)
    },
    periodLabelId() {
      return `calendar-period-${this.uid}`
    },
    scope() {
      return `${this.$auth?.user?.id}:${this.$store?.state?.workspace?.company?.id}`
    },
    roster() {
      const rows = this.data.factories
        .filter((f) => !this.factoryId || String(f.id) === this.factoryId)
        .flatMap((f) => f.operators)
      const map = new Map(rows.map((op) => [Number(op.id), op]))
      if (!this.factoryId)
        for (const worker of this.data.workers || [])
          map.set(Number(worker.id), worker)
      for (const job of this.data.tasks.filter(
        (j) => !this.factoryId || String(j.factory_id) === this.factoryId
      ))
        for (const helper of job.helpers || [])
          map.set(Number(helper.id), helper)
      for (const job of this.data.tasks) {
        if (
          !job.operator_id ||
          (this.factoryId && String(job.factory_id) !== this.factoryId)
        )
          continue
        if (!map.has(Number(job.operator_id)))
          map.set(Number(job.operator_id), {
            id: job.operator_id,
            name: job.operator_name || '#' + job.operator_id,
          })
      }
      if (!this.factoryId)
        for (const row of this.data.bookings)
          if (!map.has(Number(row.operator_id)))
            map.set(Number(row.operator_id), {
              id: row.operator_id,
              name: `${this.t.unknown} #${row.operator_id}`,
            })
      return [...map.values()]
    },
    operators() {
      return this.roster.filter(
        (op) => !this.operatorFilter || String(op.id) === this.operatorFilter
      )
    },
    // Open jobs per person (primary operator or helper) with the days they span
    // and the hours reserved for them. Work in every workshop counts: the
    // workshop filter only picks operators.
    groupedJobs() {
      const today = this.today
      const yesterday = moveDay(today, { days: -1 })
      const dayOf = (booking) => String(booking.starts_at).slice(0, 10)
      const groups = new Map()
      const add = (id, entry) => {
        if (!groups.has(id)) groups.set(id, [])
        groups.get(id).push(entry)
      }
      const matched = new Set()
      for (const job of this.data.tasks) {
        if (!job.operator_id) continue
        const people = [
          { id: job.operator_id, helper: false },
          ...(job.helpers || []).map((h) => ({ id: h.id, helper: true })),
        ]
        for (const person of people) {
          const id = Number(person.id)
          if (!id) continue
          const reservations = this.data.bookings.filter(
            (b) =>
              Number(b.factory_order_id) === Number(job.id) &&
              Number(b.operator_id) === id
          )
          for (const b of reservations) matched.add(b.id)
          const booked = [...new Set(reservations.map(dayOf))].sort()
          let window = jobWindow(job, today)
          // Overdue work given hours on a later day moves there: it stops
          // filling today but stays overdue.
          if (window?.overdue && booked.some((day) => day >= today))
            window = { ...window, end: yesterday, rescheduled: true }
          add(id, {
            ...job,
            helper: person.helper,
            window,
            booked,
            reservations,
          })
        }
      }
      // Hours reserved for work the person no longer holds still occupy them.
      const leftover = new Map()
      for (const b of this.data.bookings) {
        if (matched.has(b.id)) continue
        const key = `${b.operator_id}:${b.factory_order_id}`
        if (!leftover.has(key))
          leftover.set(key, {
            id: Number(b.factory_order_id),
            order_id: b.order_id,
            order_number: b.order_number,
            name: b.task,
            title: b.title,
            workshop: b.workshop,
            engineer: b.engineer,
            blocked: Boolean(b.blocked),
            helper: Boolean(b.is_helper),
            can_edit: false,
            window: null,
            booked: [],
            reservations: [],
            operatorId: Number(b.operator_id),
          })
        const entry = leftover.get(key)
        entry.reservations.push(b)
        if (!entry.booked.includes(dayOf(b))) entry.booked.push(dayOf(b))
      }
      for (const entry of leftover.values()) add(entry.operatorId, entry)
      for (const jobs of groups.values())
        jobs.sort(
          (a, b) =>
            (a.due_date || '9999').localeCompare(b.due_date || '9999') ||
            a.id - b.id
        )
      return groups
    },
    // Per operator: one cell per visible day (how many jobs hold them, any
    // deadline that day) and a summary of when they are free.
    timelineRows() {
      const today = this.today
      const upcoming = this.days.filter((day) => day >= today)
      return this.operators.map((operator) => {
        const jobs = this.assignments(operator.id)
        const late = jobs.filter((job) => job.window?.overdue).length
        const reservations = this.data.bookings.filter(
          (b) =>
            Number(b.operator_id) === Number(operator.id) &&
            this.days.includes(String(b.starts_at).slice(0, 10))
        )
        const counts = {}
        const cells = this.days.map((day) => {
          const active = jobs.filter((job) => holds(job, day))
          counts[day] = active.length
          return {
            day,
            count: active.length,
            level: loadLevel(active.length),
            jobs: active,
            due: jobs.filter((job) => job.due_date === day).length,
            reserved: reservations.some(
              (b) => String(b.starts_at).slice(0, 10) === day
            ),
            past: day < today,
            today: day === today,
            late: day === today && late > 0,
          }
        })
        const freeDays = upcoming.filter((day) => !counts[day]).length
        const busyDays = upcoming.length - freeDays
        const busyPercent = upcoming.length
          ? Math.round((busyDays / upcoming.length) * 100)
          : 0
        const row = {
          operator,
          jobs,
          counts,
          cells,
          late,
          workshops: this.workshopsOf(operator.id),
          freeFrom: firstFreeDay(jobs, today, FREE_LOOKAHEAD),
          // The end of planned (not overdue) work, for the tooltip and tests.
          busyUntil: jobs.reduce(
            (last, job) =>
              job.window && !job.window.overdue && job.window.end > last
                ? job.window.end
                : last,
            ''
          ),
          undated: jobs.filter((job) => this.isUndated(job)).length,
          minutes: jobs
            .filter((job) => !job.helper)
            .reduce(
              (sum, job) => sum + (Number(job.estimated_minutes) || 0),
              0
            ),
          upcomingDays: upcoming.length,
          freeDays,
          busyDays,
          busyPercent,
          meterTone:
            busyPercent >= 85 ? 'red' : busyPercent >= 50 ? 'amber' : 'blue',
          reservations,
        }
        for (const cell of cells) {
          cell.slot = this.slotOpen(row, cell.day)
          cell.clickable = cell.slot || cell.count > 0
        }
        return row
      })
    },
    dayTotals() {
      const totals = {}
      for (const day of this.days) {
        const due = new Set()
        let free = 0
        for (const row of this.timelineRows) {
          if (!row.counts[day]) free++
          for (const job of row.jobs) if (job.due_date === day) due.add(job.id)
        }
        totals[day] = {
          free,
          busy: this.timelineRows.length - free,
          due: due.size,
        }
      }
      return totals
    },
    // Today's picture for the shown operators, whatever period is on screen.
    overview() {
      const rows = this.timelineRows
      const freeToday = rows.filter((row) => row.freeFrom === this.today).length
      const late = new Set()
      for (const row of rows)
        for (const job of row.jobs) if (job.window?.overdue) late.add(job.id)
      return {
        freeToday,
        busyToday: rows.length - freeToday,
        late: late.size,
        unassigned: this.data.tasks.filter(
          (task) =>
            !task.operator_id &&
            (!this.factoryId || String(task.factory_id) === this.factoryId)
        ).length,
      }
    },
    gridStyle() {
      const style = {
        '--days': this.days.length,
        '--cell-min':
          { day: '16rem', month: '1.55rem' }[this.period] || '3.25rem',
      }
      // The open jobs stay as wide as what is on screen, even in a long month.
      if (this.visibleWidth) style['--visible-width'] = `${this.visibleWidth}px`
      return style
    },
    editableTasks() {
      return this.data.tasks.filter(
        (t) =>
          t.can_edit &&
          (!this.factoryId || String(t.factory_id) === this.factoryId)
      )
    },
    selectedStage() {
      return this.editableTasks.find(
        (t) => Number(t.id) === Number(this.booking.factory_order_id)
      )
    },
    slotTitleId() {
      return `calendar-slot-${this.uid}`
    },
    canCreate() {
      return (
        !this.picker &&
        Boolean(this.createPath) &&
        typeof this.$can === 'function' &&
        this.$can('orders.create')
      )
    },
    // Unassigned work the viewer may plan can be placed into free days.
    canPlace() {
      return !this.picker && this.data.tasks.some((t) => t.can_edit)
    },
    // Unassigned work in the operator's workshops, or the operator's own work
    // to move to the free days.
    slotCandidates() {
      if (!this.slot) return []
      const operator = Number(this.slot.operator.id)
      return this.data.tasks.filter(
        (t) =>
          t.can_edit &&
          ((!t.operator_id &&
            this.slot.factoryIds.includes(Number(t.factory_id))) ||
            Number(t.operator_id) === operator)
      )
    },
    slotGroups() {
      return [
        {
          key: 'unassigned',
          label: this.t.unassignedWork,
          items: this.slotCandidates.filter((t) => !t.operator_id),
        },
        {
          key: 'own',
          label: this.t.operatorWork,
          items: this.slotCandidates.filter((t) => t.operator_id),
        },
      ].filter((group) => group.items.length)
    },
    slotStage() {
      return this.slotCandidates.find(
        (t) => Number(t.id) === Number(this.slot?.stageId)
      )
    },
    // A workshop deadline cannot pass the task's overall deadline.
    slotStageLimit() {
      return this.slotStage?.order_due_at
        ? String(this.slotStage.order_due_at).slice(0, 10)
        : ''
    },
    // The task's overall deadline is already behind: no new workshop deadline
    // fits unless that deadline moves too.
    slotOrderPassed() {
      return Boolean(this.slotStageLimit && this.slotStageLimit < this.today)
    },
    // The task deadline cuts into the free days, so moving it is offered.
    slotLimitBinds() {
      const limit = this.slotStageLimit
      return Boolean(
        limit &&
          (limit < this.today ||
            limit < this.slot?.end ||
            limit < this.slot?.deadline)
      )
    },
    slotExtends() {
      return Boolean(
        this.slot?.extendOrder &&
          this.slotStageLimit &&
          this.slot.deadline > this.slotStageLimit
      )
    },
    // Without moving the task deadline the chosen days do not fit.
    slotBlocked() {
      const limit = this.slotStageLimit
      return Boolean(
        limit &&
          !this.slot?.extendOrder &&
          (limit < this.today || this.slot?.deadline > limit)
      )
    },
    slotDeadlineMax() {
      const limit = this.slotStageLimit
      return limit && !this.slot?.extendOrder && limit >= this.today
        ? limit
        : null
    },
  },
  watch: {
    factoryId() {
      this.operatorFilter = ''
      this.booking.factory_order_id = ''
      this.booking.operator_id = ''
      this.closeDetail()
    },
    // A picked day that is no longer on screen stops filtering the details.
    days(days) {
      if (this.focusDay && !days.includes(this.focusDay)) this.focusDay = ''
    },
    scope() {
      ++this.request
      this.factoryId =
        this.operatorFilter =
        this.actionError =
        this.bookingSaved =
        this.placedText =
          ''
      this.slot = null
      this.busy = false
      this.data = empty()
      this.closeDetail()
      this.booking = {
        operator_id: '',
        factory_order_id: '',
        day: '',
        start: '',
        end: '',
      }
      this.refresh()
    },
  },
  mounted() {
    this.refresh()
    this.timer = setInterval(() => {
      if (!document.hidden && !this.busy && !this.loading) this.refresh()
    }, 30000)
    if (typeof window !== 'undefined')
      window.addEventListener('resize', this.measure)
  },
  beforeDestroy() {
    ++this.request
    clearInterval(this.timer)
    if (typeof window !== 'undefined')
      window.removeEventListener('resize', this.measure)
  },
  methods: {
    fill(text, values) {
      return String(text).replace(/\{(\w+)\}/g, (match, key) =>
        values[key] === undefined ? match : values[key]
      )
    },
    slotOpen(row, day) {
      return (
        (this.picker || this.canPlace || this.canCreate) &&
        day >= this.today &&
        !row.counts[day]
      )
    },
    operatorFactoryIds(id) {
      return this.data.factories
        .filter((f) =>
          (f.operators || []).some((op) => Number(op.id) === Number(id))
        )
        .map((f) => Number(f.id))
    },
    workshopsOf(id) {
      return this.data.factories
        .filter((f) =>
          (f.operators || []).some((op) => Number(op.id) === Number(id))
        )
        .map((f) => f.name)
    },
    openSlot(row, day) {
      if (!this.slotOpen(row, day)) return
      const range = freeSegment(row.jobs, day, this.today)
      if (!range) return
      const slot = {
        operator: { id: Number(row.operator.id), name: row.operator.name },
        factoryIds: this.operatorFactoryIds(row.operator.id),
        start: range.start,
        end: range.end,
      }
      if (this.picker) {
        this.$emit('pick', slot)
        return
      }
      this.placedText = this.slotError = ''
      this.slot = {
        ...slot,
        late: row.late,
        stageId: '',
        startsOn: range.start,
        deadline: range.end,
        extendOrder: false,
      }
      this.$nextTick(() => this.$refs.slotDialog?.focus())
    },
    closeSlot() {
      if (!this.placing) this.slot = null
    },
    // A newly chosen job: when its task deadline has passed, the only way to
    // give it new days is to move that deadline too, so that is preselected.
    syncSlotDeadline() {
      this.slot.extendOrder = this.slotOrderPassed
      this.syncSlotLimit()
    },
    // Keep the workshop deadline inside the task deadline unless it moves.
    syncSlotLimit() {
      const limit = this.slotStageLimit
      if (
        limit &&
        !this.slot.extendOrder &&
        limit >= this.today &&
        this.slot.deadline > limit
      )
        this.slot.deadline = limit
      if (this.slot.startsOn > this.slot.deadline)
        this.slot.startsOn = this.slot.deadline
    },
    // Hours can be planned even when no new deadline fits.
    planFromSlot() {
      const stage = this.slotStage
      const day = this.slot?.startsOn || this.slot?.start
      if (!stage || !day) return
      this.slot = null
      this.planJob(stage, day)
    },
    candidateText(task) {
      const due = task.due_date
        ? ` · ${this.barDue(this.withWindow(task))}`
        : ''
      return `${this.jobTitle(task)} · ${task.workshop}${due}`
    },
    withWindow(task) {
      return { ...task, window: jobWindow(task, this.today) }
    },
    async placeStage() {
      const slot = this.slot
      const stage = this.slotStage
      if (this.placing || !slot || !stage || this.slotBlocked) return
      const extend = this.slotExtends
      this.placing = true
      this.slotError = ''
      try {
        await this.$axios.$post('/api/operator-calendar/place', {
          factory_order_id: stage.id,
          operator_id: slot.operator.id,
          starts_on: slot.startsOn || null,
          deadline: slot.deadline,
          extend_order: extend,
        })
        if (this._isDestroyed) return
        this.placedText = `${this.t.placed}: ${this.jobTitle(stage)} · ${
          stage.workshop
        } → ${slot.operator.name}, ${this.formatDay(
          slot.startsOn
        )} – ${this.formatDay(slot.deadline)}${
          extend
            ? ` · ${this.fill(this.t.taskDeadline, {
                date: this.formatDay(slot.deadline),
              })}`
            : ''
        }`
        this.slot = null
        await this.refresh()
        this.showPlanned(Number(slot.operator.id), slot.startsOn || slot.start)
      } catch (e) {
        if (this.slot === slot) this.slotError = this.message(e)
      } finally {
        this.placing = false
      }
    },
    createFromSlot() {
      const slot = this.slot
      if (!slot) return
      const filtered = Number(this.factoryId)
      const factory = slot.factoryIds.includes(filtered)
        ? filtered
        : slot.factoryIds[0]
      const query = {
        operator_id: String(slot.operator.id),
        start: slot.start,
        end: slot.end,
      }
      if (factory) query.factory_id = String(factory)
      this.slot = null
      const path = this.localePath
        ? this.localePath(this.createPath)
        : this.createPath
      this.$router.push({ path, query })
    },
    setPeriod(period) {
      if (this.period === period) return
      this.period = period
      this.refresh()
    },
    shiftDate(direction) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) this.date = this.today
      this.date =
        this.period === 'month'
          ? moveDay(this.date, { months: direction })
          : moveDay(this.date, {
              days: direction * (this.period === 'day' ? 1 : 7),
            })
      this.refresh()
    },
    goToday() {
      this.date = this.today
      this.refresh()
    },
    formatDay(day) {
      return day ? formatWallDate(day) : ''
    },
    loadText(count) {
      return count ? jobCount(count, this.locale) : this.t.freeDay
    },
    hoursText(minutes) {
      return `${Math.round((minutes / 60) * 10) / 10} ${this.t.hours}`
    },
    statusText(row) {
      if (!row.jobs.length) return this.t.statusNoWork
      if (row.freeFrom === this.today) return this.t.statusFree
      if (row.freeFrom)
        return this.fill(this.t.statusFreeFrom, {
          date: this.formatDay(row.freeFrom),
        })
      return this.fill(this.t.statusBusyLong, { days: FREE_LOOKAHEAD })
    },
    statusTone(row) {
      if (!row.jobs.length || row.freeFrom === this.today) return 'green'
      return row.freeFrom ? 'blue' : 'red'
    },
    busyText(row) {
      return this.fill(this.t.busyDays, {
        busy: row.busyDays,
        total: row.upcomingDays,
      })
    },
    weekdayOf(day) {
      return this.labelDay(day).split(', ')[0]
    },
    dateOf(day) {
      return this.labelDay(day).split(', ').slice(1).join(', ') || day
    },
    headTitle(day) {
      const totals = this.dayTotals[day]
      return totals
        ? `${this.labelDay(day)} · ${this.t.freeOperators}: ${totals.free}`
        : this.labelDay(day)
    },
    cellTitle(row, cell) {
      const head = `${row.operator.name} · ${this.labelDay(cell.day)}`
      if (!cell.count)
        return cell.slot
          ? `${head} · ${this.t.freeDay} · ${this.t.pickHint}`
          : `${head} · ${this.t.freeDay}`
      return [
        `${head} · ${this.loadText(cell.count)}`,
        ...cell.jobs.map((job) => {
          const hours = this.timesOn(job, cell.day)
          return `${this.jobTitle(job)} · ${job.workshop}${
            job.window?.overdue ? ` · ${this.t.late}` : ''
          }${hours ? ` · ${this.t.reserved}: ${hours}` : ''}`
        }),
      ].join('\n')
    },
    // "10:00–12:00, 14:00–15:00": the hours reserved for a job on one day.
    timesOn(job, day) {
      return (job.reservations || [])
        .filter((b) => String(b.starts_at).slice(0, 10) === day)
        .map((b) => `${this.time(b.starts_at)}–${this.time(b.ends_at)}`)
        .join(', ')
    },
    // Every planned slot of a job from today on, earliest first.
    plannedText(job) {
      return (job.reservations || [])
        .filter((b) => String(b.ends_at).slice(0, 10) >= this.today)
        .sort((a, b) => String(a.starts_at).localeCompare(String(b.starts_at)))
        .map(
          (b) =>
            `${this.formatDay(String(b.starts_at).slice(0, 10))} ${this.time(
              b.starts_at
            )}–${this.time(b.ends_at)}`
        )
        .join(', ')
    },
    isUndated(job) {
      return !job.window && !(job.booked && job.booked.length)
    },
    // A free day takes work; a busy one shows what holds the operator then.
    cellClick(row, cell) {
      if (cell.slot) return this.openSlot(row, cell.day)
      if (cell.count) this.toggleRow(row, cell.day)
    },
    toggleRow(row, day = '') {
      const id = row.operator.id
      if (this.expanded === id && this.focusDay === day) {
        this.closeDetail()
        return
      }
      this.expanded = id
      this.focusDay = day
      this.measure()
    },
    measure() {
      this.visibleWidth = this.$refs.scroll?.clientWidth || 0
    },
    // On a narrow screen the days scroll; start next to today, not on the 1st.
    scrollToToday() {
      const box = this.$refs.scroll
      const grid = box?.firstElementChild
      const index = this.days.indexOf(this.today)
      if (!grid || index < 1 || box.scrollWidth <= box.clientWidth) return
      const names = grid.firstElementChild?.offsetWidth || 0
      const column = (grid.scrollWidth - names) / this.days.length
      box.scrollLeft = Math.max(0, column * (index - 1))
    },
    closeDetail() {
      this.expanded = null
      this.focusDay = ''
    },
    // Overdue first, then by deadline; a picked day shows only its jobs.
    detailJobs(row) {
      const day = this.focusDay
      const jobs = day ? row.jobs.filter((job) => holds(job, day)) : row.jobs
      return [...jobs].sort(
        (a, b) =>
          Number(Boolean(b.window?.overdue)) -
            Number(Boolean(a.window?.overdue)) ||
          (a.due_date || '9999').localeCompare(b.due_date || '9999') ||
          a.id - b.id
      )
    },
    jobDates(job) {
      if (!job.window) return this.isUndated(job) ? this.t.undated : ''
      const due = `${this.deadlineLabel(job)}: ${this.dueText(job)}`
      return job.window.start === job.due_date
        ? due
        : `${this.t.start}: ${this.formatDay(job.window.start)} · ${due}`
    },
    barState(job) {
      if (job.window?.overdue) return 'late'
      if (job.blocked) return 'waiting'
      return job.helper ? 'helper' : 'active'
    },
    // An order deadline can carry a time of day; a workshop deadline is a date.
    dueText(job) {
      if (
        job.deadline_source === 'order' &&
        job.order_due_at &&
        !isDateOnly(job.order_due_at) &&
        !String(job.order_due_at).includes(' 00:00')
      )
        return formatWallDateTime(job.order_due_at)
      return this.formatDay(job.due_date)
    },
    barDue(job) {
      if (!job.window) return this.isUndated(job) ? this.t.undated : ''
      return job.window.overdue
        ? `${this.t.late} · ${this.formatDay(job.due_date)}`
        : `${this.deadlineLabel(job)}: ${this.dueText(job)}`
    },
    jobTooltip(job) {
      return [
        this.jobTitle(job),
        job.workshop,
        job.engineer,
        job.stage_due_date
          ? `${this.t.stageDue}: ${this.formatDay(job.stage_due_date)}`
          : '',
        job.order_due_at
          ? `${this.t.orderDue}: ${formatWallDateTime(job.order_due_at)}`
          : '',
        job.blocked ? this.t.waiting : '',
        job.helper ? this.c.helper : '',
      ]
        .filter(Boolean)
        .join('\n')
    },
    openBar(bar) {
      if (!bar.job.can_edit) return
      this.planJob(
        bar.job,
        bar.job.window.start > this.today ? bar.job.window.start : this.today
      )
    },
    // Tasks are named by their visible order number and, when the server
    // knows them, the project and item names instead of a code like 990.01.
    jobTitle(job) {
      return `#${job.order_number || job.order_id} · ${job.title || job.name}`
    },
    bookingTitle(booking) {
      return `#${booking.order_number || booking.order_id} · ${
        booking.title || booking.task
      }`
    },
    planJob(job, day) {
      this.booking.factory_order_id = job.id
      this.selectTask()
      this.booking.day = day < this.today ? this.today : day
      this.syncBookingDay()
      this.$refs.planner.open = true
      this.$refs.planner.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
    async teamSaved() {
      await this.refresh()
      this.booking.operator_id = this.selectedStage?.operator_id || ''
    },
    syncBookingDay() {
      if (this.booking.day && !this.days.includes(this.booking.day)) {
        this.date = this.booking.day
        this.refresh()
      }
    },
    selectTask() {
      this.teamDirty = false
      this.bookingSaved = ''
      this.booking.operator_id = this.selectedStage?.operator_id || ''
      this.booking.day = this.date < this.today ? this.today : this.date
      this.booking.start = this.booking.end = ''
      this.syncBookingDay()
      this.actionError = ''
    },
    time(v) {
      return String(v).slice(11, 16)
    },
    labelDay(day) {
      return calendarDayLabel(day, this.locale)
    },
    assignments(id) {
      return this.groupedJobs.get(Number(id)) || []
    },
    deadlineLabel(job) {
      return !job.due_date
        ? this.t.undated
        : job.deadline_source === 'stage'
        ? this.t.stageDue
        : this.t.orderDue
    },
    message(e) {
      return (
        Object.values(e.response?.data?.errors || {}).flat()[0] ||
        e.response?.data?.message ||
        this.t.fail
      )
    },
    async refresh() {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date)) return
      const request = ++this.request
      this.loading = true
      this.error = ''
      try {
        const data = await this.$axios.$get('/api/operator-calendar', {
          params: { from: this.days[0], to: this.days[this.days.length - 1] },
        })
        if (request === this.request) {
          this.data = data
          const view = `${this.period}:${this.days[0]}`
          if (view !== this.scrolledView) {
            this.scrolledView = view
            this.$nextTick(this.scrollToToday)
          }
        }
      } catch (e) {
        if (request === this.request) this.error = this.message(e)
      } finally {
        if (request === this.request) this.loading = false
      }
    },
    async mutate(fn) {
      if (this.busy) return
      const scope = this.scope
      this.busy = true
      this.actionError = ''
      try {
        await fn()
        if (scope === this.scope && !this._isDestroyed) {
          await this.refresh()
          // Placed or planned work changes the page's other lists too.
          this.$emit('changed')
        }
      } catch (e) {
        if (scope === this.scope && !this._isDestroyed)
          this.actionError = this.message(e)
      } finally {
        if (scope === this.scope && !this._isDestroyed) this.busy = false
      }
    },
    async book() {
      if (this.teamDirty || this.loading || !this.selectedStage?.operator_id)
        return
      const scope = this.scope
      const operator = Number(this.booking.operator_id)
      const day = this.booking.day
      this.bookingSaved = ''
      await this.mutate(async () => {
        await this.$axios.$post('/api/operator-calendar/bookings', {
          allow_without_shift: true,
          team_version: this.selectedStage.team_version,
          assign_if_unassigned:
            !!this.selectedStage && !this.selectedStage.operator_id,
          factory_order_id: this.booking.factory_order_id,
          operator_id: this.booking.operator_id,
          starts_at: `${this.booking.day} ${this.booking.start}`,
          ends_at: `${this.booking.day} ${this.booking.end}`,
        })
        if (scope === this.scope)
          this.bookingSaved =
            this.booking.day + ' ' + this.booking.start + '–' + this.booking.end
      })
      // Show the work on its new day right away, with that day's jobs open.
      if (this.bookingSaved && scope === this.scope && !this._isDestroyed)
        this.showPlanned(operator, day)
    },
    showPlanned(operator, day) {
      if (!this.days.includes(day)) {
        this.date = day
        this.refresh()
      }
      this.expanded = operator
      this.focusDay = day
      this.measure()
      this.$nextTick(() =>
        this.$refs.scroll?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'center',
        })
      )
    },
    remove(kind, id) {
      if (window.confirm(this.t.confirm))
        return this.mutate(() =>
          this.$axios.$delete(`/api/operator-calendar/${kind}/${id}`)
        )
    },
  },
}
</script>
<style scoped>
.calendar-label {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.calendar-how {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}
.calendar-how summary {
  width: fit-content;
  cursor: pointer;
  color: #334155;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.calendar-how p {
  margin-top: 6px;
}
.calendar-icon-button {
  display: inline-flex;
  width: 40px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #334155;
  font-size: 20px;
  line-height: 1;
}
.calendar-icon-button:hover:not(:disabled) {
  background: #f8fafc;
}
.calendar-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.calendar-segment {
  padding: 6px 12px;
  border-radius: 9px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}
.calendar-segment[aria-pressed='true'] {
  background: #0f172a;
  color: #fff;
}
.calendar-icon-button:focus-visible,
.calendar-segment:focus-visible,
.calendar-name:focus-visible,
.calendar-cell:focus-visible,
.calendar-detail__close:focus-visible,
.calendar-job__action:focus-visible,
.calendar-item__action:focus-visible,
.calendar-how summary:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 2px;
}
.calendar-alert {
  padding: 12px 16px;
  border: 1px solid #fecdd3;
  border-radius: 16px;
  background: #fff1f2;
  color: #be123c;
  font-size: 14px;
  font-weight: 600;
}

/* Today in numbers. */
.calendar-stat {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}
.calendar-stat dt {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.calendar-stat dd {
  margin: 2px 0 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
}
.calendar-stat__of {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
}
.calendar-stat[data-tone='green'] dd {
  color: #047857;
}
.calendar-stat[data-tone='blue'] dd {
  color: #1d4ed8;
}
.calendar-stat[data-tone='red'] {
  border-color: #fecdd3;
  background: #fff1f2;
}
.calendar-stat[data-tone='red'] dd {
  color: #be123c;
}
.calendar-stat[data-tone='amber'] {
  border-color: #fde68a;
  background: #fffbeb;
}
.calendar-stat[data-tone='amber'] dd {
  color: #b45309;
}

/* Operators down, days across: one coloured cell per operator and day. */
.calendar-scroll {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
}
.calendar-grid {
  --name-width: 15rem;
  display: grid;
  min-width: min-content;
  grid-template-columns:
    var(--name-width)
    repeat(var(--days, 7), minmax(var(--cell-min, 3.25rem), 1fr));
}
.calendar-corner,
.calendar-name {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 1px 0 0 #e2e8f0;
}
.calendar-corner {
  display: flex;
  align-items: flex-end;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.calendar-head {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 1px;
  padding: 8px 2px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  text-align: center;
}
.calendar-head[data-past='true'] {
  color: #94a3b8;
}
.calendar-head[data-today='true'] {
  background: #dbeafe;
  color: #1d4ed8;
}
.calendar-head__weekday {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.calendar-head__date {
  font-weight: 800;
  white-space: nowrap;
}
.calendar-head__free {
  margin-top: 2px;
  padding: 0 6px;
  border-radius: 999px;
  background: #dcfce7;
  color: #047857;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}
.calendar-head__free[data-none='true'] {
  background: #f1f5f9;
  color: #94a3b8;
}
.calendar-empty {
  grid-column: 1 / -1;
  padding: 24px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
}
.calendar-name {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 3px;
  padding: 10px 14px;
  border-top: 1px solid #eef2f7;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
  text-align: left;
  transition: background 150ms ease;
}
.calendar-name:hover,
.calendar-name[aria-expanded='true'] {
  background: #f8fafc;
}
.calendar-name[aria-expanded='true'] {
  box-shadow: inset 3px 0 0 #0f172a, 1px 0 0 #e2e8f0;
}
.calendar-name__person {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.calendar-late-badge {
  flex-shrink: 0;
  padding: 0 7px;
  border-radius: 999px;
  background: #e11d48;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  line-height: 18px;
}
.calendar-name__status {
  font-weight: 700;
}
.calendar-name__status[data-tone='green'] {
  color: #047857;
}
.calendar-name__status[data-tone='blue'] {
  color: #1d4ed8;
}
.calendar-name__status[data-tone='red'] {
  color: #be123c;
}
.calendar-name__meta {
  color: #64748b;
  font-size: 11px;
}
.calendar-meter {
  display: block;
  height: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}
.calendar-meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #3b82f6;
}
.calendar-meter[data-tone='amber'] span {
  background: #f59e0b;
}
.calendar-meter[data-tone='red'] span {
  background: #ef4444;
}
.calendar-cell {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 66px;
  align-items: center;
  justify-content: center;
  margin: 3px 2px;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 900;
  line-height: 1;
  transition: box-shadow 150ms ease, background 150ms ease;
}
.calendar-cell[data-level='free'] {
  background: #ecfdf5;
  color: #059669;
}
.calendar-cell[data-level='light'] {
  background: #dbeafe;
  color: #1d4ed8;
}
.calendar-cell[data-level='busy'] {
  background: #fde68a;
  color: #92400e;
}
.calendar-cell[data-level='heavy'] {
  background: #fecaca;
  color: #b91c1c;
}
.calendar-cell[data-past='true'] {
  opacity: 0.4;
}
.calendar-cell[data-today='true'] {
  box-shadow: inset 0 0 0 2px #2563eb;
}
.calendar-cell[data-reserved='true']::before {
  position: absolute;
  top: 4px;
  left: 6px;
  right: 6px;
  height: 3px;
  border-radius: 999px;
  background: #2563eb;
  content: '';
}
button.calendar-cell {
  cursor: pointer;
}
button.calendar-cell:hover {
  box-shadow: inset 0 0 0 2px #0f172a;
}
.calendar-cell[data-slot='true'] {
  box-shadow: inset 0 0 0 1px #6ee7b7;
}
.calendar-cell[data-slot='true']:hover {
  background: #bbf7d0;
  box-shadow: inset 0 0 0 2px #10b981;
}
.calendar-cell[data-focus='true'] {
  box-shadow: inset 0 0 0 3px #0f172a;
}
.calendar-cell__due {
  position: absolute;
  bottom: 7px;
  left: 50%;
  width: 7px;
  height: 7px;
  margin-left: -3.5px;
  border-radius: 50%;
  background: currentColor;
}
.calendar-cell__late {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e11d48;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
}
/* A month has narrow columns: the colour and the number carry the meaning. */
[data-period='month'] .calendar-grid {
  --name-width: 12rem;
}
[data-period='month'] .calendar-head {
  padding: 6px 0;
}
[data-period='month'] .calendar-head__weekday {
  font-size: 8px;
  letter-spacing: 0;
}
[data-period='month'] .calendar-head__free {
  padding: 0 4px;
}
[data-period='month'] .calendar-cell {
  min-height: 58px;
  margin: 3px 1px;
  border-radius: 6px;
  font-size: 12px;
}
[data-period='month'] .calendar-cell__due {
  bottom: 5px;
  width: 5px;
  height: 5px;
  margin-left: -2.5px;
}
[data-period='month'] .calendar-cell__late {
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  font-size: 8px;
}
/* One day: each cell lists the jobs that hold the operator. */
[data-period='day'] .calendar-cell {
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  text-align: left;
}
.calendar-cell__free {
  font-weight: 800;
  text-align: center;
}
.calendar-chip {
  display: block;
  min-width: 0;
  padding: 6px 9px;
  border-left: 4px solid #2563eb;
  border-radius: 8px;
  background: rgb(255 255 255 / 72%);
  color: #1e3a8a;
  font-size: 11px;
}
.calendar-chip[data-state='late'] {
  border-left-color: #e11d48;
  color: #9f1239;
}
.calendar-chip[data-state='waiting'] {
  border-left-style: dashed;
  border-left-color: #94a3b8;
  color: #475569;
}
.calendar-chip[data-state='helper'] {
  border-left-color: #7c3aed;
  color: #4c1d95;
}

/* The jobs of one operator, opened under their row. */
.calendar-detail {
  position: sticky;
  left: 0;
  z-index: 3;
  grid-column: 1 / -1;
  justify-self: start;
  width: var(--visible-width, auto);
  min-width: 0;
  max-width: 100%;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.calendar-detail__close {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #64748b;
}
.calendar-detail__close:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.calendar-job {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #2563eb;
  border-radius: 12px;
  background: #fff;
  color: #0f172a;
}
.calendar-job[data-state='late'] {
  border-left-color: #e11d48;
  background: #fff1f2;
}
.calendar-job[data-state='waiting'] {
  border-left-style: dashed;
  border-left-color: #94a3b8;
}
.calendar-job[data-state='helper'] {
  border-left-color: #7c3aed;
}
.calendar-job[data-state='undated'] {
  border-left-color: #cbd5e1;
}
.calendar-job__action {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}
.calendar-job__action:hover {
  background: #f1f5f9;
}
.calendar-tag {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.calendar-tag[data-tone='red'] {
  background: #ffe4e6;
  color: #be123c;
}
.calendar-tag[data-tone='slate'] {
  background: #f1f5f9;
  color: #475569;
}
.calendar-tag[data-tone='violet'] {
  background: #f3efff;
  color: #5b21b6;
}
.calendar-item {
  display: block;
  padding: 7px 9px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.calendar-item[data-tone='blue'] {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e3a8a;
}
.calendar-item__action {
  margin-top: 6px;
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Legend swatches use the same colours as the cells. */
.calendar-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.calendar-swatch {
  position: relative;
  display: inline-flex;
  width: 22px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: #ecfdf5;
  box-shadow: inset 0 0 0 1px #6ee7b7;
  color: #059669;
  font-size: 10px;
  font-weight: 900;
}
.calendar-swatch[data-level='light'] {
  background: #dbeafe;
  box-shadow: none;
  color: #1d4ed8;
}
.calendar-swatch[data-level='busy'] {
  background: #fde68a;
  box-shadow: none;
  color: #92400e;
}
.calendar-swatch[data-level='heavy'] {
  background: #fecaca;
  box-shadow: none;
  color: #b91c1c;
}
.calendar-swatch[data-past='true'] {
  background: #e2e8f0;
  box-shadow: none;
  opacity: 0.6;
}
.calendar-swatch--due {
  background: #dbeafe;
  box-shadow: none;
}
.calendar-swatch--due::after {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1d4ed8;
  content: '';
}
.calendar-swatch--late {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e11d48;
  box-shadow: none;
  color: #fff;
}
.calendar-swatch--reserved {
  background: #dbeafe;
  box-shadow: none;
}
.calendar-swatch--reserved::before {
  position: absolute;
  top: 2px;
  left: 3px;
  right: 3px;
  height: 3px;
  border-radius: 999px;
  background: #2563eb;
  content: '';
}

.calendar-panel {
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
}
.calendar-panel__summary {
  cursor: pointer;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}
@media (max-width: 640px) {
  .calendar-grid,
  [data-period] .calendar-grid {
    --name-width: 9.5rem;
  }
  .calendar-corner,
  .calendar-name {
    padding-left: 10px;
    padding-right: 10px;
  }
  .calendar-name__meta {
    display: none;
  }
}

/* The app switches themes with a .dark class, like assets/css/main.css. */
.dark .calendar-label,
.dark .calendar-how {
  color: #94a3b8;
}
.dark .calendar-how summary {
  color: #cbd5e1;
}
.dark .calendar-icon-button,
.dark .calendar-panel,
.dark .calendar-stat,
.dark .calendar-scroll,
.dark .calendar-job,
.dark .calendar-job__action {
  border-color: #334155;
  background: #0f172a;
  color: #e2e8f0;
}
.dark .calendar-stat dd {
  color: #f8fafc;
}
.dark .calendar-stat[data-tone='green'] dd {
  color: #6ee7b7;
}
.dark .calendar-stat[data-tone='blue'] dd {
  color: #93c5fd;
}
.dark .calendar-stat[data-tone='red'] {
  border-color: #881337;
  background: #4c0519;
}
.dark .calendar-stat[data-tone='red'] dd {
  color: #fecdd3;
}
.dark .calendar-stat[data-tone='amber'] {
  border-color: #78350f;
  background: #422006;
}
.dark .calendar-stat[data-tone='amber'] dd {
  color: #fde68a;
}
.dark .calendar-corner,
.dark .calendar-head {
  border-color: #1e293b;
  background: #111c30;
  color: #cbd5e1;
}
.dark .calendar-head[data-past='true'] {
  color: #64748b;
}
.dark .calendar-head[data-today='true'] {
  background: #172554;
  color: #bfdbfe;
}
.dark .calendar-head__free {
  background: #052e2b;
  color: #6ee7b7;
}
.dark .calendar-head__free[data-none='true'] {
  background: #1e293b;
  color: #64748b;
}
.dark .calendar-corner,
.dark .calendar-name {
  box-shadow: 1px 0 0 #1e293b;
}
.dark .calendar-name {
  border-color: #1e293b;
  background: #0f172a;
  color: #f8fafc;
}
.dark .calendar-name:hover,
.dark .calendar-name[aria-expanded='true'] {
  background: #111c30;
}
.dark .calendar-name[aria-expanded='true'] {
  box-shadow: inset 3px 0 0 #f8fafc, 1px 0 0 #1e293b;
}
.dark .calendar-name__status[data-tone='green'] {
  color: #6ee7b7;
}
.dark .calendar-name__status[data-tone='blue'] {
  color: #93c5fd;
}
.dark .calendar-name__status[data-tone='red'] {
  color: #fda4af;
}
.dark .calendar-name__meta {
  color: #94a3b8;
}
.dark .calendar-meter {
  background: #1e293b;
}
.dark .calendar-cell[data-level='free'],
.dark .calendar-swatch {
  background: #052e2b;
  color: #6ee7b7;
}
.dark .calendar-cell[data-level='light'],
.dark .calendar-swatch[data-level='light'] {
  background: #1e3a8a;
  color: #dbeafe;
}
.dark .calendar-cell[data-level='busy'],
.dark .calendar-swatch[data-level='busy'] {
  background: #78350f;
  color: #fef3c7;
}
.dark .calendar-cell[data-level='heavy'],
.dark .calendar-swatch[data-level='heavy'] {
  background: #881337;
  color: #ffe4e6;
}
.dark .calendar-cell[data-today='true'] {
  box-shadow: inset 0 0 0 2px #60a5fa;
}
.dark button.calendar-cell:hover,
.dark .calendar-cell[data-focus='true'] {
  box-shadow: inset 0 0 0 3px #f8fafc;
}
.dark .calendar-cell[data-slot='true']:hover {
  background: #064e3b;
}
.dark .calendar-chip {
  background: rgb(15 23 42 / 60%);
  color: #dbeafe;
}
.dark .calendar-detail {
  border-color: #1e293b;
  background: #111c30;
}
.dark .calendar-detail__close:hover {
  background: #1e293b;
  color: #f8fafc;
}
.dark .calendar-job[data-state='late'] {
  background: #4c0519;
}
.dark .calendar-job__action:hover {
  background: #1e293b;
}
.dark .calendar-tag[data-tone='red'] {
  background: #4c0519;
  color: #fecdd3;
}
.dark .calendar-tag[data-tone='slate'] {
  background: #1e293b;
  color: #cbd5e1;
}
.dark .calendar-tag[data-tone='violet'] {
  background: #2e1065;
  color: #ddd6fe;
}
.dark .calendar-item[data-tone='blue'] {
  border-color: #1e3a8a;
  background: #172554;
  color: #bfdbfe;
}
.dark .calendar-item__action {
  color: #93c5fd;
}
.dark .calendar-segment {
  color: #cbd5e1;
}
.dark .calendar-segment[aria-pressed='true'] {
  background: #f8fafc;
  color: #020617;
}
.dark .calendar-alert {
  border-color: #881337;
  background: #4c0519;
  color: #fecdd3;
}
.dark .calendar-panel__summary {
  color: #f8fafc;
}
</style>
