<template>
  <main
    data-workspace-form
    class="order-create-page min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8"
  >
    <div v-if="$can('orders.create')" class="mx-auto max-w-7xl">
      <div
        class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">
            {{
              $t(
                isEditingMode ? 'order_create.edit_title' : 'order_create.title'
              )
            }}
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ $t('order_create.subtitle') }}
          </p>
        </div>
        <div
          class="flex items-center gap-2 text-xs font-medium"
          aria-live="polite"
        >
          <span
            class="rounded-lg px-3 py-2"
            :class="
              !isFiles
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            "
            >{{ $t('order_create.details') }}</span
          >
          <span
            class="rounded-lg px-3 py-2"
            :class="
              isFiles
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            "
            >{{ $t('order_configuration.short_title') }} ·
            {{ $t('order_configuration.optional') }}</span
          >
        </div>
      </div>

      <div
        v-if="orderFileIssue"
        role="status"
        class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <p>{{ $t(orderFileIssue) }}</p>
        <button
          v-if="pmpFilesLoadError"
          type="button"
          class="mt-2 font-semibold underline"
          @click="loadSelectedPmpFiles"
        >
          {{ $t('order_files.retry') }}
        </button>
      </div>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(260px,_1fr)_2fr]">
        <section
          class="work-card min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        >
          <h2 class="mb-5 text-base font-semibold">
            {{ $t('order_create.client_details') }}
          </h2>
          <select-with-label
            v-model="selectedClient"
            :data-value="users"
            name="orderClient"
            :label="$t('order_create.choose_client')"
            :placeholder="$t('order_create.choose_client')"
            :class="{
              'rounded-xl ring-2 ring-red-400':
                formSubmitted && !selectedClient,
            }"
          />
          <div
            v-if="selectedClient"
            class="mt-5 min-w-0 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
          >
            <div class="mb-5 flex items-start gap-3">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-700"
                >{{ selectedClient?.name?.charAt(0).toUpperCase() }}</span
              >
              <div class="min-w-0">
                <h3 class="break-words text-sm font-semibold">
                  {{ selectedClient?.name }}
                  {{ selectedClient?.last_name || '' }}
                </h3>
                <p
                  class="mt-1 break-words text-xs text-slate-500 dark:text-slate-400"
                >
                  {{
                    selectedClient?.company_name ||
                    $t('order_create.individual')
                  }}
                </p>
              </div>
            </div>
            <dl class="space-y-4 text-sm">
              <div>
                <dt class="text-xs text-slate-500 dark:text-slate-400">
                  {{ $t('order_create.phone') }}
                </dt>
                <dd class="mt-1 break-words">
                  {{ selectedClient?.phone || '—'
                  }}<span
                    v-if="selectedClient?.second_phone"
                    class="mt-1 block"
                    >{{ selectedClient.second_phone }}</span
                  >
                </dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500 dark:text-slate-400">
                  {{ $t('order_create.email') }}
                </dt>
                <dd class="mt-1 break-all">
                  {{ selectedClient?.user?.email || '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-slate-500 dark:text-slate-400">
                  {{ $t('order_create.address') }}
                </dt>
                <dd class="mt-1 break-words">
                  {{ selectedClient?.address || '—' }}
                </dd>
              </div>
            </dl>
          </div>
          <div
            v-else
            class="mt-5 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700"
          >
            <svg
              class="mx-auto mb-3 h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ $t('order_create.client_hint') }}
            </p>
          </div>
        </section>

        <section
          class="work-card min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          data-enter-scope
        >
          <h2 class="mb-5 text-base font-semibold">
            {{ $t('order_create.order_details') }}
          </h2>
          <create-order-form
            :is-editing-mode="isEditingMode"
            :success-button="$t('order_create.create')"
            :cancel-button="$t('order_create.cancel')"
            class="order-form"
            :can-proceed-to-files="canProceedToFiles"
            :can-submit="canSubmit"
            :submit-issue="submissionIssue ? $t(submissionIssue) : ''"
            :configuration-open="isFiles"
            @addButton="pmpFiles"
            @cancelButton="cancelBack"
            @selectFromOtherFactory="selectFromOtherFactory"
          >
            <template #pmpGroup>
              <div class="pmp-selector">
                <label for="pmpGroup" class="order-label"
                  >{{ $t('order_create.group_code') }}
                  <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <input
                    id="pmpGroup"
                    v-model="pmpGroupSearch"
                    type="text"
                    role="combobox"
                    autocomplete="off"
                    aria-autocomplete="list"
                    aria-controls="pmp-group-options"
                    :aria-expanded="String(isSelectPmpGroup)"
                    :aria-activedescendant="
                      isSelectPmpGroup && groupHighlight >= 0
                        ? 'pmp-group-option-' + groupHighlight
                        : null
                    "
                    class="order-input pr-10"
                    :class="{
                      'border-red-500 ring-2 ring-red-100':
                        formSubmitted && !selectedPmp,
                    }"
                    :placeholder="$t('order_create.search_group')"
                    @focus="isSelectPmpGroup = true"
                    @input="filterPmpGroups"
                    @keydown="onPmpKeydown($event, 'group')"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 px-3 text-slate-400"
                    :aria-label="$t('order_create.show_options')"
                    :aria-expanded="isSelectPmpGroup"
                    @click="isSelectPmpGroup = !isSelectPmpGroup"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>
                </div>
                <div v-if="isSelectPmpGroup" class="order-menu">
                  <ul id="pmp-group-options" role="listbox" class="py-1">
                    <li
                      v-for="(pmp, index) in filteredPmpGroups"
                      :key="pmp.id"
                      role="none"
                    >
                      <button
                        :id="'pmp-group-option-' + index"
                        type="button"
                        role="option"
                        tabindex="-1"
                        :aria-selected="String(index === groupHighlight)"
                        class="order-option"
                        :class="{ 'order-option--active': index === groupHighlight }"
                        @mouseenter="groupActive = index"
                        @click="selectPmpGroup(pmp)"
                      >
                        <span class="font-mono text-sm font-semibold">{{
                          pmp.group
                        }}</span
                        ><span
                          class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                          >{{ pmp.group_name }}</span
                        >
                      </button>
                    </li>
                    <li
                      v-if="filteredPmpGroups.length === 0"
                      class="px-4 py-4 text-center text-sm text-slate-500"
                    >
                      {{ $t('order_create.group_missing') }}
                    </li>
                  </ul>
                </div>
              </div>
            </template>
            <template #pmpName>
              <div class="pmp-selector">
                <label for="pmpRemoteNumberName" class="order-label"
                  >{{ $t('order_create.subgroup') }}
                  <span class="text-red-500">*</span></label
                >
                <div class="relative">
                  <input
                    id="pmpRemoteNumberName"
                    v-model="pmpNameSearch"
                    type="text"
                    role="combobox"
                    autocomplete="off"
                    aria-autocomplete="list"
                    aria-controls="pmp-subgroup-options"
                    :aria-expanded="String(isSelectPmpName && !!selectedPmp)"
                    :aria-activedescendant="
                      isSelectPmpName && subgroupHighlight >= 0
                        ? 'pmp-subgroup-option-' + subgroupHighlight
                        : null
                    "
                    :disabled="!selectedPmp"
                    class="order-input pr-10"
                    :class="{
                      'border-red-500 ring-2 ring-red-100':
                        formSubmitted && !selectedPmpRemoteNumber,
                    }"
                    :placeholder="$t('order_create.search_subgroup')"
                    @focus="isSelectPmpName = !!selectedPmp"
                    @input="filterPmpNames"
                    @keydown="onPmpKeydown($event, 'subgroup')"
                  />
                  <button
                    type="button"
                    :disabled="!selectedPmp"
                    class="absolute inset-y-0 right-0 px-3 text-slate-400 disabled:opacity-40"
                    :aria-label="$t('order_create.show_options')"
                    :aria-expanded="isSelectPmpName"
                    @click="isSelectPmpName = !isSelectPmpName"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </button>
                </div>
                <div v-if="isSelectPmpName && selectedPmp" class="order-menu">
                  <ul id="pmp-subgroup-options" role="listbox" class="py-1">
                    <li
                      v-for="(remoteNumber, index) in filteredPmpNames"
                      :key="index"
                      role="none"
                    >
                      <button
                        :id="'pmp-subgroup-option-' + index"
                        type="button"
                        role="option"
                        tabindex="-1"
                        :aria-selected="String(index === subgroupHighlight)"
                        class="order-option"
                        :class="{
                          'order-option--active': index === subgroupHighlight,
                        }"
                        @mouseenter="subgroupActive = index"
                        @click="selectPmpRemoteNumber(remoteNumber)"
                      >
                        <span class="font-mono text-sm font-semibold">{{
                          remoteNumber.remote_number
                        }}</span
                        ><span
                          class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                          >{{ remoteNumber.remote_number_name }}</span
                        >
                      </button>
                    </li>
                    <li
                      v-if="filteredPmpNames.length === 0"
                      class="px-4 py-4 text-center text-sm text-slate-500"
                    >
                      {{ $t('order_create.subgroup_missing') }}
                    </li>
                  </ul>
                </div>
              </div>
            </template>
            <template #finishDate>
              <div>
                <label for="finishDate" class="order-label"
                  >{{ $t('order_create.finish_date') }}
                  <span class="text-red-500">*</span></label
                >
                <input-with-labels
                  id="finishDate"
                  v-model="finishDate"
                  type="datetime-local"
                  class="date-field"
                  :class="{
                    'rounded-xl ring-2 ring-red-400':
                      formSubmitted && !finishDate,
                  }"
                />
              </div>
            </template>
            <template #description>
              <div>
                <label for="description" class="order-label"
                  >{{ $t('order_create.description') }}
                  <span class="ml-1 text-xs font-normal text-slate-400">{{
                    $t('order_configuration.optional')
                  }}</span></label
                >
                <textarea-with-label
                  v-model="description"
                  textarea_id="description"
                  class="description-field"
                  :rows="4"
                  :placeholder="$t('order_create.description_placeholder')"
                />
              </div>
            </template>
            <template #requirements>
              <section
                v-if="pmpFilesReady"
                ref="fileDestinations"
                class="mt-5 scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                data-task-file-destinations
              >
                <button
                  type="button"
                  :aria-expanded="destinationsOpen"
                  aria-controls="task-file-destinations-panel"
                  class="flex w-full items-start justify-between gap-3 p-4 text-left"
                  data-toggle-task-destinations
                  @click="destinationsOpen = !destinationsOpen"
                >
                  <span class="min-w-0"
                    ><span class="block text-sm font-semibold">{{
                      $t('order_configuration.routing')
                    }}</span
                    ><span class="mt-1 block text-xs text-slate-500">{{
                      $t('order_configuration.summary', {
                        files: effectiveFiles.length,
                        workshops: selectedFactories.length,
                      })
                    }}</span></span
                  >
                  <span class="shrink-0" aria-hidden="true">{{
                    destinationsOpen ? '−' : '+'
                  }}</span>
                </button>
                <div
                  v-show="destinationsOpen"
                  id="task-file-destinations-panel"
                  class="space-y-4 border-t border-slate-200 p-4 dark:border-slate-700"
                  data-task-destinations-panel
                >
                  <TaskFileRouting
                    v-model="fileRouting"
                    embedded
                    class="!mt-0 !border-0 !p-0"
                    :files="effectiveFiles"
                    :factories="taskFactories"
                    :disabled="isLoading || !factoryCatalogReady"
                  />
                  <TaskCreationOptions
                    v-if="referenceFiles.length"
                    references-only
                    :reference-visibility.sync="referenceVisibility"
                    :files="effectiveFiles"
                    :selected-workshops="subgroupFactories"
                    :factories="taskFactories"
                    :disabled="isLoading || !factoryCatalogReady"
                    class="!mt-0 !border-0 !p-0"
                  />
                  <p
                    v-if="!effectiveFiles.length"
                    class="text-sm text-slate-500"
                  >
                    {{ $t('order_files.select_files') }}
                  </p>
                </div>
              </section>
              <div
                v-if="submissionIssue"
                id="task-create-issue"
                role="status"
                data-task-create-issue
                class="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              >
                <p>{{ $t(submissionIssue) }}</p>
                <button
                  v-if="
                    factoryCatalogReady &&
                    !selectedFactories.length &&
                    effectiveFiles.length
                  "
                  type="button"
                  class="mt-2 font-semibold underline"
                  data-resolve-task-destinations
                  @click="openFileDestinations"
                >
                  {{ $t('order_configuration.choose_destinations') }}
                </button>
                <button
                  v-if="factoriesLoadError"
                  type="button"
                  class="mt-2 font-semibold underline"
                  @click="loadTaskFactories"
                >
                  {{ $t('order_files.retry') }}
                </button>
              </div>
            </template>
          </create-order-form>
          <p class="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {{ $t('order_configuration.entry_hint') }}
          </p>

          <div
            v-if="pmpFilesReady"
            class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50"
            data-files-mode
          >
            <template v-if="files_existing">
              <span>{{
                selectedFiles.length
                  ? $t('order_create.files_mode_selected', {
                      count: selectedFiles.length,
                    })
                  : $t('order_files.select_files')
              }}</span>
              <button
                type="button"
                class="font-semibold underline"
                data-use-whole-subgroup
                @click="useWholeSubgroup"
              >
                {{ $t('order_create.use_whole_subgroup') }}
              </button>
            </template>
            <span v-else>{{
              $t('order_create.files_mode_whole', {
                count: subgroupFiles.length,
              })
            }}</span>
          </div>
          <p class="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {{ $t('order_create.files_hint') }}
          </p>
        </section>
      </div>

      <TaskConfigurationEditor
        v-if="isFiles"
        ref="configurationEditor"
        :disabled="isLoading"
        :file-count="effectiveFiles.length"
        :workshop-count="taskWorkshops.length"
        :status="configurationStatus"
        :can-submit="canSubmit"
        :submit-issue="submissionIssue ? $t(submissionIssue) : ''"
        :working-file-count="workingFiles.length"
        :reference-file-count="referenceFiles.length"
        @close="backToDetails"
        @submit="pmpFiles"
        @all-files="useWholeSubgroup"
        @choose-destinations="openFileDestinations"
      >
        <template #files>
          <div
            class="mb-4 flex flex-wrap gap-2"
            role="group"
            :aria-label="$t('order_configuration.file_mode')"
          >
            <button
              type="button"
              data-all-files
              :aria-pressed="!files_existing"
              class="order-mode-button"
              :class="{ 'order-mode-button--active': !files_existing }"
              @click="useWholeSubgroup"
            >
              {{ $t('order_configuration.all_files') }}
            </button>
            <button
              type="button"
              data-individual-files
              :aria-pressed="files_existing"
              class="order-mode-button"
              :class="{ 'order-mode-button--active': files_existing }"
              @click="selectIndividualFiles"
            >
              {{ $t('order_configuration.selected_files') }}
            </button>
          </div>
          <p
            v-if="!files_existing"
            class="rounded-xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
          >
            {{
              $t('order_create.files_mode_whole', {
                count: subgroupFiles.length,
              })
            }}
          </p>
          <div
            v-else
            class="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <span>{{
              $t('order_configuration.selected_count', {
                count: selectedFiles.length,
              })
            }}</span>
            <div class="flex gap-3">
              <button
                type="button"
                data-select-all-task-files
                class="font-semibold underline"
                @click="selectAllTaskFiles"
              >
                {{ $t('order_create.select_all') }}
              </button>
              <button
                type="button"
                data-clear-task-files
                class="font-semibold underline"
                @click="clearTaskFiles"
              >
                {{ $t('order_create.clear_all') }}
              </button>
            </div>
          </div>
          <show-files
            v-if="files_existing"
            embedded
            :pmps="pmpsData"
            :factories="
              getFileCategories?.length ? getFileCategories : taskFactories
            "
            :selected-files="selectedFiles"
            :file-quantities.sync="fileQuantities"
            :remote-number-id="remote_number_id"
            class="order-files !border-0 !p-0 !shadow-none"
            @update:selectedFiles="updateSelectedFiles"
          />
        </template>
        <template #route>
          <ProductionRouteEditor
            v-model="productionRouteModel"
            class="!mt-0 !border-0 !bg-transparent !p-0"
            :factories="taskWorkshops"
            :available="addableWorkshops"
            :file-workshop-ids="fileWorkshopIds"
            :overall-deadline="finishDate"
            :disabled="isLoading"
            @add="addRouteWorkshop"
            @remove="removeRouteWorkshop"
          />
        </template>
        <template #confirmation>
          <TaskCreationOptions
            hide-references
            class="!mt-0 !border-0 !bg-transparent !p-0"
            :confirmation-required.sync="confirmationRequired"
            :confirmation-method.sync="confirmationMethod"
            :reference-visibility.sync="referenceVisibility"
            :selected-workshops="selectedFactories"
            :files="effectiveFiles"
            :factories="taskFactories"
            :disabled="isLoading"
          />
        </template>
        <template #workshops>
          <TaskWorkshopOptions
            v-model="workshopSettings"
            class="!mt-0 !border-0 !bg-transparent !p-0"
            hide-deadline
            :factories="routeOrderedWorkshops"
            :disabled="isLoading"
          />
        </template>
        <template #operators>
          <TaskOperatorPicker
            v-model="factoryOperators"
            class="!mt-0 !border-0 !bg-transparent !p-0"
            :factories="routeOrderedWorkshops"
            :workload="workload"
            :error="workloadError"
            :loading="workloadLoading"
            :disabled="isLoading"
            @refresh="loadWorkload"
          />
        </template>
      </TaskConfigurationEditor>

      <div
        v-if="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
        role="status"
      >
        <div
          class="work-card flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-t-white"
          ></div>
          <span class="text-sm font-medium">{{
            $t('order_create.saving')
          }}</span>
        </div>
      </div>
      <notifications />
    </div>
    <PermissionDenied v-else />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import TaskFileRouting from '@/components/engineer/TaskFileRouting.vue'
import TaskConfigurationEditor from '@/components/engineer/TaskConfigurationEditor.vue'
import {
  fileRoutingPayload,
  isReferenceFile,
  isWorkshop,
} from '@/utils/workshop-catalog'
import TaskCreationOptions from '@/components/engineer/TaskCreationOptions.vue'
import TaskWorkshopOptions from '@/components/engineer/TaskWorkshopOptions.vue'
import ProductionRouteEditor from '@/components/engineer/ProductionRouteEditor.vue'
import {
  normalizeRoute,
  routeCopy,
  routeHasCycle,
  routeFromFilePlans,
} from '@/utils/production-route'
import {
  activeOptionIndex,
  codeMatcher,
  focusFieldById,
  revealOption,
  stepOptionIndex,
} from '@/utils/combobox'
import TaskOperatorPicker from '@/components/engineer/TaskOperatorPicker.vue'
import {
  confirmationMethods,
  taskCopy,
  workshopSettingsPayload,
} from '@/utils/task-workflow'
import { routingCopy, workshopOperators } from '@/utils/task-routing'
import InputWithLabels from '~/components/form/InputWithIcon.vue'
import SelectWithLabel from '~/components/form/SelectWithLabel.vue'
import CreateOrderForm from '~/components/modals/create/CreateOrderForm.vue'
import ShowFiles from '~/components/File/ShowFactoryFiles/ShowFiles.vue'
import TextareaWithLabel from '~/components/form/TextareaWithLabel.vue'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

export default {
  components: {
    TaskFileRouting,
    TaskConfigurationEditor,
    TaskCreationOptions,
    TaskWorkshopOptions,
    ProductionRouteEditor,
    TaskOperatorPicker,
    PermissionDenied,
    InputWithLabels,
    SelectWithLabel,
    CreateOrderForm,
    ShowFiles,
    TextareaWithLabel,
  },
  layout: 'engineer',
  middleware: ['engineer'],
  data() {
    return {
      isSelectedClient: false,
      isSelectPmpGroup: false,
      isSelectPmpName: false,
      groupActive: -1,
      subgroupActive: -1,
      selectedClient: null,
      pmpGroupSearch: '',
      pmpNameSearch: '',
      selectedPmp: null,
      selectedPmpRemoteNumber: null,
      quantity: null,
      description: '',
      finishDate: '',
      formSubmitted: false,
      isFiles: false,
      destinationsOpen: false,
      selectedFiles: [],
      fileQuantities: {},
      isLoading: false,
      files_existing: false,
      remote_number_id: null,
      orderPmp: null,
      pmpFilesLoading: false,
      pmpFilesLoadError: false,
      pmpFileRequestId: 0,
      factoriesLoading: false,
      factoriesLoadError: false,

      factoryOperators: {},
      workload: null,
      workloadError: '',
      workloadLoading: false,
      workloadRequestId: 0,
      confirmationRequired: false,
      confirmationMethod: '',
      referenceVisibility: {},
      fileRouting: {},
      workshopSettings: {},
      productionRoute: null,
      // Workshops added only to the production route (no files of their own).
      routeExtraIds: [],
    }
  },
  computed: {
    ...mapGetters('factory', ['getFactory', 'getFileCategories']),
    ...mapGetters('clients', ['allClients']),
    ...mapGetters('pmp', ['getPmpes', 'getPmp']),

    taskFactories() {
      return Array.isArray(this.getFactory) ? this.getFactory : []
    },

    pmpsData() {
      const p = this.orderPmp
      return p && Number(p.id) === Number(this.selectedPmp?.id)
        ? { exists: true, pmp: p }
        : { exists: false }
    },

    subgroupFiles() {
      if (!this.pmpsData.exists || !this.remote_number_id) return []
      return (this.orderPmp.files || []).filter(
        (file) =>
          Number(file.remote_number_id) === Number(this.remote_number_id)
      )
    },

    pmpFilesReady() {
      return !!(
        this.pmpsData.exists &&
        this.remote_number_id &&
        !this.pmpFilesLoading &&
        !this.pmpFilesLoadError
      )
    },

    validSelectedFiles() {
      const allowedIds = new Set(
        this.subgroupFiles.map((file) => Number(file.id))
      )
      return (
        this.selectedFiles.length > 0 &&
        this.selectedFiles.every((id) => {
          const quantity = Number(this.fileQuantities[id])
          return (
            allowedIds.has(Number(id)) &&
            Number.isInteger(quantity) &&
            quantity > 0
          )
        })
      )
    },

    orderFileIssue() {
      if (!this.remote_number_id) return null
      if (this.pmpFilesLoading) return 'order_files.loading'
      if (this.pmpFilesLoadError) return 'order_files.load_failed'
      if (!this.pmpFilesReady) return null
      if (this.subgroupFiles.length === 0) return 'order_files.empty_subgroup'
      if (this.files_existing && this.selectedFiles.length === 0)
        return 'order_files.select_files'
      return null
    },

    // Every workshop this subgroup could send work to, whatever files are chosen.
    subgroupFactories() {
      return this.taskFactories
        .filter(isWorkshop)
        .map((factory) => ({ ...factory, operators: factory.operators || [] }))
    },

    // True when the engineer chose individual files and still keeps that choice.
    usesSelectedFiles() {
      return this.files_existing && this.validSelectedFiles
    },

    effectiveFiles() {
      return this.files_existing
        ? this.subgroupFiles.filter((file) =>
            this.selectedFiles.some((id) => Number(id) === Number(file.id))
          )
        : this.subgroupFiles
    },
    workingFiles() {
      return this.effectiveFiles.filter(
        (file) => !isReferenceFile(file, this.taskFactories)
      )
    },
    referenceFiles() {
      return this.effectiveFiles.filter((file) =>
        isReferenceFile(file, this.taskFactories)
      )
    },
    factoryCatalogReady() {
      return (
        !this.factoriesLoading &&
        !this.factoriesLoadError &&
        Array.isArray(this.getFactory)
      )
    },
    users() {
      return this.allClients
    },

    selectedFactories() {
      const ids = new Set(
        fileRoutingPayload(
          this.effectiveFiles,
          this.taskFactories,
          this.fileRouting
        ).flatMap((row) => row.factory_ids)
      )
      this.referenceFiles.forEach((file) => {
        for (const id of this.referenceVisibility[file.id] || [])
          ids.add(Number(id))
      })
      return this.taskFactories
        .filter((factory) => ids.has(Number(factory.id)) && isWorkshop(factory))
        .map((factory) => ({ ...factory, operators: factory.operators || [] }))
    },

    fileWorkshopIds() {
      return this.selectedFactories.map((factory) => Number(factory.id))
    },
    // Workshops of the task: those receiving its files plus those added only to
    // the production route (painting, welding…), in catalog order.
    taskWorkshops() {
      const ids = new Set([
        ...this.fileWorkshopIds,
        ...this.routeExtraIds.map(Number),
      ])
      return this.subgroupFactories.filter((factory) =>
        ids.has(Number(factory.id))
      )
    },
    addableWorkshops() {
      const ids = new Set(this.taskWorkshops.map((factory) => Number(factory.id)))
      return this.subgroupFactories.filter(
        (factory) => !ids.has(Number(factory.id))
      )
    },

    productionRouteModel: {
      get() {
        return (
          this.productionRoute ||
          routeFromFilePlans(
            this.effectiveFiles,
            this.selectedFactories,
            fileRoutingPayload(
              this.effectiveFiles,
              this.taskFactories,
              this.fileRouting
            )
          )
        )
      },
      set(value) {
        this.productionRoute = value
        this.$workspace?.setDirty(true)
      },
    },
    productionRoutePayload() {
      return normalizeRoute(this.productionRouteModel, this.taskWorkshops)
    },
    // Task workshops in route order, for the conditions and operator lists.
    routeOrderedWorkshops() {
      const order = this.productionRoutePayload.stages.map(
        (stage) => stage.factory_id
      )
      return [...this.taskWorkshops].sort(
        (a, b) => order.indexOf(Number(a.id)) - order.indexOf(Number(b.id))
      )
    },
    // One line per settings section, shown in its header.
    configurationStatus() {
      const route = this.productionRoutePayload
      const modes = routeCopy[this.$i18n?.locale] || routeCopy.hy
      const ids = this.taskWorkshops.map((factory) => Number(factory.id))
      const custom = ids.filter((id) => {
        const row = this.workshopSettings[id]
        return row && (row.inherit === false || (row.priority && row.priority !== 'normal'))
      }).length
      const assigned = ids.filter((id) => this.factoryOperators[id] != null).length
      return {
        files: this.files_existing
          ? this.$t('order_configuration.status_selected_files', {
              count: this.selectedFiles.length,
            })
          : this.$t('order_configuration.status_all_files', {
              count: this.subgroupFiles.length,
            }),
        route: this.$t('order_configuration.status_route', {
          mode: modes[route.mode] || route.mode,
          count: route.stages.length,
        }),
        confirmation: this.confirmationRequired
          ? this.$t(
              `order_configuration.status_confirmation_${
                this.confirmationMethod || 'missing'
              }`
            )
          : this.$t('order_configuration.status_confirmation_off'),
        workshops: custom
          ? this.$t('order_configuration.status_workshops_custom', {
              count: custom,
            })
          : this.$t('order_configuration.status_workshops_default'),
        operators: this.$t('order_configuration.status_operators', {
          assigned,
          total: ids.length,
        }),
      }
    },

    canProceedToFiles() {
      return !!(
        this.selectedClient &&
        this.selectedPmp &&
        this.selectedPmpRemoteNumber &&
        this.finishDate &&
        this.pmpFilesReady &&
        this.subgroupFiles.length > 0
      )
    },

    submissionIssue() {
      if (!this.canProceedToFiles) return null
      if (this.factoriesLoadError)
        return 'order_configuration.workshops_load_failed'
      if (!this.factoryCatalogReady)
        return 'order_configuration.workshops_loading'
      if (!this.effectiveFiles.length) return 'order_files.select_files'
      if (!this.subgroupFactories.length)
        return 'order_configuration.no_active_workshops'
      if (!this.selectedFactories.length)
        return this.workingFiles.length
          ? 'order_configuration.workshop_required'
          : 'order_configuration.reference_workshop_required'
      if (this.files_existing && !this.validSelectedFiles)
        return 'order_configuration.invalid_file_quantities'
      if (
        this.confirmationRequired &&
        !['photo', 'text', 'photo_text'].includes(this.confirmationMethod)
      )
        return 'order_configuration.confirmation_method_required'
      if (routeHasCycle(this.productionRoutePayload))
        return 'order_configuration.route_cycle'
      return null
    },
    canSubmit() {
      // All-subgroup creation uses the defaults without mounting the editor.
      return (
        this.canProceedToFiles &&
        !this.submissionIssue &&
        !this.isEditingMode &&
        !this.isLoading
      )
    },

    filteredPmpGroups() {
      const groups = Array.isArray(this.getPmpes?.pmp) ? this.getPmpes.pmp : []
      if (!this.pmpGroupSearch) return groups
      const searchTerm = this.pmpGroupSearch.toLowerCase()
      return groups.filter(
        (pmp) =>
          String(pmp.group || '')
            .toLowerCase()
            .includes(searchTerm) ||
          String(pmp.group_name || '')
            .toLowerCase()
            .includes(searchTerm)
      )
    },

    filteredPmpNames() {
      if (!this.selectedPmp) return []
      const remoteNumbers = this.selectedPmp.remote_number || []
      if (!this.pmpNameSearch) return remoteNumbers
      const searchTerm = this.pmpNameSearch.toLowerCase()
      return remoteNumbers.filter((rn) =>
        rn.remote_number.toLowerCase().includes(searchTerm)
      )
    },

    isEditingMode() {
      return this.$route.path.includes('/editing')
    },

    // Option Enter takes in the group/subgroup lists (-1: none).
    groupHighlight() {
      return activeOptionIndex(
        this.filteredPmpGroups,
        this.groupActive,
        codeMatcher(this.pmpGroupSearch, (pmp) => pmp.group, 3),
        Boolean(String(this.pmpGroupSearch || '').trim())
      )
    },
    subgroupHighlight() {
      return activeOptionIndex(
        this.filteredPmpNames,
        this.subgroupActive,
        codeMatcher(this.pmpNameSearch, (row) => row.remote_number, 2),
        Boolean(String(this.pmpNameSearch || '').trim())
      )
    },
  },
  watch: {
    confirmationRequired(value) {
      if (!value) this.confirmationMethod = ''
    },
    selectedPmp(newVal, oldVal) {
      if (!newVal || newVal.id !== oldVal?.id) {
        this.selectedPmpRemoteNumber = null
        this.pmpNameSearch = ''
        this.remote_number_id = null
        this.resetPmpFileSelection()
      }
    },
    taskWorkshops(newFactories) {
      newFactories.forEach((factory) => {
        if (!(factory.id in this.factoryOperators)) {
          this.$set(this.factoryOperators, factory.id, null)
        }
      })
    },
    // Choices follow the subgroup, not the momentary file selection: opening the
    // file picker or deselecting a file must not erase
    // them. Only the workshops the task really uses are sent on creation.
    subgroupFactories(allFactories) {
      const allowedIds = new Set(
        allFactories.map((factory) => Number(factory.id))
      )
      Object.keys(this.factoryOperators).forEach((factoryId) => {
        if (!allowedIds.has(Number(factoryId))) {
          this.$delete(this.factoryOperators, factoryId)
        }
      })
    },
  },
  mounted() {
    this.fetchClients()
    this.loadTaskFactories()
    this.fetchFileCategories().catch(() => {})
    this.fetchPmps()
    this.loadWorkload()
  },
  methods: {
    ...mapActions('factory', ['fetchFactory', 'fetchFileCategories']),
    ...mapActions('clients', ['fetchClients']),
    ...mapActions('engineer', ['createNewOrder']),
    ...mapActions('pmp', [
      'fetchPmps',
      'checkPmpByRemoteNumber',
      'checkIfGroupExists',
    ]),

    async loadTaskFactories() {
      if (this.factoriesLoading) return
      this.factoriesLoading = true
      this.factoriesLoadError = false
      try {
        const loaded = await this.fetchFactory()
        this.factoriesLoadError = !loaded || !Array.isArray(this.getFactory)
      } catch (error) {
        this.factoriesLoadError = true
      } finally {
        this.factoriesLoading = false
      }
    },

    openFileDestinations() {
      this.destinationsOpen = true
      this.$nextTick(() =>
        this.$refs.fileDestinations?.scrollIntoView?.({
          block: 'start',
          behavior: 'smooth',
        })
      )
    },

    selectPmpGroup(pmp) {
      this.$workspace?.setDirty(true)
      if (this.selectedPmp?.id !== pmp.id) {
        this.selectedPmpRemoteNumber = null
        this.pmpNameSearch = ''
        this.remote_number_id = null
        this.resetPmpFileSelection()
      }
      this.selectedPmp = pmp
      this.pmpGroupSearch = pmp.group
      this.isSelectPmpGroup = false
    },

    async selectPmpRemoteNumber(remoteNumber) {
      this.$workspace?.setDirty(true)
      if (Number(this.remote_number_id) !== Number(remoteNumber.id))
        this.resetPmpFileSelection()
      this.selectedPmpRemoteNumber = remoteNumber.remote_number
      this.pmpNameSearch = remoteNumber.remote_number
      this.isSelectPmpName = false
      this.remote_number_id = remoteNumber.id
      await this.loadSelectedPmpFiles()
    },

    async loadSelectedPmpFiles() {
      if (!this.selectedPmp || !this.remote_number_id) return
      const requestId = ++this.pmpFileRequestId
      const pmpId = this.selectedPmp.id
      const remoteId = this.remote_number_id
      this.pmpFilesLoading = true
      this.pmpFilesLoadError = false
      try {
        const exists = await this.checkPmpByRemoteNumber(remoteId)
        if (requestId !== this.pmpFileRequestId) return
        if (
          !exists ||
          Number(this.getPmp?.id) !== Number(pmpId) ||
          !Array.isArray(this.getPmp?.files)
        ) {
          this.pmpFilesLoadError = true
          return
        }
        this.orderPmp = this.getPmp
      } catch (error) {
        if (requestId === this.pmpFileRequestId) this.pmpFilesLoadError = true
      } finally {
        if (requestId === this.pmpFileRequestId) this.pmpFilesLoading = false
      }
    },

    resetPmpFileSelection() {
      this.productionRoute = null
      this.routeExtraIds = []
      this.destinationsOpen = false
      this.selectedFiles = []
      this.fileQuantities = {}
      this.factoryOperators = {}
      this.referenceVisibility = {}
      this.fileRouting = {}
      this.orderPmp = null
      this.files_existing = false
      this.isFiles = false
      this.pmpFileRequestId++
      this.pmpFilesLoading = false
      this.pmpFilesLoadError = false
    },

    filterPmpGroups() {
      this.groupActive = -1
      this.isSelectPmpGroup = true
    },

    filterPmpNames() {
      this.subgroupActive = -1
      this.isSelectPmpName = true
    },

    // Group and subgroup fields: the arrows choose, Enter takes the option (a
    // code typed without its zeros too) and moves on to the next field.
    onPmpKeydown(event, which) {
      if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey)
        return
      const group = which === 'group'
      if (!group && !this.selectedPmp) return
      const options = group ? this.filteredPmpGroups : this.filteredPmpNames
      const open = group ? this.isSelectPmpGroup : this.isSelectPmpName
      const highlight = group ? this.groupHighlight : this.subgroupHighlight
      const setOpen = (value) => {
        if (group) this.isSelectPmpGroup = value
        else this.isSelectPmpName = value
      }
      const setActive = (value) => {
        if (group) this.groupActive = value
        else this.subgroupActive = value
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!options.length) return
        event.preventDefault()
        if (!open) setOpen(true)
        const next = stepOptionIndex(
          open ? highlight : -1,
          options.length,
          event.key === 'ArrowDown' ? 1 : -1
        )
        setActive(next)
        revealOption(this, `pmp-${which}-option-${next}`)
      } else if (event.key === 'Escape') {
        if (!open) return
        event.preventDefault()
        setOpen(false)
        setActive(-1)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const option = options[highlight]
        if (!option) return
        setActive(-1)
        if (group) {
          this.selectPmpGroup(option)
          focusFieldById(this, 'pmpRemoteNumberName')
        } else {
          this.selectPmpRemoteNumber(option)
          focusFieldById(this, 'finishDate')
        }
      }
    },

    // The route may include workshops that get no files (painting, welding…).
    addRouteWorkshop(id) {
      const factoryId = Number(id)
      if (
        this.taskWorkshops.some((factory) => Number(factory.id) === factoryId) ||
        !this.subgroupFactories.some((factory) => Number(factory.id) === factoryId)
      )
        return
      const plan = normalizeRoute(this.productionRouteModel, this.taskWorkshops)
      this.routeExtraIds = [...this.routeExtraIds, factoryId]
      this.productionRouteModel = {
        ...plan,
        stages: [
          ...plan.stages,
          { factory_id: factoryId, predecessor_factory_ids: [], deadline: null },
        ],
      }
    },
    removeRouteWorkshop(id) {
      const factoryId = Number(id)
      if (
        !this.routeExtraIds.includes(factoryId) ||
        this.fileWorkshopIds.includes(factoryId)
      )
        return
      const plan = normalizeRoute(this.productionRouteModel, this.taskWorkshops)
      this.routeExtraIds = this.routeExtraIds.filter((value) => value !== factoryId)
      this.productionRouteModel = {
        ...plan,
        stages: plan.stages
          .filter((stage) => stage.factory_id !== factoryId)
          .map((stage) => ({
            ...stage,
            predecessor_factory_ids: stage.predecessor_factory_ids.filter(
              (value) => value !== factoryId
            ),
          })),
      }
    },

    handleFilesSelected(files) {
      this.files_existing = true
      this.$workspace?.setDirty(true)
      this.selectedFiles = files.map((file) => file.id)
      this.fileQuantities = files.reduce((acc, file) => {
        acc[file.id] = file.quantity
        return acc
      }, {})

      this.$notify({
        text: 'Ֆայլերը ընտրված են, ընտրեք կատարող(ներ) և պահպանեք առաջադրանքը։',
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },

    // Live counts are only a hint: the page can stay open for minutes, so they
    // are reloaded on demand and when the files step opens. A late answer never
    // replaces a newer one, and a chosen operator who disappeared is dropped.
    async loadWorkload() {
      const requestId = ++this.workloadRequestId
      this.workloadError = ''
      this.workloadLoading = true
      try {
        const workload = await this.$axios.$get('/api/task-workload')
        if (requestId !== this.workloadRequestId) return
        this.workload = workload
        this.pruneUnavailableOperators()
      } catch (error) {
        if (requestId !== this.workloadRequestId) return
        this.workloadError = (
          routingCopy[this.$i18n?.locale] || routingCopy.hy
        ).loadFailed
      } finally {
        if (requestId === this.workloadRequestId) this.workloadLoading = false
      }
    },

    pruneUnavailableOperators() {
      const next = { ...this.factoryOperators }
      let changed = false
      this.subgroupFactories.forEach((factory) => {
        const chosen = next[factory.id]
        if (
          chosen != null &&
          !workshopOperators(factory, this.workload).some(
            (operator) => Number(operator.id) === Number(chosen)
          )
        ) {
          next[factory.id] = null
          changed = true
        }
      })
      if (changed) this.factoryOperators = next
    },

    // Leaving the file picker must not leave "chosen files" mode switched on
    // without a valid choice: the Create button would stay disabled and mean
    // something else than it says.
    backToDetails() {
      if (!this.validSelectedFiles) {
        this.files_existing = false
        this.selectedFiles = []
        this.fileQuantities = {}
      }
      this.isFiles = false
    },

    useWholeSubgroup() {
      this.files_existing = false
      this.selectedFiles = []
      this.fileQuantities = {}
      // File mode changes do not discard routing or reference visibility.
    },

    async pmpFiles() {
      if (this.isLoading) return
      this.isLoading = true
      this.formSubmitted = true

      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.remote_number_id ||
        !this.finishDate ||
        (this.isEditingMode &&
          (!this.quantity ||
            this.quantity <= 0 ||
            !this.selectedFiles ||
            this.selectedFiles.length === 0))
      ) {
        this.$notify({
          text: `Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը${
            this.isEditingMode ? ' և ընտրել ֆայլեր' : ''
          }։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        this.isLoading = false
        return
      }

      if (!this.validateOrderFiles()) {
        this.isLoading = false
        return
      }

      if (this.submissionIssue) {
        this.$notify({
          text: this.$t(this.submissionIssue),
          type: 'error',
          duration: 4000,
        })
        this.isLoading = false
        return
      }

      const invalidFiles = this.selectedFiles.filter(
        (id) =>
          !Number.isInteger(Number(this.fileQuantities[id])) ||
          Number(this.fileQuantities[id]) <= 0
      )
      if (invalidFiles.length > 0) {
        this.$notify({
          text: 'Խնդրում ենք սահմանել վավեր քանակ (1 կամ ավելի) բոլոր ընտրված ֆայլերի համար։',
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        this.isLoading = false
        return
      }

      if (
        this.confirmationRequired &&
        !['photo', 'text', 'photo_text'].includes(this.confirmationMethod)
      ) {
        this.$notify({
          text: (taskCopy[this.$i18n?.locale] || taskCopy.hy).invalidMethod,
          type: 'error',
        })
        this.isLoading = false
        return
      }
      const inTask = new Set(
        this.taskWorkshops.map((factory) => Number(factory.id))
      )
      const factoryOperatorsArray = Object.entries(this.factoryOperators)
        .filter(
          ([factoryId, userId]) => !!userId && inTask.has(Number(factoryId))
        )
        .map(([factoryId, userId]) => ({
          factory_id: Number(factoryId),
          user_id: userId,
        }))

      const workshopSettings = workshopSettingsPayload(
        this.taskWorkshops,
        this.workshopSettings,
        this.confirmationRequired,
        this.confirmationMethod
      )
      if (
        workshopSettings.some(
          (row) =>
            row.confirmation_required &&
            !confirmationMethods(row.confirmation_method).length
        )
      ) {
        this.$notify({
          text: (taskCopy[this.$i18n?.locale] || taskCopy.hy).invalidMethod,
          type: 'error',
        })
        this.isLoading = false
        return
      }
      const data = {
        file_routing: fileRoutingPayload(
          this.effectiveFiles,
          this.taskFactories,
          this.fileRouting
        ),
        production_route: this.productionRoutePayload,
        workshop_settings: workshopSettings.map((row) => ({
          ...row,
          deadline:
            this.productionRoutePayload.stages.find(
              (stage) => stage.factory_id === row.factory_id
            )?.deadline || null,
        })),
        confirmation_required: this.confirmationRequired,
        confirmation_method: this.confirmationRequired
          ? this.confirmationMethod
          : null,
        reference_file_visibility: this.effectiveFiles
          .filter((file) =>
            isReferenceFile(
              file,
              this.getFileCategories?.length
                ? this.getFileCategories
                : this.taskFactories
            )
          )
          .map((file) => ({
            file_id: file.id,
            factory_ids: (this.referenceVisibility[file.id] || []).filter(
              (id) =>
                this.selectedFactories.some(
                  (factory) => Number(factory.id) === Number(id)
                )
            ),
          })),
        user_id: this.selectedClient.user.id,
        creator_id: this.$auth.user.id,
        name: `${this.selectedPmp.group}.${this.selectedPmpRemoteNumber}`,
        description: this.description,
        quantity: this.quantity,
        status: 'pending',
        finish_date: this.finishDate,
        remote_number_id: this.remote_number_id,
        pmp_id: this.selectedPmp.id,
        link_existing_files: this.files_existing,
        selected_files: this.selectedFiles.map((id) => ({
          id,
          quantity: this.fileQuantities[id],
        })),
        factory_operators: factoryOperatorsArray,
      }

      try {
        await this.createNewOrder(data)
        this.$notify({
          text: `Առաջադրանքը հաջողությամբ ստեղծվեց${
            this.selectedFiles.length > 0
              ? ` ${this.selectedFiles.length} ֆայլով`
              : ''
          }։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
        this.resetForm()
        this.$router.push('/engineer')
      } catch (error) {
        const validationMessage = Object.values(
          error.response?.data?.errors || {}
        )
          .flat()
          .find((message) => typeof message === 'string')
        this.$notify({
          text: `Սխալ՝ ${
            validationMessage || error.response?.data?.error || error.message
          }`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
      } finally {
        this.isLoading = false
      }
    },

    selectIndividualFiles() {
      if (!this.files_existing) this.selectAllTaskFiles()
      this.files_existing = true
      this.$workspace?.setDirty(true)
    },
    selectAllTaskFiles() {
      this.selectedFiles = this.subgroupFiles.map((file) => file.id)
      this.fileQuantities = Object.fromEntries(
        this.subgroupFiles.map((file) => [
          file.id,
          this.fileQuantities[file.id] ||
            (Number.isInteger(Number(file.quantity)) &&
            Number(file.quantity) > 0
              ? Number(file.quantity)
              : 1),
        ])
      )
      this.$workspace?.setDirty(true)
    },
    clearTaskFiles() {
      this.selectedFiles = []
      this.fileQuantities = {}
      this.$workspace?.setDirty(true)
    },
    updateSelectedFiles(files) {
      this.selectIndividualFiles()
      this.selectedFiles = files
    },
    selectFromOtherFactory() {
      if (this.isFiles) {
        this.backToDetails()
        return
      }
      this.formSubmitted = true

      if (
        !this.selectedClient ||
        !this.selectedPmp ||
        !this.selectedPmpRemoteNumber ||
        !this.finishDate ||
        (this.isEditingMode && (!this.quantity || this.quantity <= 0))
      ) {
        this.$notify({
          text: `Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'error',
        })
        return
      }

      if (!this.validateOrderFiles(false)) return
      this.isFiles = true
      this.loadWorkload()
      this.$nextTick(() => {
        this.$refs.configurationEditor?.$el?.scrollIntoView?.({
          block: 'start',
          behavior: 'smooth',
        })
      })
    },

    validateOrderFiles(requireSelection = this.files_existing) {
      let issue = null
      if (this.pmpFilesLoading) issue = 'order_files.loading'
      else if (!this.pmpFilesReady) issue = 'order_files.load_failed'
      else if (this.subgroupFiles.length === 0)
        issue = 'order_files.empty_subgroup'
      else if (requireSelection && this.selectedFiles.length === 0)
        issue = 'order_files.select_files'
      else {
        const allowedIds = new Set(
          this.subgroupFiles.map((file) => Number(file.id))
        )
        if (this.selectedFiles.some((id) => !allowedIds.has(Number(id))))
          issue = 'order_files.wrong_subgroup'
      }
      if (!issue) return true
      this.$notify({ text: this.$t(issue), type: 'error', duration: 4000 })
      return false
    },

    cancelBack() {
      this.$router.push('/engineer')
    },

    resetForm() {
      this.$workspace?.setDirty(false)
      this.selectedClient = null
      this.selectedPmp = null
      this.selectedPmpRemoteNumber = null
      this.pmpGroupSearch = ''
      this.pmpNameSearch = ''
      this.description = ''
      this.finishDate = ''
      this.quantity = null
      this.formSubmitted = false
      this.confirmationRequired = false
      this.confirmationMethod = ''
      this.isFiles = false
      this.remote_number_id = null
      this.resetPmpFileSelection()
    },
  },
}
</script>

<style scoped>
.order-mode-button {
  @apply rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:border-blue-400 dark:border-slate-700;
}
.order-mode-button--active {
  @apply border-blue-600 bg-blue-600 text-white dark:border-blue-500;
}

.pmp-selector {
  position: relative;
  min-width: 0;
}
.order-label {
  @apply mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300;
}
.order-input,
.date-field ::v-deep input,
.description-field ::v-deep textarea {
  @apply block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800;
}
.date-field ::v-deep label,
.description-field ::v-deep label {
  display: none;
}
.order-menu {
  @apply absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900;
}
.order-option {
  @apply w-full break-words px-4 py-3 text-left transition hover:bg-slate-50 focus:bg-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800;
}
.order-option--active {
  @apply bg-blue-50 dark:bg-slate-800;
}
.order-form {
  @apply border-0 bg-transparent p-0 shadow-none;
  backdrop-filter: none;
}
.order-files {
  @apply border-0 bg-transparent p-0 shadow-none;
  backdrop-filter: none;
}
</style>
