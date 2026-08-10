<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1600px] space-y-8">
      <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Operations overview</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Կառավարման վահանակ
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Արտադրամասերի վիճակ, աշխատակիցների ծանրաբեռնվածություն, ուշացումներ և պատվերների ամբողջական վերահսկում մեկ էջում։
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div v-if="generatedAt" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            Թարմացված՝ {{ formatDateTime(generatedAt) }}
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            :disabled="dashboardLoading || ordersLoading"
            @click="refreshAll"
          >
            <svg class="h-4 w-4" :class="{ 'animate-spin': dashboardLoading || ordersLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 6v5h-5M4 18v-5h5m10.5-2a8 8 0 00-13.8-3M4.5 14a8 8 0 0013.8 3" />
            </svg>
            Թարմացնել
          </button>
        </div>
      </section>

      <section v-if="dashboardLoading && !dashboardLoaded" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="n in 8" :key="n" class="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"></div>
      </section>
      <section v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          v-for="metric in metrics"
          :key="metric.key"
          :label="metric.label"
          :value="metric.value"
          :description="metric.description"
          :icon="metric.icon"
          :tone="metric.tone"
        />
      </section>

      <section v-if="attentionOrders.length" class="rounded-[28px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-white p-5 shadow-sm dark:border-rose-950/60 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 sm:p-6">
        <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-sm font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">!</span>
              <h2 class="text-lg font-bold text-slate-950 dark:text-white">Ուշադրություն պահանջող պատվերներ</h2>
            </div>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Ուշացած, չնշանակված կամ admin հաստատման սպասող աշխատանքներ</p>
          </div>
          <button class="text-xs font-semibold text-rose-700 hover:underline dark:text-rose-300" @click="applyAttentionFilter">
            Ցույց տալ ուշացածները ֆիլտրում
          </button>
        </div>
        <div class="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          <button
            v-for="order in attentionOrders"
            :key="order.id"
            type="button"
            class="group rounded-2xl border border-rose-100 bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md dark:border-rose-950/60 dark:bg-slate-950/50 dark:hover:border-rose-900"
            @click="openOrder(order)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{{ orderNumber(order) }}</p>
                <p class="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{{ order.name || 'Առանց անվանման' }}</p>
              </div>
              <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold" :class="deadlineClass(order)">
                {{ deadlineLabel(order) }}
              </span>
            </div>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="fo in order.factory_orders || []"
                :key="fo.id"
                class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {{ fo.factory?.name || 'Factory' }} · {{ fo.operator?.name || 'չնշանակված' }}
              </span>
            </div>
          </button>
        </div>
      </section>

      <section class="grid gap-6 2xl:grid-cols-[1.2fr_1fr]">
        <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Factory health</p>
              <h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white">Արտադրամասերի վիճակ</h2>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Ակտիվ, ուշացած, չնշանակված և հաստատման սպասող աշխատանքներ</p>
            </div>
            <div class="flex gap-2">
              <select v-model="factoryHealthFilter" class="small-control">
                <option value="">Բոլոր վիճակները</option>
                <option value="critical">Կրիտիկական</option>
                <option value="attention">Ուշադրություն</option>
                <option value="healthy">Նորմալ</option>
                <option value="idle">Դատարկ</option>
              </select>
            </div>
          </div>

          <div v-if="filteredFactories.length" class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="factory in filteredFactories"
              :key="factory.id"
              type="button"
              class="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              :class="factoryCardClass(factory.health)"
              @click="filterByFactory(factory.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-slate-950 dark:text-white">{{ factory.name }}</p>
                  <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{{ factory.value || '—' }} · {{ factory.operators_count }} աշխատակից</p>
                </div>
                <span class="rounded-full px-2.5 py-1 text-[10px] font-bold" :class="factoryHealthBadge(factory.health)">
                  {{ factoryHealthLabel(factory.health) }}
                </span>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <div class="rounded-xl bg-white/70 p-2.5 dark:bg-slate-950/30">
                  <p class="text-[10px] text-slate-400">Ակտիվ</p>
                  <p class="mt-1 text-lg font-black">{{ factory.active_orders }}</p>
                </div>
                <div class="rounded-xl bg-white/70 p-2.5 dark:bg-slate-950/30">
                  <p class="text-[10px] text-slate-400">Ուշացած</p>
                  <p class="mt-1 text-lg font-black" :class="factory.overdue_orders ? 'text-rose-600 dark:text-rose-300' : ''">{{ factory.overdue_orders }}</p>
                </div>
                <div class="rounded-xl bg-white/70 p-2.5 dark:bg-slate-950/30">
                  <p class="text-[10px] text-slate-400">Չնշանակված</p>
                  <p class="mt-1 text-lg font-black" :class="factory.unassigned_orders ? 'text-amber-600 dark:text-amber-300' : ''">{{ factory.unassigned_orders }}</p>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Այսօր՝ <strong class="text-slate-700 dark:text-slate-200">{{ factory.due_today }}</strong></span>
                <span>Admin սպասում՝ <strong class="text-slate-700 dark:text-slate-200">{{ factory.awaiting_admin_confirmation }}</strong></span>
                <span>30 օրում ավարտված՝ <strong class="text-slate-700 dark:text-slate-200">{{ factory.completed_30d }}</strong></span>
              </div>
            </button>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">
            Այս ֆիլտրով արտադրամաս չկա։
          </div>
        </div>

        <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div class="mb-5">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Workload</p>
            <h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white">Աշխատակիցների ծանրաբեռնվածություն</h2>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Ցուցիչը հիմնված է ակտիվ և ուշացած պատվերների իրական քանակի վրա</p>
          </div>

          <div class="mb-4 grid gap-2 sm:grid-cols-3">
            <input v-model="operatorSearch" class="small-control sm:col-span-1" placeholder="Որոնել աշխատակցին" />
            <select v-model="operatorFactoryFilter" class="small-control">
              <option value="">Բոլոր factory-ները</option>
              <option v-for="factory in filterOptions.factories || []" :key="factory.id" :value="String(factory.id)">{{ factory.name }}</option>
            </select>
            <select v-model="workloadFilter" class="small-control">
              <option value="">Բոլոր ծանրաբեռնվածությունները</option>
              <option value="overloaded">Գերբեռնված</option>
              <option value="busy">Բարձր</option>
              <option value="normal">Նորմալ</option>
              <option value="light">Թեթև</option>
              <option value="idle">Ազատ</option>
            </select>
          </div>

          <div class="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            <button
              v-for="operator in filteredOperators"
              :key="operator.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-950/50"
              @click="filterByOperator(operator)"
            >
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {{ initials(operator.name) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex min-w-0 items-center gap-2">
                  <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ operator.name }}</p>
                  <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" :class="workloadBadge(operator.workload)">
                    {{ workloadLabel(operator.workload) }}
                  </span>
                </div>
                <p class="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{{ operator.factory?.name || '—' }} · {{ operator.role?.value || operator.role?.name || '—' }}</p>
              </div>
              <div class="grid shrink-0 grid-cols-3 gap-2 text-center">
                <div><p class="text-[9px] text-slate-400">Ակտիվ</p><p class="text-sm font-black">{{ operator.active_orders }}</p></div>
                <div><p class="text-[9px] text-slate-400">Ուշացած</p><p class="text-sm font-black" :class="operator.overdue_orders ? 'text-rose-600 dark:text-rose-300' : ''">{{ operator.overdue_orders }}</p></div>
                <div class="hidden sm:block"><p class="text-[9px] text-slate-400">30 օր</p><p class="text-sm font-black">{{ operator.completed_30d }}</p></div>
              </div>
            </button>
            <div v-if="!filteredOperators.length" class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">
              Աշխատակից չի գտնվել։
            </div>
          </div>
        </div>
      </section>

      <section id="orders-explorer" class="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
          <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Orders explorer</p>
              <h2 class="mt-1 text-xl font-bold text-slate-950 dark:text-white">Պատվերների ամբողջական որոնում</h2>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ pagination.total || 0 }} արդյունք · {{ activeFilterCount }} ակտիվ ֆիլտր</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                @click="showAdvanced = !showAdvanced"
              >
                {{ showAdvanced ? 'Թաքցնել լրացուցիչը' : 'Լրացուցիչ ֆիլտրեր' }}
              </button>
              <button
                v-if="activeFilterCount"
                type="button"
                class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
                @click="resetFilters"
              >
                Մաքրել բոլորը
              </button>
            </div>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div class="relative md:col-span-2 xl:col-span-2">
              <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="filters.search" class="control pl-10" placeholder="Համար, անվանում, նկարագրություն, հաճախորդ, ստեղծող..." />
            </div>
            <select v-model="filters.factory_id" class="control" @change="onPrimaryFilterChange">
              <option value="">Բոլոր factory-ները</option>
              <option v-for="factory in filterOptions.factories || []" :key="factory.id" :value="String(factory.id)">{{ factory.name }}</option>
            </select>
            <select v-model="filters.operator_id" class="control" @change="onPrimaryFilterChange">
              <option value="">Բոլոր աշխատակիցները</option>
              <option v-for="operator in orderOperatorOptions" :key="operator.id" :value="String(operator.id)">{{ operator.name }}</option>
            </select>
            <select v-model="filters.time_range" class="control" @change="onPrimaryFilterChange">
              <option value="">Բոլոր ժամկետները</option>
              <option value="overdue">Ուշացած</option>
              <option value="today">Այսօր</option>
              <option value="tomorrow">Վաղը</option>
              <option value="this_week">Այս շաբաթ</option>
              <option value="next_7_days">Հաջորդ 7 օրը</option>
              <option value="no_deadline">Առանց վերջնաժամկետի</option>
            </select>
          </div>

          <div v-if="showAdvanced" class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <select v-model="filters.order_status" class="control" @change="onPrimaryFilterChange">
              <option value="">Պատվերի բոլոր ստատուսները</option>
              <option v-for="status in filterOptions.order_statuses || []" :key="status" :value="status">{{ status }}</option>
            </select>
            <select v-model="filters.factory_status" class="control" @change="onPrimaryFilterChange">
              <option value="">Factory բոլոր ստատուսները</option>
              <option v-for="status in filterOptions.factory_statuses || []" :key="status.value" :value="status.value">{{ status.status_label || status.name || status.value }}</option>
            </select>
            <select v-model="filters.assignment" class="control" @change="onPrimaryFilterChange">
              <option value="">Նշանակման վիճակը</option>
              <option value="assigned">Նշանակված է</option>
              <option value="unassigned">Չի նշանակված</option>
            </select>
            <select v-model="filters.confirmation" class="control" @change="onPrimaryFilterChange">
              <option value="">Admin հաստատում</option>
              <option value="waiting">Սպասում է հաստատման</option>
              <option value="confirmed">Հաստատված է</option>
            </select>
            <select v-model="filters.creator_id" class="control" @change="onPrimaryFilterChange">
              <option value="">Բոլոր ստեղծողները</option>
              <option v-for="creator in filterOptions.creators || []" :key="creator.id" :value="String(creator.id)">{{ creator.name }}</option>
            </select>

            <label class="date-control">
              <span>Ստեղծվել է՝ սկսած</span>
              <input v-model="filters.created_from" type="date" @change="onPrimaryFilterChange" />
            </label>
            <label class="date-control">
              <span>Ստեղծվել է՝ մինչև</span>
              <input v-model="filters.created_to" type="date" @change="onPrimaryFilterChange" />
            </label>
            <label class="date-control">
              <span>Ավարտ՝ սկսած</span>
              <input v-model="filters.finish_from" type="date" @change="onPrimaryFilterChange" />
            </label>
            <label class="date-control">
              <span>Ավարտ՝ մինչև</span>
              <input v-model="filters.finish_to" type="date" @change="onPrimaryFilterChange" />
            </label>
            <select v-model="filters.sort" class="control" @change="onPrimaryFilterChange">
              <option value="newest">Նորերը սկզբում</option>
              <option value="oldest">Հները սկզբում</option>
              <option value="deadline_asc">Մոտ վերջնաժամկետը սկզբում</option>
              <option value="deadline_desc">Հեռու վերջնաժամկետը սկզբում</option>
            </select>
          </div>
        </div>

        <div class="relative min-h-[240px]">
          <div v-if="ordersLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm dark:bg-slate-900/75">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white"></span>
              Բեռնվում է...
            </div>
          </div>

          <div v-if="orders.length" class="hidden overflow-x-auto lg:block">
            <table class="w-full min-w-[1050px] text-left">
              <thead class="bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
                <tr>
                  <th class="px-6 py-3.5">Պատվեր</th>
                  <th class="px-4 py-3.5">Հաճախորդ</th>
                  <th class="px-4 py-3.5">Factory / operator</th>
                  <th class="px-4 py-3.5">Վերջնաժամկետ</th>
                  <th class="px-4 py-3.5">Ստատուս</th>
                  <th class="px-6 py-3.5 text-right">Գործողություն</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="order in orders" :key="order.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                  <td class="px-6 py-4">
                    <p class="text-xs font-bold text-slate-900 dark:text-white">{{ orderNumber(order) }}</p>
                    <p class="mt-1 max-w-[260px] truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{{ order.name || 'Առանց անվանման' }}</p>
                    <p class="mt-1 text-[10px] text-slate-400">{{ order.prefix_code?.code || '—' }} · {{ formatDate(order.created_at) }}</p>
                  </td>
                  <td class="px-4 py-4">
                    <p class="max-w-[180px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{{ clientName(order) }}</p>
                    <p class="mt-1 max-w-[180px] truncate text-[10px] text-slate-400">{{ clientEmail(order) }}</p>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex max-w-[290px] flex-wrap gap-1.5">
                      <span v-for="fo in order.factory_orders || []" :key="fo.id" class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {{ fo.factory?.name || '—' }} · {{ fo.operator?.name || 'չնշ.' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span class="rounded-full px-2.5 py-1 text-[10px] font-bold" :class="deadlineClass(order)">{{ deadlineLabel(order) }}</span>
                    <p class="mt-1 text-[10px] text-slate-400">{{ formatDate(order.dates?.finish_date) }}</p>
                  </td>
                  <td class="px-4 py-4">
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ order.status || 'pending' }}</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" @click="openOrder(order)">Դիտել</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="orders.length" class="space-y-3 p-4 lg:hidden">
            <button
              v-for="order in orders"
              :key="order.id"
              type="button"
              class="w-full rounded-2xl border border-slate-200 p-4 text-left shadow-sm dark:border-slate-800"
              @click="openOrder(order)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ orderNumber(order) }}</p>
                  <p class="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{{ order.name || 'Առանց անվանման' }}</p>
                  <p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ clientName(order) }}</p>
                </div>
                <span class="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold" :class="deadlineClass(order)">{{ deadlineLabel(order) }}</span>
              </div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <span v-for="fo in order.factory_orders || []" :key="fo.id" class="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {{ fo.factory?.name || '—' }} · {{ fo.operator?.name || 'չնշանակված' }}
                </span>
              </div>
            </button>
          </div>

          <div v-if="!ordersLoading && !orders.length" class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-400 dark:bg-slate-800">0</div>
            <p class="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">Պատվեր չի գտնվել</p>
            <p class="mt-1 max-w-md text-xs text-slate-400">Փոխեք որոնումը կամ ֆիլտրերը։</p>
          </div>
        </div>

        <div v-if="pagination.last_page > 1" class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{{ pagination.from || 0 }}–{{ pagination.to || 0 }} / {{ pagination.total || 0 }}</span>
            <select v-model.number="filters.per_page" class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950" @change="loadOrders(1)">
              <option :value="20">20</option>
              <option :value="30">30</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="flex items-center gap-1">
            <button class="page-btn" :disabled="pagination.current_page <= 1" @click="loadOrders(pagination.current_page - 1)">‹</button>
            <button v-for="page in visiblePages" :key="page" class="page-btn" :class="{ 'page-btn-active': page === pagination.current_page }" @click="loadOrders(page)">{{ page }}</button>
            <button class="page-btn" :disabled="pagination.current_page >= pagination.last_page" @click="loadOrders(pagination.current_page + 1)">›</button>
          </div>
        </div>
      </section>
    </div>

    <transition name="fade">
      <div v-if="selectedOrder" class="fixed inset-0 z-[80] flex items-stretch justify-end bg-slate-950/45 backdrop-blur-sm" @click.self="closeOrder">
        <div class="h-full w-full max-w-5xl overflow-hidden bg-white shadow-2xl dark:bg-slate-900">
          <OrderDetail :order="selectedOrder" @close="closeOrder" @saved="handleOrderSaved" />
        </div>
      </div>
    </transition>
  </main>
</template>

<script>
import MetricCard from '~/components/admin/dashboard/MetricCard.vue'
import OrderDetail from '~/components/modals/admin/OrderDetail.vue'

const emptyFilters = () => ({
  search: '',
  factory_id: '',
  operator_id: '',
  creator_id: '',
  order_status: '',
  factory_status: '',
  time_range: '',
  assignment: '',
  confirmation: '',
  created_from: '',
  created_to: '',
  finish_from: '',
  finish_to: '',
  sort: 'newest',
  per_page: 30,
})

export default {
  name: 'AdminOperationsDashboard',
  components: { MetricCard, OrderDetail },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      dashboardLoading: false,
      dashboardLoaded: false,
      ordersLoading: false,
      selectedOrder: null,
      generatedAt: '',
      summary: {},
      factories: [],
      operators: [],
      attentionOrders: [],
      filterOptions: {
        factories: [],
        operators: [],
        factory_statuses: [],
        creators: [],
        order_statuses: [],
      },
      orders: [],
      pagination: {
        current_page: 1,
        total: 0,
        per_page: 30,
        last_page: 1,
        from: 0,
        to: 0,
      },
      filters: emptyFilters(),
      showAdvanced: true,
      operatorSearch: '',
      operatorFactoryFilter: '',
      workloadFilter: '',
      factoryHealthFilter: '',
      searchTimer: null,
    }
  },
  computed: {
    metrics() {
      return [
        { key: 'active', label: 'Ակտիվ պատվերներ', value: this.summary.active_orders || 0, description: `Ընդհանուր՝ ${this.summary.total_orders || 0}`, icon: 'A', tone: 'blue' },
        { key: 'overdue', label: 'Ուշացած', value: this.summary.overdue_orders || 0, description: 'Անցած վերջնաժամկետով ակտիվ պատվերներ', icon: '!', tone: 'red' },
        { key: 'today', label: 'Այսօր ավարտվող', value: this.summary.due_today || 0, description: `Հաջորդ 7 օրը՝ ${this.summary.due_next_7_days || 0}`, icon: 'D', tone: 'amber' },
        { key: 'unassigned', label: 'Չնշանակված քայլեր', value: this.summary.unassigned_factory_steps || 0, description: 'Factory քայլեր առանց operator-ի', icon: 'U', tone: 'violet' },
        { key: 'confirmation', label: 'Admin հաստատման սպասող', value: this.summary.awaiting_admin_confirmation || 0, description: 'Ավարտված factory քայլեր, որոնք դեռ չեն հաստատվել', icon: 'C', tone: 'amber' },
        { key: 'complete', label: 'Ավարտված պատվերներ', value: this.summary.completed_orders || 0, description: `Չեղարկված՝ ${this.summary.canceled_orders || 0}`, icon: '✓', tone: 'green' },
        { key: 'nodeadline', label: 'Առանց վերջնաժամկետի', value: this.summary.without_deadline || 0, description: 'Ակտիվ պատվերներ առանց finish date-ի', icon: '—', tone: 'neutral' },
        { key: 'capacity', label: 'Արտադրական ցանց', value: this.summary.factories || 0, description: `${this.summary.factory_operators || 0} factory աշխատակից`, icon: 'F', tone: 'neutral' },
      ]
    },
    filteredFactories() {
      if (!this.factoryHealthFilter) return this.factories
      return this.factories.filter((factory) => factory.health === this.factoryHealthFilter)
    },
    filteredOperators() {
      const term = this.operatorSearch.trim().toLowerCase()
      return this.operators.filter((operator) => {
        const matchesSearch = !term || [operator.name, operator.email, operator.factory?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
        const matchesFactory = !this.operatorFactoryFilter || String(operator.factory?.id || '') === String(this.operatorFactoryFilter)
        const matchesWorkload = !this.workloadFilter || operator.workload === this.workloadFilter
        return matchesSearch && matchesFactory && matchesWorkload
      })
    },
    orderOperatorOptions() {
      if (!this.filters.factory_id) return this.filterOptions.operators || []
      return (this.filterOptions.operators || []).filter((operator) => String(operator.factory_id) === String(this.filters.factory_id))
    },
    activeFilterCount() {
      const ignored = ['sort', 'per_page']
      return Object.keys(this.filters).filter((key) => !ignored.includes(key) && String(this.filters[key] || '').trim() !== '').length
    },
    visiblePages() {
      const current = Number(this.pagination.current_page || 1)
      const last = Number(this.pagination.last_page || 1)
      const start = Math.max(1, current - 2)
      const end = Math.min(last, start + 4)
      const pages = []
      for (let page = Math.max(1, end - 4); page <= end; page += 1) pages.push(page)
      return pages
    },
  },
  watch: {
    'filters.search'() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.loadOrders(1), 350)
    },
    'filters.factory_id'(value, oldValue) {
      if (value !== oldValue && this.filters.operator_id) {
        const valid = this.orderOperatorOptions.some((operator) => String(operator.id) === String(this.filters.operator_id))
        if (!valid) this.filters.operator_id = ''
      }
    },
  },
  async created() {
    await Promise.all([this.loadDashboard(), this.loadOrders(1)])
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
  methods: {
    async loadDashboard() {
      this.dashboardLoading = true
      try {
        const { data } = await this.$axios.get('/api/admin/dashboard')
        this.summary = data.summary || {}
        this.factories = data.factories || []
        this.operators = data.operators || []
        this.attentionOrders = data.attention_orders || []
        this.filterOptions = data.filters || this.filterOptions
        this.generatedAt = data.generated_at || ''
        this.dashboardLoaded = true
      } catch (error) {
        this.$notify?.({ type: 'error', text: error?.response?.data?.message || 'Չհաջողվեց բեռնել admin dashboard-ը' })
      } finally {
        this.dashboardLoading = false
      }
    },
    async loadOrders(page = 1) {
      this.ordersLoading = true
      try {
        const params = { page, ...this.filters }
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] === null || typeof params[key] === 'undefined') delete params[key]
        })
        const { data } = await this.$axios.get('/api/admin/dashboard/orders', { params })
        this.orders = data.orders || []
        this.pagination = data.pagination || this.pagination
      } catch (error) {
        this.orders = []
        this.$notify?.({ type: 'error', text: error?.response?.data?.message || 'Չհաջողվեց բեռնել պատվերները' })
      } finally {
        this.ordersLoading = false
      }
    },
    async refreshAll() {
      await Promise.all([this.loadDashboard(), this.loadOrders(this.pagination.current_page || 1)])
    },
    onPrimaryFilterChange() {
      this.loadOrders(1)
    },
    resetFilters() {
      this.filters = emptyFilters()
      this.loadOrders(1)
    },
    applyAttentionFilter() {
      this.filters.time_range = 'overdue'
      this.loadOrders(1)
      this.$nextTick(() => document.getElementById('orders-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    },
    filterByFactory(factoryId) {
      this.filters.factory_id = String(factoryId)
      this.filters.operator_id = ''
      this.loadOrders(1)
      this.$nextTick(() => document.getElementById('orders-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    },
    filterByOperator(operator) {
      this.filters.factory_id = String(operator.factory?.id || '')
      this.filters.operator_id = String(operator.id)
      this.loadOrders(1)
      this.$nextTick(() => document.getElementById('orders-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    },
    async openOrder(order) {
      try {
        const { data } = await this.$axios.get(`/api/admin/order/${order.id}`)
        this.selectedOrder = data
      } catch (error) {
        this.selectedOrder = order
      }
    },
    closeOrder() {
      this.selectedOrder = null
    },
    async handleOrderSaved() {
      this.closeOrder()
      await this.refreshAll()
    },
    orderNumber(order) {
      return `#${order.order_number?.number || order.id}`
    },
    clientName(order) {
      return order.client?.user?.name || order.user?.name || '—'
    },
    clientEmail(order) {
      return order.client?.user?.email || order.user?.email || ''
    },
    deadlineDate(order) {
      const value = order.dates?.finish_date
      if (!value) return null
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? null : date
    },
    deadlineLabel(order) {
      const date = this.deadlineDate(order)
      if (!date) return 'Ժամկետ չկա'
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(date)
      deadline.setHours(0, 0, 0, 0)
      const diff = Math.round((deadline - today) / 86400000)
      if (diff < 0 && !['completed', 'canceled', 'cancelled'].includes(order.status)) return `${Math.abs(diff)} օր ուշացած`
      if (diff === 0) return 'Այսօր'
      if (diff === 1) return 'Վաղը'
      if (diff > 1) return `${diff} օր մնաց`
      return 'Ավարտված ժամկետ'
    },
    deadlineClass(order) {
      const label = this.deadlineLabel(order)
      if (label.includes('ուշացած')) return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
      if (label === 'Այսօր') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
      if (label === 'Վաղը') return 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'
      if (label === 'Ժամկետ չկա') return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    },
    factoryHealthLabel(value) {
      return { critical: 'Կրիտիկական', attention: 'Ուշադրություն', healthy: 'Նորմալ', idle: 'Դատարկ' }[value] || value
    },
    factoryHealthBadge(value) {
      return {
        critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        attention: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        healthy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        idle: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
      }[value] || 'bg-slate-100 text-slate-500'
    },
    factoryCardClass(value) {
      return {
        critical: 'border-rose-200 bg-rose-50/60 dark:border-rose-950/70 dark:bg-rose-950/15',
        attention: 'border-amber-200 bg-amber-50/60 dark:border-amber-950/70 dark:bg-amber-950/15',
        healthy: 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-950/60 dark:bg-emerald-950/10',
        idle: 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/30',
      }[value] || 'border-slate-200'
    },
    workloadLabel(value) {
      return { overloaded: 'Գերբեռնված', busy: 'Բարձր', normal: 'Նորմալ', light: 'Թեթև', idle: 'Ազատ' }[value] || value
    },
    workloadBadge(value) {
      return {
        overloaded: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        busy: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        normal: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        light: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        idle: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
      }[value] || 'bg-slate-100 text-slate-500'
    },
    initials(name) {
      return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
    },
    formatDate(value) {
      if (!value) return '—'
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(value))) return value
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return new Intl.DateTimeFormat('hy-AM', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    },
    formatDateTime(value) {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return new Intl.DateTimeFormat('hy-AM', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
    },
  },
}
</script>

<style scoped>
.control {
  @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-600 dark:focus:bg-slate-950;
}
.small-control {
  @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200;
}
.date-control {
  @apply flex min-w-0 flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-950;
}
.date-control input {
  @apply min-w-0 bg-transparent py-0.5 text-xs font-medium text-slate-700 outline-none dark:text-slate-200;
}
.page-btn {
  @apply flex h-9 min-w-[36px] items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800;
}
.page-btn-active {
  @apply border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
