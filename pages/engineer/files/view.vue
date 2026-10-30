<template>
  <main
    class="files-page p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div
      v-if="pageError"
      role="alert"
      class="mb-4 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-700 dark:text-red-300"
    >
      <p>{{ pageError }}</p>
      <button type="button" class="mt-2 underline" @click="loadPage">
        {{ $t('file_upload.retry') }}
      </button>
    </div>
    <div
      v-if="factoryListError"
      role="alert"
      class="mb-4 rounded-lg bg-red-50 dark:bg-red-950 p-4 text-red-700 dark:text-red-300"
    >
      <p>{{ factoryListError }}</p>
      <button type="button" class="mt-2 underline" @click="loadPage">
        {{ $t('file_upload.retry') }}
      </button>
    </div>
    <transition name="fade">
      <div
        v-if="loading"
        class="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
        ></div>
      </div>
    </transition>

    <section
      v-if="projectReady"
      class="work-card mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 sm:p-5 lg:mb-3 lg:gap-3 lg:px-4 lg:py-2.5"
      aria-label="Նախագիծ"
    >
      <div class="min-w-0 lg:flex lg:items-center lg:gap-3">
        <p class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400 lg:mb-0 lg:shrink-0">
          {{ $t('project_context.group') }}
        </p>
        <div class="flex min-w-0 items-start gap-3 lg:items-center">
          <span
            class="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-white"
            >{{ groupCode }}</span
          >
          <p
            class="min-w-0 break-words text-sm font-semibold text-slate-900 dark:text-white lg:truncate"
          >
            {{ getPmp.group_name || '—' }}
          </p>
        </div>
      </div>
      <div v-if="selectedRemoteNumber" class="min-w-0 lg:flex lg:items-center lg:gap-3">
        <p class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400 lg:mb-0 lg:shrink-0">
          {{ $t('project_context.subgroup') }}
        </p>
        <div class="flex min-w-0 items-start gap-3 lg:items-center">
          <span
            class="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200"
            >{{ subgroupCode }}</span
          >
          <p
            class="min-w-0 break-words text-sm font-semibold text-slate-900 dark:text-white lg:truncate"
          >
            {{ selectedRemoteNumber.remote_number_name || '—' }}
          </p>
        </div>
      </div>
    </section>

    <!-- Windows Explorer style: address bar, toolbar, pinned INFO folder,
         production folders, then the opened folder's files and the preview.
         All actions call the same methods as before. -->
    <section
      v-if="projectReady"
      class="explorer"
      data-files-explorer
    >
      <div class="explorer-bar">
        <button
          type="button"
          class="explorer-icon-button"
          :disabled="breadcrumb.length < 2"
          aria-label="Մեկ մակարդակ վեր"
          title="Մեկ մակարդակ վեր"
          @click="goUp"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6" />
          </svg>
        </button>
        <nav class="explorer-path" aria-label="Նախագիծ">
          <svg class="h-4 w-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.38a1.5 1.5 0 0 1 1.06.44L11.5 7h8A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
          </svg>
          <template v-for="(item, index) in breadcrumb">
            <svg
              v-if="index > 0"
              :key="'sep-' + index"
              class="h-3 w-3 shrink-0 text-slate-400"
              viewBox="0 0 6 10"
              fill="none"
              aria-hidden="true"
            >
              <path d="M1 9l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <button
              :key="'crumb-' + index"
              type="button"
              class="explorer-crumb"
              :class="{ 'explorer-crumb--current': index === breadcrumb.length - 1 }"
              :title="item"
              @click="selectBreadcrumb(index)"
            >
              {{ item }}
            </button>
          </template>
        </nav>
        <label
          v-if="sectionOpen && $can('pmp_files.view')"
          class="explorer-search"
        >
          <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            v-model="fileQuery"
            type="search"
            class="min-w-0 flex-1 bg-transparent text-sm outline-none"
            placeholder="Որոնել ֆայլ"
            aria-label="Որոնել ֆայլ"
          />
        </label>
      </div>

      <div v-if="isOpen === 'factories' && sectionOpen" class="explorer-toolbar">
        <button
          v-if="sectionOpen && $can('pmp_files.view') && $can('pmp_files.upload')"
          type="button"
          class="explorer-button explorer-button--primary"
          :disabled="loading || selectedFactory?.is_active === false"
          @click="openAddFileModal"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Ավելացնել ֆայլ
        </button>
        <button
          v-if="selectedFile && $can('pmp_files.view')"
          type="button"
          class="explorer-button"
          @click="downloadFile(selectedFile)"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0 4-4m-4 4-4-4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1" />
          </svg>
          Ներբեռնել
        </button>
        <button
          v-if="selectedFile && $can('pmp_files.delete')"
          type="button"
          class="explorer-button explorer-button--danger"
          @click="openDelete(selectedFile.id)"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
          </svg>
          Ջնջել
        </button>
        <span class="flex-1"></span>
        <div v-if="sectionOpen" class="explorer-view-toggle" role="group">
          <button
            type="button"
            class="explorer-icon-button"
            :class="{ 'explorer-icon-button--on': fileView === 'grid' }"
            aria-label="Սալիկներ"
            title="Սալիկներ"
            :aria-pressed="fileView === 'grid'"
            @click="fileView = 'grid'"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            type="button"
            class="explorer-icon-button"
            :class="{ 'explorer-icon-button--on': fileView === 'list' }"
            aria-label="Ցանկ"
            title="Ցանկ"
            :aria-pressed="fileView === 'list'"
            @click="fileView = 'list'"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
            </svg>
          </button>
        </div>
      </div>

      <transition name="fade-scale">
        <div v-if="isOpen === 'remote_number'" class="explorer-folders explorer-subgroups">
          <button
            v-for="number in getPmp.remote_number"
            :key="number.id"
            type="button"
            class="explorer-folder"
            @click="showFiles(number)"
          >
            <svg class="explorer-folder__icon" viewBox="0 0 48 40" aria-hidden="true">
              <path d="M2 6a4 4 0 0 1 4-4h12l5 5h19a4 4 0 0 1 4 4v3H2V6Z" fill="#E9B949" />
              <path d="M2 12h44v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V12Z" fill="#F8D775" />
            </svg>
            <span class="explorer-folder__name">{{ number.remote_number }}</span>
            <span class="explorer-folder__meta" :title="number.remote_number_name">{{ number.remote_number_name }}</span>
          </button>
        </div>
      </transition>

      <template v-if="isOpen === 'factories'">
        <div class="explorer-split">
          <div class="explorer-nav" data-explorer-nav>
            <div class="explorer-nav__sections">
              <template v-if="infoSection">
                <p class="explorer-caption">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 4.5 19.5 9l-3 3-.5 4.5-4.5-4.5L7 16.5M15 4.5l-3 3-4.5-.5-1 1L16 17.5l1-1-.5-4.5" />
                  </svg>
                  Տեղեկատու
                </p>
                <button
                  type="button"
                  class="explorer-pinned"
                  :class="{ 'explorer-pinned--open': isSectionOpen(infoSection) }"
                  :disabled="loadingFactoryId === infoSection.id"
                  data-section="INFO"
                  @click="openSection(infoSection)"
                >
                  <svg class="h-10 w-12 shrink-0" viewBox="0 0 48 40" aria-hidden="true">
                    <path d="M2 6a4 4 0 0 1 4-4h12l5 5h19a4 4 0 0 1 4 4v3H2V6Z" fill="#60A5FA" />
                    <path d="M2 12h44v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V12Z" fill="#93C5FD" />
                    <path d="M18 24h12M18 29h8" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round" />
                  </svg>
                  <span class="min-w-0 flex-1 text-left">
                    <span class="explorer-folder__name">{{ infoSection.name || infoSection.value }}</span>
                    <span class="explorer-folder__meta">Տեքստ, նկար, ձայն և փաստաթղթեր</span>
                  </span>
                  <span class="explorer-count">{{ sectionFileCount(infoSection.id) }} ֆայլ</span>
                </button>
              </template>

              <div v-if="productionSections.length" class="explorer-caption-row">
                <p class="explorer-caption">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                  </svg>
                  Նախագծի բաժիններ
                </p>
                <div class="explorer-view-toggle" role="group" data-section-view>
                  <button
                    type="button"
                    class="explorer-icon-button"
                    :class="{ 'explorer-icon-button--on': sectionView === 'grid' }"
                    :aria-label="$t('file_explorer.sections_tiles')"
                    :title="$t('file_explorer.sections_tiles')"
                    :aria-pressed="sectionView === 'grid'"
                    @click="sectionView = 'grid'"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <rect x="3" y="5" width="5" height="14" rx="1" /><rect x="10" y="5" width="5" height="14" rx="1" /><rect x="17" y="5" width="4" height="14" rx="1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="explorer-icon-button"
                    :class="{ 'explorer-icon-button--on': sectionView === 'list' }"
                    :aria-label="$t('file_explorer.sections_list')"
                    :title="$t('file_explorer.sections_list')"
                    :aria-pressed="sectionView === 'list'"
                    @click="sectionView = 'list'"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <rect x="4" y="4" width="16" height="4" rx="1" /><rect x="4" y="10" width="16" height="4" rx="1" /><rect x="4" y="16" width="16" height="4" rx="1" />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                class="explorer-folders"
                :class="{ 'explorer-folders--list': sectionView === 'list' }"
              >
                <button
                  v-for="factory in productionSections"
                  :key="factory.id"
                  type="button"
                  class="explorer-folder"
                  :class="{ 'explorer-folder--open': isSectionOpen(factory) }"
                  :disabled="loadingFactoryId === factory.id"
                  :data-section="factory.value"
                  @click="openSection(factory)"
                >
                  <svg class="explorer-folder__icon" viewBox="0 0 48 40" aria-hidden="true">
                    <path d="M2 6a4 4 0 0 1 4-4h12l5 5h19a4 4 0 0 1 4 4v3H2V6Z" fill="#E9B949" />
                    <path
                      v-if="isSectionOpen(factory)"
                      d="M2 14h44l-4 20a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V14Z"
                      fill="#FBE29B"
                    />
                    <path v-else d="M2 12h44v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V12Z" fill="#F8D775" />
                  </svg>
                  <span class="explorer-folder__name">{{ factory.name || factory.value }}</span>
                  <span class="explorer-folder__meta">
                    <template v-if="factory.is_active === false">{{ $t('file_upload.archived_section_short') }}</template>
                    <template v-else>{{ sectionFileCount(factory.id) }} ֆայլ</template>
                  </span>
                </button>
              </div>
            </div>

            <div ref="filesPane" class="explorer-files" data-files-pane>
              <template v-if="sectionOpen && $can('pmp_files.view')">
                <p v-if="selectedFactory" class="explorer-caption explorer-caption--files">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1M3 7v10a2 2 0 0 0 2 2h12.5a2 2 0 0 0 1.9-1.4L21.5 12a1.5 1.5 0 0 0-1.4-2H8.3a2 2 0 0 0-1.9 1.4L4 19" />
                  </svg>
                  <span class="truncate">{{ selectedFactory.name || selectedFactory.value }}</span>
                  <span class="ml-auto shrink-0 font-medium normal-case tracking-normal">{{ sectionFileCount(selectedFactory.id) }} ֆայլ</span>
                </p>
                <p
                  v-if="selectedFactory?.is_active === false"
                  class="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  {{ $t('file_upload.archived_section') }}
                </p>
                <div v-if="!visibleFiles.length" class="explorer-empty">
                  <svg class="h-10 w-12" viewBox="0 0 48 40" aria-hidden="true">
                    <path d="M2 6a4 4 0 0 1 4-4h12l5 5h19a4 4 0 0 1 4 4v3H2V6Z" fill="#E2E8F0" />
                    <path d="M2 12h44v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V12Z" fill="#F1F5F9" />
                  </svg>
                  <span>{{ fileQuery ? 'Ֆայլեր չեն գտնվել' : 'Թղթապանակը դատարկ է' }}</span>
                </div>
                <div
                  v-else
                  :class="fileView === 'grid' ? 'explorer-file-grid' : 'explorer-file-list'"
                >
                  <div
                    v-for="file in visibleFiles"
                    :key="file.id"
                    class="explorer-file group"
                    :class="{ 'explorer-file--selected': selectedFile?.id === file.id }"
                  >
                    <button
                      type="button"
                      class="explorer-file__open"
                      :title="file.original_name"
                      @click="viewFile(file.path, file); revealPreview()"
                    >
                      <span class="explorer-file__icon" :data-kind="fileKind(file)" aria-hidden="true">
                        <svg v-if="fileKind(file) === 'image'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 17-5-5-8 8" /></svg>
                        <svg v-else-if="fileKind(file) === 'audio'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18V6l11-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>
                        <svg v-else-if="fileKind(file) === 'video'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></svg>
                        <svg v-else-if="fileKind(file) === 'model'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>
                        <svg v-else-if="fileKind(file) === 'drawing'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 16 12 7l5 9M9 13h6" /></svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
                      </span>
                      <span class="explorer-file__ext">{{ fileExt(file) || '—' }}<template v-if="hasCompanionModel(file)"> · 3D</template></span>
                      <span class="explorer-file__name">{{ file.original_name }}</span>
                    </button>
                    <div class="explorer-file__actions">
                      <button
                        type="button"
                        class="explorer-icon-button"
                        aria-label="Ներբեռնել"
                        title="Ներբեռնել"
                        @click.stop="downloadFile(file)"
                      >
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0 4-4m-4 4-4-4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1" />
                        </svg>
                      </button>
                      <button
                        v-if="$can('pmp_files.delete')"
                        type="button"
                        class="explorer-icon-button text-rose-600"
                        aria-label="Ջնջել"
                        title="Ջնջել"
                        @click.stop="openDelete(file.id)"
                      >
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="explorer-empty">
                <svg class="h-10 w-12" viewBox="0 0 48 40" aria-hidden="true">
                  <path d="M2 6a4 4 0 0 1 4-4h12l5 5h19a4 4 0 0 1 4 4v3H2V6Z" fill="#E9B949" />
                  <path d="M2 12h44v22a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V12Z" fill="#F8D775" />
                </svg>
                <span>Ընտրեք թղթապանակ</span>
              </div>
            </div>
          </div>

          <section ref="previewPane" class="explorer-preview" data-preview-pane>
        <transition name="fade">
          <div class="flex-1 flex flex-col">
            <div
              v-if="selectedFile && $can('pmp_files.view')"
              class="flex-1 flex flex-col"
            >
              <FileMetadataPanel :file="selectedFile" class="mb-4" />
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center break-all"
              >
                {{ selectedFile.original_name }}
              </h3>
              <div
                v-if="isNativeSolidWorks(selectedFile)"
                class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                :class="
                  companionModel
                    ? 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100'
                    : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                "
                data-cad-companion
              >
                <svg class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
                </svg>
                <span class="min-w-0 flex-1 leading-5">
                  {{
                    companionModel
                      ? $t('cad_companion.found', { name: companionModel.original_name })
                      : $t('cad_companion.missing')
                  }}
                </span>
                <button
                  v-if="companionModel"
                  type="button"
                  class="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                  @click="openCompanionModel(); revealPreview()"
                >
                  {{ $t('cad_companion.open') }}
                </button>
              </div>

              <p
                v-if="previewNote && !previewLoading"
                class="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
              >
                {{ $t(previewNote) }}
              </p>

              <div
                v-if="fileType === 'dxf' && dxfUrl && $can('pmp_files.view')"
                class="flex-1 min-h-[22rem]"
              >
                <DxfViewerModal
                  :dxf-url="dxfUrl"
                  :file-meta="selectedFile"
                  :show-laser-info="true"
                  :show-production-attributes="false"
                  class="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
                  @close="dxfUrl = ''"
                />
              </div>

              <p v-else-if="previewLoading" role="status">
                {{ $t('file_upload.loading_preview') }}
              </p>
              <p
                v-else-if="previewError"
                role="alert"
                class="text-sm text-red-600"
              >
                {{ previewError }}
              </p>

              <ModelViewer
                v-else-if="fileType === 'model' && previewModel"
                :key="selectedFile.id"
                :model="previewModel"
                :filename="selectedFile.original_name"
              />

              <div
                v-else-if="fileType === 'pdf' && previewUrl"
                class="flex min-w-0 flex-1 flex-col gap-3"
              >
                <object
                  :data="previewUrl"
                  :aria-label="selectedFile.original_name"
                  type="application/pdf"
                  class="w-full min-h-[60vh] flex-1 rounded-lg border"
                >
                  <p class="p-5 text-center text-sm text-slate-500">
                    {{ $t('file_preview.open_pdf_hint') }}
                  </p>
                </object>
                <a
                  v-if="$can('pmp_files.view')"
                  :href="previewUrl"
                  target="_blank"
                  rel="noopener"
                  class="block shrink-0 text-center text-blue-600 hover:underline"
                >
                  {{ $t('file_preview.open_pdf') }}
                </a>
              </div>

              <ImageZoomViewer
                v-else-if="fileType === 'image' && previewUrl"
                :src="previewUrl"
                :alt="selectedFile.original_name"
                @error="previewError = $t('file_upload.preview_failed')"
              />

              <audio
                v-else-if="fileType === 'audio' && previewUrl"
                :src="previewUrl"
                controls
                preload="metadata"
                class="w-full"
              />
              <video
                v-else-if="fileType === 'video' && previewUrl"
                :src="previewUrl"
                controls
                preload="metadata"
                class="w-full max-h-[60vh]"
              />
              <pre
                v-else-if="fileType === 'text'"
                class="whitespace-pre-wrap break-words rounded-lg bg-gray-50 dark:bg-gray-900 p-4 text-sm overflow-auto max-h-[60vh]"
                >{{ previewText }}</pre
              >
              <p
                v-else-if="!previewNote"
                class="text-sm text-gray-500 text-center py-6"
              >
                {{ $t('file_preview.unsupported') }}
              </p>
              <button
                type="button"
                class="mt-4 self-center rounded-lg bg-blue-600 px-5 py-3 text-white"
                @click="downloadFile(selectedFile)"
              >
                {{ $t('file_upload.download') }}
              </button>
            </div>
            <div
              v-else
              class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400"
            >
              <div
                class="flex items-center justify-center gap-2 text-lg text-blue-700 font-medium py-4 px-6 bg-blue-50 rounded-xl border border-blue-200"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                Ընտրեք ֆայլ՝ դիտելու համար
              </div>
            </div>
          </div>
        </transition>
          </section>
        </div>
      </template>

      <div class="explorer-status">
        <span v-if="sectionOpen">{{ visibleFiles.length }} տարր</span>
        <span v-else-if="isOpen === 'factories'">{{ (getFactory || []).length }} տարր</span>
        <span v-else>{{ (getPmp.remote_number || []).length }} տարր</span>
        <span v-if="selectedFile" class="truncate">1 ընտրված</span>
        <span class="ml-auto font-mono">{{ groupCode }}<template v-if="selectedRemoteNumber"> / {{ subgroupCode }}</template></span>
      </div>
    </section>

    <AddFileModal
      :is-open-modal="isOpenAddFileModal"
      :file="currentFile"
      :is-dxf-file="requiresDxfMetadata"
      :factory="selectedFactory"
      :extensions="allowedExtensions"
      :server-validated-formats="serverValidatedFormats"
      :policy-loading="policyLoading"
      :policy-error="policyError"
      :upload-error="uploadError"
      :busy="uploading"
      :can-submit="canSubmitFile"
      :show-uploader="!isInfoFactory || infoMode !== 'text'"
      @closeModal="openAddFileModal"
      @createFile="addFile"
      @dropped="handleFileDrop"
      @retry-policy="loadFactoryPolicy"
    >
      <template v-if="isInfoFactory && isOpenAddFileModal" #info-content>
        <InfoContentInput
          :mode="infoMode"
          :text="infoText"
          :title="infoTitle"
          :file="fileData.file"
          :extensions="allowedExtensions"
          :disabled="uploading || policyLoading || !!policyError"
          @mode-change="changeInfoMode"
          @text-change="
            infoText = $event
            uploadError = ''
          "
          @title-change="
            infoTitle = $event
            uploadError = ''
          "
          @file-selected="handleFileDrop"
          @recording-change="recording = $event"
        />
      </template>
      <template #file-input>
        <input
          :key="`${selectedFactoryId}-${infoMode}-${fileInputKey}`"
          type="file"
          :multiple="canPickMultiple"
          class="hidden"
          :accept="fileAccept"
          :disabled="
            uploading ||
            recording ||
            policyLoading ||
            !!policyError ||
            !allowedExtensions.length
          "
          @change="handleFileChange"
        />
      </template>

      <template v-if="requiresDxfMetadata" #quantity>
        <InputWithLabelIcon
          v-model="fileData.quantity"
          type="number"
          name="quantity"
          autocomplete="off"
          label="Քանակ լրակազմում"
          :disabled="uploading"
          min="1"
        />
      </template>

      <template v-if="requiresDxfMetadata" #materialType>
        <div class="relative">
          <InputWithLabelIcon
            v-model="fileData.material"
            type="text"
            name="materialType"
            autocomplete="off"
            label="Նյութ"
            :disabled="uploading"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-3 text-gray-500"
            :disabled="
              uploading || materialsLoading || productionWorkshopsLoading
            "
            data-project-material-picker
            @click="openMaterials"
          >
            ▼
          </button>
          <div
            v-if="isSelectedMaterials"
            data-project-material-options
            class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto"
          >
            <ul class="py-1">
              <li
                v-for="material in filteredMaterials"
                :key="material.id"
                class="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                @click="selectMaterial(material)"
              >
                {{ material.description }}
              </li>
            </ul>
          </div>
        </div>
      </template>

      <template v-if="requiresDxfMetadata" #thickness>
        <InputWithLabelIcon
          v-model="fileData.thickness"
          type="number"
          name="thickness"
          autocomplete="off"
          label="Հաստություն"
          :disabled="uploading"
          min="0"
          step="any"
        />
      </template>
      <template v-if="requiresDxfMetadata" #dimensions>
        <InputWithLabelIcon
          v-model="fileData.dimensions"
          type="text"
          name="dimensions"
          autocomplete="off"
          :label="$t('file_plan.dimensions')"
          :placeholder="$t('file_plan.dimensions_example')"
          :disabled="uploading"
        />
      </template>
      <template #file-plans>
        <div v-if="pendingFiles.length" class="space-y-3" data-pending-files>
          <article
            v-for="(entry, index) in pendingFiles"
            :key="entry.file.name"
            class="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            :data-pending-file="entry.file.name"
          >
            <div class="mb-2 flex items-start justify-between gap-3">
              <span class="min-w-0 break-words text-sm font-semibold">{{
                entry.file.name
              }}</span>
              <button
                type="button"
                :disabled="uploading"
                class="shrink-0 text-sm font-semibold text-red-600"
                :aria-label="
                  $t('file_plan.remove_file', { name: entry.file.name })
                "
                @click="removePendingFile(index)"
              >
                ×
              </button>
            </div>
            <FileProductionPlan
              v-if="!selectedFactory?.is_reference"
              v-model="entry.plan"
              :factories="getProductionWorkshops || []"
              :default-factory-id="selectedFactory?.default_factory_id"
              :disabled="uploading"
              :loading="productionWorkshopsLoading"
              :error="productionWorkshopsError"
              @retry="loadProductionWorkshops"
            />
          </article>
        </div>
        <FileProductionPlan
          v-else-if="fileData.file && !selectedFactory?.is_reference"
          v-model="filePlan"
          :factories="getProductionWorkshops || []"
          :default-factory-id="selectedFactory?.default_factory_id"
          :disabled="uploading"
          :loading="productionWorkshopsLoading"
          :error="productionWorkshopsError"
          @retry="loadProductionWorkshops"
        />
      </template>
    </AddFileModal>

    <PopupModal
      :is-open-modal="isOpenModal"
      text="Վստահ եք, որ ուզում եք ջնջել՞"
      @close-modal="closeModal"
      @confirm="deleteDxfFile"
    />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'
import PopupModal from '~/components/modals/popup-modal/PopupModal.vue'
import AddFileModal from '~/components/modals/add-file/AddFile.vue'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import InfoContentInput from '~/components/modals/add-file/InfoContentInput.vue'
import FileProductionPlan from '@/components/engineer/FileProductionPlan.vue'
import FileMetadataPanel from '@/components/File/FileMetadataPanel.vue'
import { needsIndividualFileAttributes } from '@/utils/workshop-catalog'
import CadPreviewWorker from '~/workers/cad-preview.worker.js'
import CadModelWorker from '~/workers/cad-model.worker.js'
import ModelViewer from '~/components/File/ModelViewer.vue'
import ImageZoomViewer from '~/components/File/ImageZoomViewer.vue'
import { inspectFactoryPreview } from '~/utils/factory-preview'
import {
  allowsExtension,
  inputAccept,
  normalizeExtensions,
  previewType,
  textAttachment,
  uploadErrorMessage,
  validateFactoryFile,
} from '~/utils/factory-file-policy'

export default {
  name: 'EngineerFilesView',
  components: {
    FileProductionPlan,
    FileMetadataPanel,
    InputWithLabelIcon,
    AddFileModal,
    PopupModal,
    DxfViewerModal,
    InfoContentInput,
    ModelViewer,
    ImageZoomViewer,
  },
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },

  data() {
    return {
      loadingFactoryId: null,
      loading: false,
      pageError: '',
      factoryListError: '',
      projectReady: false,
      uploading: false,
      recording: false,
      factoryPolicies: [],
      policyLoading: false,
      policyError: '',
      policyRequest: 0,
      uploadError: '',
      infoMode: 'file',
      infoText: '',
      infoTitle: '',
      fileInputKey: 0,
      previewLoading: false,
      previewError: '',
      previewUrl: '',
      previewText: '',
      previewModel: null,
      previewRequest: 0,
      previewTaskCancel: null,
      previewNote: '',
      isOpen: 'remote_number',
      isOpenFiles: 'files_by_id',
      id: '',
      dxfUrl: '',
      fileType: null,
      selectedFactoryId: null,
      selectedRemoteNumber: null,
      selectedRemoteNumberId: null,
      selectedFiles: [],
      selectedFile: null,
      hoveredFileId: null,
      isOpenModal: false,
      isOpenAddFileModal: false,
      isDxfFile: false,
      isSelectedMaterials: false,
      fileData: { quantity: null, material: '', thickness: '', file: null },
      pendingFiles: [],
      filePlan: { production_factory_ids: null, inspection_required: false },
      productionWorkshopsLoading: false,
      productionWorkshopsError: '',
      productionWorkshops: [],
      productionOptionsLoaded: false,
      productionOptionsRequest: 0,
      uploadMaterials: [],
      materialsLoading: false,
      currentFile: { name: '', size: 0 },
      toDeleteId: null,
      // Explorer view state (display only).
      fileQuery: '',
      fileView: 'grid',
      sectionView: 'grid',
    }
  },

  computed: {
    ...mapGetters('pmp', ['getPmp', 'errorMessage']),
    ...mapGetters('factory', { getFactory: 'getFileCategories' }),
    getProductionWorkshops() {
      return this.productionWorkshops
    },
    groupCode() {
      const code = String(this.getPmp?.group ?? '').trim()
      return /^\d+$/.test(code) ? code.padStart(3, '0') : code || '—'
    },
    subgroupCode() {
      const code = String(this.selectedRemoteNumber?.remote_number ?? '').trim()
      return /^\d+$/.test(code) ? code.padStart(2, '0') : code || '—'
    },
    breadcrumb() {
      if (!this.projectReady) return []
      const trail = [
        `${this.groupCode} — ${this.getPmp.group_name || 'Նախագիծ'}`,
      ]
      if (this.selectedRemoteNumber)
        trail.push(
          `${this.subgroupCode} — ${
            this.selectedRemoteNumber.remote_number_name || ''
          }`
        )
      if (this.selectedFactory) trail.push(this.selectedFactory.value)
      if (this.selectedFile) trail.push(this.selectedFile.original_name)
      return trail
    },
    selectedFactory() {
      return (
        (this.getFactory || []).find(
          (factory) => this.n(factory.id) === this.selectedFactoryId
        ) || null
      )
    },
    requiresDxfMetadata() {
      return (
        !this.selectedFactory?.is_reference &&
        !this.pendingFiles.length &&
        (this.fileData.file
          ? needsIndividualFileAttributes(this.fileData.file.name)
          : ['DXF', 'IC'].includes(this.selectedFactory?.value))
      )
    },
    isInfoFactory() {
      return this.selectedFactory?.value === 'INFO'
    },
    // The INFO reference section is pinned above the other folders.
    infoSection() {
      return (
        (this.getFactory || []).find(
          (factory) => String(factory.value || '').toUpperCase() === 'INFO'
        ) || null
      )
    },
    productionSections() {
      return (this.getFactory || []).filter(
        (factory) => factory !== this.infoSection
      )
    },
    sectionOpen() {
      return (
        !!this.selectedFactory && this.isOpenFiles === this.selectedFactoryId
      )
    },
    // Base names of 3D exports (STEP/IGES/STL/OBJ) in the open subgroup.
    modelBaseNames() {
      return new Set(
        (this.getPmp?.files || [])
          .filter(
            (file) =>
              this.n(file.remote_number_id) === this.selectedRemoteNumberId &&
              /\.(step|stp|igs|iges|stl|obj)$/i.test(file.original_name || '')
          )
          .map((file) => this.baseName(file.original_name))
      )
    },
    companionModel() {
      const file = this.selectedFile
      if (!this.isNativeSolidWorks(file)) return null
      const base = this.baseName(file.original_name)
      return (
        (this.getPmp?.files || []).find(
          (other) =>
            other.id !== file.id &&
            this.n(other.remote_number_id) === this.n(file.remote_number_id) &&
            /\.(step|stp|igs|iges|stl|obj)$/i.test(other.original_name || '') &&
            this.baseName(other.original_name) === base
        ) || null
      )
    },
    visibleFiles() {
      const query = this.fileQuery.trim().toLowerCase()
      if (!query) return this.selectedFiles
      return this.selectedFiles.filter((file) =>
        String(file.original_name || '')
          .toLowerCase()
          .includes(query)
      )
    },
    allowedExtensions() {
      const policy = this.factoryPolicies.find(
        (factory) => this.n(factory.id) === this.selectedFactoryId
      )
      return normalizeExtensions(policy?.extensions)
    },
    serverValidatedFormats() {
      return !!this.factoryPolicies.find(
        (factory) => this.n(factory.id) === this.selectedFactoryId
      )?.serverValidatedFormats
    },
    fileAccept() {
      return inputAccept(
        this.allowedExtensions,
        this.isInfoFactory ? this.infoMode : 'file'
      )
    },
    canPickMultiple() {
      return (
        (!this.isInfoFactory || this.infoMode === 'file') &&
        this.allowedExtensions.some(
          (extension) => !['dxf', 'ic'].includes(extension)
        )
      )
    },
    canSubmitFile() {
      return (
        this.selectedFactory?.is_active !== false &&
        !this.recording &&
        this.allowedExtensions.length > 0 &&
        (this.isInfoFactory && this.infoMode === 'text'
          ? allowsExtension(this.allowedExtensions, 'txt') &&
            !!this.infoText.trim()
          : !!this.fileData.file || this.pendingFiles.length > 0)
      )
    },
    materials() {
      return this.uploadMaterials
    },
    filteredMaterials() {
      if (!this.fileData.material) return this.materials
      const q = this.fileData.material.toLowerCase()
      return this.materials.filter((m) =>
        (m.description || '').toLowerCase().includes(q)
      )
    },
  },

  watch: {
    sectionView: 'saveExplorerViews',
    fileView: 'saveExplorerViews',
    selectedFactoryId() {
      this.$nextTick(() => {
        if (this.$refs.filesPane) this.$refs.filesPane.scrollTop = 0
      })
    },
  },

  created() {
    this.id = this.$route.query.id
    if (this.id) {
      this.loadPage()
    } else {
      this.$notify({ text: 'ID-ն բացակայում է', type: 'error' })
    }
  },

  mounted() {
    // Tile/list choices are a per-browser convenience.
    try {
      const saved = JSON.parse(
        window.localStorage.getItem('metalworks.files.views') || '{}'
      )
      if (['grid', 'list'].includes(saved.sections))
        this.sectionView = saved.sections
      if (['grid', 'list'].includes(saved.files)) this.fileView = saved.files
    } catch (_) {}
  },

  beforeDestroy() {
    ++this.policyRequest
    ++this.productionOptionsRequest
    this.clearPreview()
  },

  methods: {
    ...mapActions('pmp', ['fetchPmp', 'deleteFile', 'createPmpFilesByFactory']),
    ...mapActions('factory', [
      'fetchFactoryFilePolicies',
      'fetchFileCategories',
      'downloadUploadedFile',
    ]),

    async loadPage() {
      if (this.loading) return
      this.loading = true
      this.pageError = ''
      this.factoryListError = ''
      this.projectReady = false
      try {
        const [project, policies] = await Promise.allSettled([
          this.fetchPmp(this.id),
          this.fetchFactoryFilePolicies(),
        ])
        if (project.status === 'fulfilled') {
          const number = (this.getPmp.remote_number || []).find(
            (remote) => this.n(remote.id) === this.n(this.id)
          )
          if (number) {
            this.projectReady = true
            this.showFiles(number)
          } else this.pageError = this.$t('file_upload.project_failed')
        } else this.pageError = this.$t('file_upload.project_failed')

        if (policies.status === 'fulfilled')
          this.factoryPolicies = policies.value
        else {
          this.factoryPolicies = []
          // A formats error must not hide an otherwise readable project.
          if (!(await this.fetchFileCategories()))
            this.factoryListError = this.$t('file_upload.factories_failed')
        }
      } catch (error) {
        this.factoryListError = this.$t('file_upload.factories_failed')
      } finally {
        this.loading = false
      }
    },

    n(v) {
      return Number(v)
    },
    async openMaterials() {
      if (this.materialsLoading || this.productionWorkshopsLoading) return
      if (this.isSelectedMaterials) {
        this.isSelectedMaterials = false
        return
      }
      this.materialsLoading = true
      try {
        if (
          !this.productionOptionsLoaded &&
          !(await this.loadProductionWorkshops())
        )
          return
        if (this.isOpenAddFileModal) this.isSelectedMaterials = true
      } finally {
        this.materialsLoading = false
      }
    },

    selectMaterial(material) {
      this.fileData.material = material.description
      this.fileData.thickness = material.thickness
      this.fileData.dimensions = [
        material.width,
        material.length,
        material.height,
      ]
        .filter(
          (value) => value !== null && value !== undefined && value !== ''
        )
        .join(' × ')
      this.isSelectedMaterials = false
    },

    showButton(id) {
      this.hoveredFileId = id
    },
    hideButton(id) {
      if (this.hoveredFileId === id) this.hoveredFileId = null
    },

    showFiles(number) {
      this.clearPreview()
      this.isOpen = 'factories'
      this.selectedRemoteNumber = number
      this.selectedRemoteNumberId = this.n(number.id)
      this.selectedFiles = (this.getPmp.files || []).filter(
        (f) => this.n(f.remote_number_id) === this.selectedRemoteNumberId
      )
      this.dxfUrl = ''
      this.fileType = null
      this.selectedFile = null
      this.isDxfFile = false
      this.selectedFactoryId = null
      this.resetFileFields()
    },

    selectFactory(factory) {
      this.clearPreview()
      this.resetFileFields()
      this.isDxfFile = factory.value === 'DXF'
      this.loadingFactoryId = factory.id
      this.loading = true
      try {
        this.isOpenFiles =
          this.isOpenFiles === this.n(factory.id) ? null : this.n(factory.id)

        this.selectedFactoryId = this.n(factory.id)
        this.selectedFiles = (this.getPmp.files || []).filter(
          (f) =>
            this.n(f.factory_id) === this.selectedFactoryId &&
            this.n(f.remote_number_id) === this.selectedRemoteNumberId
        )

        this.dxfUrl = ''
        this.fileType = null
        this.selectedFile = null
      } finally {
        this.loadingFactoryId = null
        this.loading = false
      }
    },

    handleFileChange(e) {
      const files = Array.from(e.target.files || [])
      if (files.length)
        this.handleFileDrop(files.length === 1 ? files[0] : files)
      // Selecting the same file again must trigger validation after a rejection.
      e.target.value = ''
    },

    handleFileDrop(file) {
      if (
        this.uploading ||
        this.recording ||
        this.policyLoading ||
        this.policyError
      )
        return
      if (Array.isArray(file)) {
        if (file.length === 1) return this.handleFileDrop(file[0])
        if (
          file.length > 50 ||
          file.reduce((sum, item) => sum + item.size, 0) > 100 * 1024 * 1024
        ) {
          this.uploadError = this.$t('file_plan.batch_limit')
          return
        }
        if (file.some((item) => needsIndividualFileAttributes(item.name))) {
          this.uploadError = this.$t('file_plan.individual_only')
          return
        }
        const issue = file
          .map((item) =>
            validateFactoryFile(
              item,
              this.allowedExtensions,
              this.isInfoFactory ? this.infoMode : 'file'
            )
          )
          .find(Boolean)
        if (
          issue ||
          new Set(file.map((item) => item.name)).size !== file.length
        ) {
          this.uploadError = issue
            ? this.$t('file_upload.' + issue)
            : this.$t('file_plan.duplicate_names')
          return
        }
        this.pendingFiles = file.map((item) => ({
          file: item,
          plan: { production_factory_ids: null, inspection_required: false },
        }))
        this.fileData.file = null
        this.currentFile = {
          name: this.$t('file_plan.selected_files', { count: file.length }),
          size: file.reduce((sum, item) => sum + item.size, 0),
        }
        this.uploadError = ''
        return
      }
      const error = validateFactoryFile(
        file,
        this.allowedExtensions,
        this.isInfoFactory ? this.infoMode : 'file'
      )
      if (error) {
        this.uploadError = this.$t(`file_upload.${error}`)
        this.fileData.file = null
        this.currentFile = { name: '', size: 0 }
        return
      }
      this.uploadError = ''
      this.currentFile = { name: file.name, size: file.size }
      this.fileData.file = file
      this.pendingFiles = []
      this.filePlan = {
        production_factory_ids: null,
        inspection_required: false,
      }
    },

    removePendingFile(index) {
      this.pendingFiles.splice(index, 1)
      this.currentFile = {
        name: this.pendingFiles.length
          ? this.$t('file_plan.selected_files', {
              count: this.pendingFiles.length,
            })
          : '',
        size: this.pendingFiles.reduce(
          (sum, entry) => sum + entry.file.size,
          0
        ),
      }
    },

    async loadProductionWorkshops() {
      if (this.productionWorkshopsLoading) return false
      const request = ++this.productionOptionsRequest
      this.productionWorkshopsLoading = true
      this.productionWorkshopsError = ''
      try {
        const data = await this.$axios.$get('/api/engineers/pmp-file-options')
        if (request !== this.productionOptionsRequest) return false
        if (!Array.isArray(data?.workshops) || !Array.isArray(data?.materials))
          throw new Error('Invalid file options')
        this.productionWorkshops = data.workshops
        this.uploadMaterials = data.materials
        this.productionOptionsLoaded = true
        return true
      } catch (error) {
        if (request === this.productionOptionsRequest)
          this.productionWorkshopsError = this.$t(
            'order_configuration.workshops_load_failed'
          )
        return false
      } finally {
        if (request === this.productionOptionsRequest)
          this.productionWorkshopsLoading = false
      }
    },

    async addFile() {
      if (
        this.uploading ||
        this.recording ||
        this.policyLoading ||
        this.policyError
      )
        return
      let { file } = this.fileData
      const batch = this.pendingFiles.length > 0
      const { quantity, material, thickness } = this.fileData
      const isDxf = this.requiresDxfMetadata
      this.uploadError = ''
      if (this.isInfoFactory && this.infoMode === 'text') {
        if (!this.infoText.trim()) {
          this.uploadError = this.$t('file_upload.text_required')
          return
        }
        file = textAttachment(
          this.infoTitle || `info-${Date.now()}`,
          this.infoText
        )
      }
      const error = (
        batch ? this.pendingFiles.map((entry) => entry.file) : [file]
      )
        .map((file) =>
          validateFactoryFile(
            file,
            this.allowedExtensions,
            this.isInfoFactory ? this.infoMode : 'file'
          )
        )
        .find(Boolean)
      if (error) {
        this.uploadError = this.$t(`file_upload.${error}`)
        return
      }
      if (
        isDxf &&
        (!Number.isInteger(Number(quantity)) ||
          Number(quantity) < 1 ||
          !material.trim() ||
          String(thickness).trim() === '' ||
          !Number.isFinite(Number(thickness)) ||
          Number(thickness) < 0)
      ) {
        this.uploadError = this.$t('file_upload.dxf_fields_required')
        return
      }

      this.uploading = true
      const formData = new FormData()
      if (batch) {
        formData.append('expected_file_count', this.pendingFiles.length)
        this.pendingFiles.forEach((entry) =>
          formData.append('files[]', entry.file)
        )
        formData.append(
          'file_plans',
          JSON.stringify(
            this.pendingFiles.map((entry) =>
              this.selectedFactory?.is_reference ? {} : entry.plan
            )
          )
        )
      } else {
        formData.append('file', file)
        if (!this.selectedFactory?.is_reference) {
          if (this.filePlan.production_factory_ids !== null)
            formData.append(
              'production_factory_ids',
              JSON.stringify(this.filePlan.production_factory_ids)
            )
          formData.append(
            'inspection_required',
            this.filePlan.inspection_required ? '1' : '0'
          )
        }
      }
      formData.append('pmp_id', this.getPmp.id)
      formData.append('remote_number_id', this.selectedRemoteNumberId)
      formData.append('factory_id', this.selectedFactoryId)
      if (this.selectedFactory?.file_category_id)
        formData.append(
          'file_category_id',
          this.selectedFactory.file_category_id
        )
      if (isDxf) {
        formData.append('quantity', quantity)
        formData.append('material_type', material.trim())
        formData.append('thickness', thickness)
        if (this.fileData.dimensions?.trim())
          formData.append('dimensions', this.fileData.dimensions.trim())
      }

      try {
        await this.createPmpFilesByFactory(formData)
        this.$notify({ text: this.$t('file_upload.saved'), type: 'success' })
        this.isOpenAddFileModal = false
        this.resetFileFields()
        try {
          await this.fetchPmp(this.id)
        } catch (error) {
          this.$notify({
            text: this.$t('file_upload.refresh_failed'),
            type: 'warning',
          })
        }
        this.selectedFiles = (this.getPmp.files || []).filter(
          (f) =>
            this.n(f.remote_number_id) ===
              this.n(this.selectedRemoteNumberId) &&
            this.n(f.factory_id) === this.n(this.selectedFactoryId)
        )
      } catch (error) {
        this.uploadError =
          error.response?.status === 413
            ? this.$t('file_upload.server_limit')
            : uploadErrorMessage(error, this.$t('file_upload.save_failed'))
      } finally {
        this.uploading = false
      }
    },

    async viewFile(filePath, file) {
      this.clearPreview()
      this.selectedFile = file
      this.dxfUrl = filePath
      this.isOpenFiles = this.n(file.factory_id)
      this.isDxfFile =
        this.n(file.factory_id) === this.selectedFactoryId && this.isDxfFile
      this.fileType = previewType(file.original_name || filePath)
      if (this.fileType === 'dxf') return
      const request = this.previewRequest
      const type = this.fileType
      this.previewLoading = true
      try {
        const { data } = await this.$axios.get(this.fileUrl(file), {
          responseType: 'blob',
        })
        if (request !== this.previewRequest) return
        const preview = await inspectFactoryPreview(
          data,
          file.original_name || filePath,
          type
        )
        if (request !== this.previewRequest) return
        this.fileType = preview.type
        if (preview.type === 'model') {
          const result = await this.importCadModel(
            preview.bytes,
            preview.format,
            file.original_name || filePath
          )
          if (request !== this.previewRequest) return
          if (result.model) this.previewModel = Object.freeze(result.model)
          else
            this.previewError = this.$t('model_preview.error_' + result.error)
        } else if (preview.type === 'text') {
          this.previewText = preview.text
          if (preview.truncated) this.previewNote = 'file_preview.truncated'
        } else if (preview.type === 'cad') {
          const image = await this.extractCadPreview(
            preview.bytes,
            file.original_name || filePath
          )
          if (request !== this.previewRequest) return
          if (image) {
            this.fileType = 'image'
            this.previewNote = 'file_preview.saved_view'
            this.previewUrl = URL.createObjectURL(
              new Blob([image.bytes], { type: `image/${image.format}` })
            )
          } else this.previewNote = 'file_preview.no_saved_view'
        } else if (preview.blob) {
          // Blob URLs preserve authenticated access without frame/cookie restrictions.
          this.previewUrl = URL.createObjectURL(preview.blob)
        }
      } catch (error) {
        if (request === this.previewRequest)
          this.previewError = this.$t('file_upload.preview_failed')
      } finally {
        if (request === this.previewRequest) this.previewLoading = false
      }
    },

    clearPreview() {
      ++this.previewRequest
      if (this.previewTaskCancel) this.previewTaskCancel()
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl)
      this.previewUrl = this.previewText = this.previewError = ''
      this.previewNote = ''
      this.previewLoading = false
      this.previewModel = null
    },

    importCadModel(bytes, format, filename) {
      return new Promise((resolve) => {
        let worker
        let timer
        let finished = false
        const finish = (result) => {
          if (finished) return
          finished = true
          clearTimeout(timer)
          worker?.terminate()
          this.previewTaskCancel = null
          resolve(result)
        }
        this.previewTaskCancel = () => finish({ error: 'cancelled' })
        try {
          worker = new CadModelWorker()
          worker.onmessage = ({ data }) => finish(data)
          worker.onerror = () => finish({ error: 'unavailable' })
          timer = setTimeout(() => finish({ error: 'timeout' }), 45000)
          worker.postMessage({ buffer: bytes.buffer, format, filename }, [
            bytes.buffer,
          ])
        } catch (_) {
          finish({ error: 'unavailable' })
        }
      })
    },

    extractCadPreview(bytes, filename) {
      return new Promise((resolve) => {
        let worker
        let timer
        let finished = false
        const finish = (result) => {
          if (finished) return
          finished = true
          clearTimeout(timer)
          if (worker) worker.terminate()
          this.previewTaskCancel = null
          resolve(result)
        }
        this.previewTaskCancel = () => finish(null)
        try {
          worker = new CadPreviewWorker()
          worker.onmessage = ({ data }) => finish(data)
          worker.onerror = () => finish(null)
          timer = setTimeout(() => finish(null), 10000)
          worker.postMessage({ buffer: bytes.buffer, filename }, [bytes.buffer])
        } catch (_) {
          finish(null)
        }
      })
    },

    async downloadFile(file) {
      try {
        await this.downloadUploadedFile(file)
      } catch (error) {
        this.$notify?.({
          text:
            error?.response?.data?.message ||
            error?.message ||
            'Ֆայլի ներբեռնումը ձախողվեց',
          type: 'error',
        })
      }
    },

    fileUrl(file) {
      if (!file) return null
      if (file.id && this.$getPmpFileUrl) return this.$getPmpFileUrl(file)
      return this.$getFileUrl ? this.$getFileUrl(file.path) : null
    },

    openDelete(id) {
      this.toDeleteId = id
      this.isOpenModal = true
    },
    closeModal() {
      this.isOpenModal = false
      this.toDeleteId = null
    },

    async deleteDxfFile() {
      if (!this.toDeleteId) return
      this.loading = true
      try {
        await this.deleteFile(this.toDeleteId)
        await this.fetchPmp(this.id)
        this.selectedFiles = this.selectedFiles.filter(
          (f) => f.id !== this.toDeleteId
        )
        if (this.selectedFile?.id === this.toDeleteId) {
          this.clearPreview()
          this.selectedFile = null
          this.dxfUrl = ''
          this.fileType = null
        }
        this.$notify({ text: 'Ֆայլը ջնջվեց', type: 'success' })
      } catch (error) {
        this.$notify({
          text: uploadErrorMessage(error, this.$t('file_upload.delete_failed')),
          type: 'error',
        })
      } finally {
        this.isOpenModal = false
        this.toDeleteId = null
        this.loading = false
      }
    },

    openAddFileModal() {
      if (
        this.uploading ||
        (!this.isOpenAddFileModal && this.selectedFactory?.is_active === false)
      )
        return
      this.isOpenAddFileModal = !this.isOpenAddFileModal
      if (this.isOpenAddFileModal) {
        this.loadFactoryPolicy()
        this.loadProductionWorkshops()
      } else {
        ++this.policyRequest
        this.policyLoading = false
        this.resetFileFields()
      }
    },

    async loadFactoryPolicy() {
      const request = ++this.policyRequest
      this.policyLoading = true
      this.policyError = ''
      this.factoryPolicies = []
      try {
        const policies = await this.fetchFactoryFilePolicies()
        if (request !== this.policyRequest) return
        if (
          !policies.some(
            (factory) => this.n(factory.id) === this.selectedFactoryId
          )
        )
          throw new Error('Factory policy missing')
        this.factoryPolicies = policies
      } catch (error) {
        if (request === this.policyRequest)
          this.policyError = this.$t('file_upload.policy_failed')
      } finally {
        if (request === this.policyRequest) this.policyLoading = false
      }
    },

    changeInfoMode(mode) {
      if (this.uploading || this.recording) return
      this.infoMode = mode
      this.fileData.file = null
      this.pendingFiles = []
      this.currentFile = { name: '', size: 0 }
      this.uploadError = ''
      ++this.fileInputKey
    },

    resetFileFields() {
      ++this.productionOptionsRequest
      this.productionWorkshopsLoading = this.materialsLoading = false
      this.productionOptionsLoaded = false
      this.productionWorkshops = this.uploadMaterials = []
      this.fileData = {
        quantity: null,
        material: '',
        thickness: '',
        dimensions: '',
        file: null,
      }
      this.currentFile = { name: '', size: 0 }
      this.pendingFiles = []
      this.filePlan = {
        production_factory_ids: null,
        inspection_required: false,
      }
      this.isSelectedMaterials = false
      this.infoMode = 'file'
      this.infoText = this.infoTitle = this.uploadError = ''
      this.recording = false
      ++this.fileInputKey
    },

    selectBreadcrumb(index) {
      if (index === 3) return
      this.clearPreview()
      if (index === 0) {
        this.isOpen = 'remote_number'
        this.selectedFactoryId = null
        this.selectedRemoteNumber = null
        this.selectedRemoteNumberId = null
        this.dxfUrl = null
        this.fileType = null
        this.selectedFiles = []
        this.selectedFile = null
        this.isDxfFile = false
        this.resetFileFields()
      } else if (index === 1) {
        if (this.selectedRemoteNumber) this.showFiles(this.selectedRemoteNumber)
      } else if (index === 2) {
        const fac = this.selectedFactory
        if (fac) {
          this.selectedFactoryId = this.n(fac.id)
          this.isOpenFiles = this.selectedFactoryId
          this.isDxfFile = fac.value === 'DXF'
          this.selectedFiles = (this.getPmp.files || []).filter(
            (f) =>
              this.n(f.factory_id) === this.selectedFactoryId &&
              this.n(f.remote_number_id) === this.selectedRemoteNumberId
          )
          this.dxfUrl = null
          this.fileType = null
          this.selectedFile = null
          this.resetFileFields()
        }
      }
    },

    hasFiles(factoryId) {
      return (this.getPmp.files || []).some(
        (f) =>
          this.n(f.factory_id) === this.n(factoryId) &&
          this.n(f.remote_number_id) === this.selectedRemoteNumberId
      )
    },

    sectionFileCount(factoryId) {
      return (this.getPmp.files || []).filter(
        (f) =>
          this.n(f.factory_id) === this.n(factoryId) &&
          this.n(f.remote_number_id) === this.selectedRemoteNumberId
      ).length
    },

    isSectionOpen(factory) {
      const id = this.n(factory?.id)
      return this.selectedFactoryId === id && this.isOpenFiles === id
    },

    // Opening a folder never closes it again; "Up" leaves it.
    openSection(factory) {
      if (this.isSectionOpen(factory)) return
      this.fileQuery = ''
      if (this.isOpenFiles === this.n(factory.id)) this.isOpenFiles = null
      this.selectFactory(factory)
    },

    goUp() {
      if (this.breadcrumb.length < 2) return
      this.fileQuery = ''
      this.selectBreadcrumb(this.breadcrumb.length - 2)
    },

    saveExplorerViews() {
      try {
        window.localStorage.setItem(
          'metalworks.files.views',
          JSON.stringify({ sections: this.sectionView, files: this.fileView })
        )
      } catch (_) {}
    },

    baseName(name) {
      return String(name || '')
        .replace(/\.[^.]+$/, '')
        .trim()
        .toLowerCase()
    },

    // SolidWorks part/assembly files cannot be read in the browser; their 3D
    // view comes from a STEP/IGES/STL/OBJ export with the same name.
    isNativeSolidWorks(file) {
      return /\.(sldprt|sldasm)$/i.test(file?.original_name || '')
    },

    hasCompanionModel(file) {
      return (
        this.isNativeSolidWorks(file) &&
        this.modelBaseNames.has(this.baseName(file.original_name))
      )
    },

    // Large screens show the preview pane beside the files: start it at the
    // top. Small screens stack it under the files: bring it into view.
    revealPreview() {
      this.$nextTick(() => {
        const pane = this.$refs.previewPane
        if (!pane) return
        if (window.matchMedia?.('(min-width: 1024px)').matches) {
          pane.scrollTop = 0
        } else if (pane.getBoundingClientRect().top > window.innerHeight * 0.75) {
          const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
          pane.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
        }
      })
    },
    openCompanionModel() {
      const file = this.companionModel
      if (!file) return
      const section = (this.getFactory || []).find(
        (factory) => this.n(factory.id) === this.n(file.factory_id)
      )
      if (section && !this.isSectionOpen(section)) this.openSection(section)
      this.viewFile(file.path, file)
    },

    fileExt(file) {
      const name = String(file?.original_name || file?.path || '')
      return (name.match(/\.([a-z0-9_]{1,8})$/i)?.[1] || '').toUpperCase()
    },

    fileKind(file) {
      const ext = this.fileExt(file).toLowerCase()
      if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext))
        return 'image'
      if (['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'webm'].includes(ext))
        return 'audio'
      if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video'
      if (
        ['step', 'stp', 'igs', 'iges', 'sldprt', 'sldasm', 'stl', 'obj', 'x_t', '3mf'].includes(ext)
      )
        return 'model'
      if (['dxf', 'dwg', 'dld', 'ic'].includes(ext)) return 'drawing'
      return 'document'
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active {
  animation: slideUp 0.4s ease;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-scale-enter-active {
  animation: fadeScale 0.35s ease;
}
@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
/* Explorer layout (Windows folders style) */
.explorer {
  @apply rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900;
  /* clip (unlike hidden) keeps the sticky address bar working */
  overflow: hidden;
  overflow: clip;
}
.explorer-bar {
  @apply flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40;
}
.explorer-path {
  @apply flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900;
}
.explorer-crumb {
  @apply max-w-[16rem] shrink-0 truncate rounded-md px-1.5 py-0.5 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800;
}
.explorer-crumb--current {
  @apply font-semibold text-slate-900 dark:text-white;
}
.explorer-search {
  @apply flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-56;
}
.explorer-toolbar {
  @apply flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800;
}
.explorer-button {
  @apply inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800;
}
.explorer-button--primary {
  @apply border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200;
}
.explorer-button--danger {
  @apply text-rose-600 dark:text-rose-300;
}
.explorer-icon-button {
  @apply inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white;
}
.explorer-icon-button--on {
  @apply bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white;
}
.explorer-view-toggle {
  @apply flex items-center gap-1;
}
.explorer-caption {
  @apply mx-4 mb-2 mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400;
}
.explorer-pinned {
  @apply mx-3 flex w-[calc(100%-1.5rem)] items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60 dark:border-blue-900/50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40;
}
.explorer-pinned--open {
  @apply border-blue-400 bg-blue-100/70 ring-2 ring-blue-200 dark:border-blue-500 dark:bg-blue-950/50 dark:ring-blue-900;
}
.explorer-folders {
  @apply grid grid-cols-3 gap-2 px-3 pb-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8;
}
.explorer-folder {
  @apply flex min-w-0 flex-col items-center gap-1 rounded-xl border border-transparent px-2 py-3 text-center transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-slate-800/60;
}
.explorer-folder--open {
  @apply border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40;
}
.explorer-folder__icon {
  @apply h-12 w-14;
}
.explorer-folder__name {
  @apply block max-w-full truncate text-sm font-semibold text-slate-900 dark:text-white;
}
.explorer-folder__meta {
  @apply block max-w-full truncate text-xs text-slate-500 dark:text-slate-400;
}
.explorer-count {
  @apply shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-slate-900 dark:text-blue-300;
}
.explorer-split {
  @apply border-t border-slate-200 dark:border-slate-800 lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)];
}
.explorer-nav {
  @apply min-w-0 lg:flex lg:min-h-0 lg:flex-col lg:border-r lg:border-slate-200 lg:dark:border-slate-800;
}
.explorer-nav__sections {
  @apply pb-1 lg:max-h-[60%] lg:shrink-0 lg:overflow-y-auto;
}
.explorer-files {
  @apply min-w-0 border-t border-slate-200 p-3 dark:border-slate-800 lg:min-h-0 lg:flex-1 lg:overflow-y-auto;
}
.explorer-caption--files {
  @apply mx-1 mb-2 mt-0;
}
.explorer-preview {
  @apply flex min-h-[60vh] min-w-0 flex-col border-t border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/30 sm:p-6 lg:min-h-0 lg:overflow-y-auto lg:border-t-0;
}
/* Phones and tablets stack the preview under the files; opening a file
   scrolls to it. On tablets the one-row address bar stays under the header. */
@media (max-width: 1023.98px) {
  .explorer-preview {
    scroll-margin-top: 4.75rem;
  }
}
@media (min-width: 640px) and (max-width: 1023.98px) {
  .explorer-bar {
    position: sticky;
    top: 4rem;
    z-index: 15;
  }
  .explorer-preview {
    scroll-margin-top: 8rem;
  }
}
/* Large screens: the explorer is a window that fits the screen. Folders and
   files stay in the left pane, the preview scrolls on its own. */
@media (min-width: 1024px) {
  .files-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 4rem);
    height: calc(100dvh - 4rem);
    min-height: 0;
  }
  .explorer {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 30rem;
  }
  .explorer-bar,
  .explorer-toolbar,
  .explorer-status {
    flex-shrink: 0;
  }
  .explorer-split,
  .explorer-subgroups {
    flex: 1 1 auto;
    min-height: 0;
  }
  .explorer-subgroups {
    align-content: start;
    overflow-y: auto;
    padding-top: 0.75rem;
  }
  /* Compact folders so INFO and all sections fit above the files. */
  .explorer-nav__sections .explorer-caption {
    margin-top: 0.75rem;
  }
  .explorer-nav .explorer-pinned {
    gap: 0.75rem;
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
  }
  .explorer-nav .explorer-pinned > svg {
    height: 2rem;
    width: 2.5rem;
  }
  .explorer-nav .explorer-folders {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding-bottom: 0.5rem;
  }
  .explorer-nav .explorer-folders--list {
    display: flex;
  }
  .explorer-nav .explorer-folder {
    gap: 0.125rem;
    padding-bottom: 0.375rem;
    padding-top: 0.375rem;
  }
  .explorer-nav .explorer-folder__icon {
    height: 2.25rem;
    width: 2.75rem;
  }
  .explorer-nav .explorer-folders--list .explorer-folder {
    gap: 0.75rem;
  }
  .explorer-nav .explorer-folders--list .explorer-folder__icon {
    height: 1.75rem;
    width: 2.25rem;
  }
  .explorer-nav .explorer-file-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.explorer-empty {
  @apply flex min-h-[10rem] flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400;
}
.explorer-file-grid {
  @apply grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4;
}
.explorer-file-list {
  @apply flex flex-col gap-1;
}
.explorer-file {
  @apply relative min-w-0 rounded-xl border border-transparent transition hover:bg-slate-50 dark:hover:bg-slate-800/60;
}
.explorer-file--selected {
  @apply border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40;
}
.explorer-file__open {
  @apply flex w-full min-w-0 flex-col items-center gap-1 px-2 pb-2 pt-3 text-center;
}
.explorer-file-list .explorer-file__open {
  @apply flex-row gap-3 py-2 pl-3 pr-20 text-left;
}
.explorer-file__icon {
  @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300;
}
.explorer-file__icon svg {
  @apply h-6 w-6;
}
.explorer-file__icon[data-kind='drawing'] {
  @apply bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300;
}
.explorer-file__icon[data-kind='model'] {
  @apply bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300;
}
.explorer-file__icon[data-kind='image'] {
  @apply bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300;
}
.explorer-file__icon[data-kind='audio'],
.explorer-file__icon[data-kind='video'] {
  @apply bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300;
}
.explorer-file__ext {
  @apply shrink-0 rounded bg-slate-100 px-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300;
}
.explorer-file__name {
  @apply line-clamp-2 break-all text-xs font-medium text-slate-800 dark:text-slate-100;
}
.explorer-file-list .explorer-file__name {
  @apply line-clamp-1 text-sm;
}
.explorer-file__actions {
  @apply absolute right-1 top-1 flex gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100;
}
.explorer-file-list .explorer-file__actions {
  @apply top-1/2 -translate-y-1/2;
}
.explorer-status {
  @apply flex items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400;
}
.explorer-caption-row {
  @apply mb-1 mt-3 flex items-center justify-between gap-2 pr-3;
}
.explorer-caption-row .explorer-caption {
  @apply my-0;
}
/* "One under another": folders as full-width rows. */
.explorer-folders--list {
  @apply flex flex-col gap-1;
}
.explorer-folders--list .explorer-folder {
  @apply flex-row gap-3 px-3 py-2 text-left;
}
.explorer-folders--list .explorer-folder__icon {
  @apply h-8 w-10 shrink-0;
}
.explorer-folders--list .explorer-folder__name {
  @apply min-w-0 flex-1;
}
.explorer-folders--list .explorer-folder__meta {
  @apply shrink-0;
}
</style>
