<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-0 items-center gap-2">
          <div class="min-w-0">
            <button type="button" class="mb-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" @click="goBack">← {{ t.back }}</button>
            <h1 class="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{{ projectTitle }}</h1>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ remoteTitle }}</p>
          </div>
          <InfoTooltip>{{ t.help }}</InfoTooltip>
        </div>
        <button
          v-if="$can('pmp_files.upload') && selectedFactory"
          type="button"
          class="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950"
          :disabled="!factoryAcceptsFiles"
          :title="factoryAcceptsFiles ? '' : t.noAllowedTypes"
          @click="openUpload"
        >
          + {{ t.addFile }}
        </button>
      </section>

      <div v-if="loading" class="flex min-h-[420px] items-center justify-center text-sm font-semibold text-slate-400"><span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 dark:border-slate-700 dark:border-t-white"></span>{{ t.loading }}</div>
      <div v-else-if="!$can('pmp_files.view')" class="rounded-[28px] border border-amber-200 bg-amber-50 p-8 text-center text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">{{ t.noPermission }}</div>

      <template v-else>
        <section class="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <p class="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ t.workshops }}</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="factory in availableFactories" :key="factory.id" type="button" class="rounded-xl border px-4 py-2.5 text-xs font-bold transition" :class="Number(selectedFactoryId) === Number(factory.id) ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'" @click="selectFactory(factory)">
              {{ factory.name || factory.value }}<span class="ml-2 opacity-60">{{ fileCount(factory.id) }}</span>
            </button>
          </div>
          <p v-if="!availableFactories.length" class="text-xs text-slate-400">{{ t.noWorkshops }}</p>
        </section>

        <section v-if="selectedFactory" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-black text-slate-700 dark:text-slate-200">{{ t.allowedTypes }}:</span>
            <span v-if="allowsAnyFileType" class="policy-chip">{{ t.anyFileType }}</span>
            <span v-for="ext in visibleAllowedExtensions" v-else :key="ext" class="policy-chip">.{{ ext }}</span>
            <span v-if="!factoryAcceptsFiles" class="text-xs font-bold text-amber-600 dark:text-amber-300">{{ t.noAllowedTypes }}</span>
          </div>
        </section>

        <section class="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside class="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div class="flex items-center justify-between gap-3"><div><h2 class="text-base font-black text-slate-900 dark:text-white">{{ t.files }}</h2><p class="mt-1 text-xs text-slate-400">{{ selectedFactory?.name || t.chooseWorkshop }}</p></div><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ selectedFiles.length }}</span></div>
            <div class="mt-4 space-y-2">
              <div v-for="file in selectedFiles" :key="file.id" class="rounded-2xl border p-3 transition" :class="selectedFile?.id === file.id ? 'border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/25' : 'border-slate-200 dark:border-slate-800'">
                <button type="button" class="w-full text-left" @click="viewFile(file)"><div class="flex items-start gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ extension(file) }}</div><div class="min-w-0 flex-1"><p class="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{{ file.original_name }}</p><p class="mt-1 text-[10px] text-slate-400">{{ fileMetaLine(file) }}</p></div></div></button>
                <div class="mt-3 flex justify-end gap-3 border-t border-slate-100 pt-2 dark:border-slate-800"><button type="button" class="text-[10px] font-bold text-blue-600 dark:text-blue-300" @click="downloadFile(file)">{{ t.download }}</button><button v-if="$can('pmp_files.delete')" type="button" class="text-[10px] font-bold text-rose-600 dark:text-rose-300" @click="askDelete(file)">{{ t.delete }}</button></div>
              </div>
              <div v-if="selectedFactory && !selectedFiles.length" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">{{ t.noFiles }}</div>
              <div v-else-if="!selectedFactory" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">{{ t.chooseWorkshop }}</div>
            </div>
          </aside>

          <section class="min-h-[560px] rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div v-if="selectedFile" class="flex h-full flex-col">
              <div class="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0"><h2 class="truncate text-lg font-black text-slate-900 dark:text-white">{{ selectedFile.original_name }}</h2><p class="mt-1 text-xs text-slate-400">{{ selectedFactory?.name || '—' }}</p></div>
                <div v-if="isDxfSelected" class="flex flex-wrap gap-2"><span class="meta-chip">{{ t.quantity }}: {{ selectedFile.quantity || '—' }}</span><span class="meta-chip">{{ t.material }}: {{ selectedFile.material_type || '—' }}</span><span class="meta-chip">{{ t.thickness }}: {{ selectedFile.thickness || '—' }}</span></div>
              </div>
              <DxfViewerModal v-if="selectedType === 'dxf' && selectedFileUrl" :dxf-url="selectedFileUrl" :file-meta="selectedFile" :show-laser-info="false" class="min-h-[500px] w-full flex-1 rounded-2xl border border-slate-200 dark:border-slate-700" @close="selectedFile = null" />
              <embed v-else-if="selectedType === 'pdf' && selectedFileUrl" :src="selectedFileUrl" type="application/pdf" class="min-h-[620px] w-full flex-1 rounded-2xl border border-slate-200 dark:border-slate-700" />
              <div v-else-if="selectedType === 'image' && selectedFileUrl" class="flex flex-1 items-center justify-center"><img :src="selectedFileUrl" :alt="selectedFile.original_name" class="max-h-[70vh] max-w-full rounded-2xl object-contain shadow" /></div>
              <div v-else class="flex flex-1 flex-col items-center justify-center text-center"><div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black uppercase text-slate-500 dark:bg-slate-800">{{ extension(selectedFile) }}</div><p class="mt-4 max-w-md text-sm text-slate-500 dark:text-slate-400">{{ t.previewUnavailable }}</p><button class="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950" @click="downloadFile(selectedFile)">{{ t.download }}</button></div>
            </div>
            <div v-else class="flex min-h-[520px] items-center justify-center text-center"><div><div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">↖</div><p class="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">{{ t.chooseFile }}</p><p class="mt-1 text-xs text-slate-400">{{ t.chooseFileHint }}</p></div></div>
          </section>
        </section>
      </template>
    </div>

    <div v-if="uploadOpen" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" @click.self="closeUpload">
      <div class="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div class="flex items-start justify-between gap-4"><div><h3 class="text-lg font-black text-slate-900 dark:text-white">{{ t.addFile }}</h3><p class="mt-1 text-xs text-slate-400">{{ selectedFactory?.name || '—' }}</p></div><button class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" @click="closeUpload">✕</button></div>
        <div class="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/50"><p class="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{{ t.allowedTypes }}</p><p class="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">{{ allowedTypesText }}</p></div>
        <div class="mt-5 space-y-4">
          <div><label class="field-label">{{ t.file }}</label><input ref="fileInput" type="file" class="field" :accept="acceptedFileTypes || null" @change="handleFileChange" /></div>
          <template v-if="isDxfFactory">
            <div><label class="field-label">{{ t.quantity }}</label><input v-model.number="upload.quantity" type="number" min="1" class="field" /></div>
            <div class="relative"><label class="field-label">{{ t.material }}</label><input v-model.trim="upload.material" class="field" :placeholder="t.searchMaterial" @focus="loadMaterials" /><div v-if="materialsOpen" class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"><button v-for="material in filteredMaterials" :key="material.id" type="button" class="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="selectMaterial(material)">{{ material.description }}</button></div></div>
            <div><label class="field-label">{{ t.thickness }}</label><input v-model.trim="upload.thickness" class="field" /></div>
          </template>
        </div>
        <div class="mt-6 flex justify-end gap-2"><button class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="closeUpload">{{ t.cancel }}</button><button class="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50 dark:bg-white dark:text-slate-950" :disabled="uploading || !upload.file || !factoryAcceptsFiles" @click="uploadFile">{{ uploading ? t.saving : t.upload }}</button></div>
      </div>
    </div>

    <div v-if="deleteTarget" class="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-4" @click.self="deleteTarget = null"><div class="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900"><h3 class="text-lg font-black text-slate-900 dark:text-white">{{ t.deleteTitle }}</h3><p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ deleteTarget.original_name }}</p><div class="mt-6 flex justify-end gap-2"><button class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="deleteTarget = null">{{ t.cancel }}</button><button class="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white" @click="confirmDelete">{{ t.delete }}</button></div></div></div>
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import DxfViewerModal from '@/components/File/DxfViewerModal.vue'

const COPY = {
  hy: { back:'Նախագծեր և ֆայլեր',help:'Ընտրեք արտադրամասը և աշխատեք միայն տվյալ արտադրամասի թույլատրած ֆայլերի ձևաչափերով։',loading:'Բեռնվում է...',noPermission:'Ֆայլեր դիտելու թույլտվություն տրված չէ։',workshops:'Արտադրամասեր',noWorkshops:'Արտադրամասեր չեն գտնվել',files:'Ֆայլեր',chooseWorkshop:'Ընտրեք արտադրամաս',noFiles:'Այս արտադրամասի համար ֆայլ չկա',addFile:'Ավելացնել ֆայլ',download:'Ներբեռնել',delete:'Ջնջել',chooseFile:'Ընտրեք ֆայլ',chooseFileHint:'Ֆայլը բացելու համար ընտրեք այն ձախ ցուցակից։',previewUnavailable:'Այս ֆայլի տեսակի համար ներքին նախադիտում չկա։ Կարող եք ներբեռնել ֆայլը։',quantity:'Քանակ',material:'Նյութ',thickness:'Հաստություն',file:'Ֆայլ',searchMaterial:'Որոնել նյութ...',cancel:'Չեղարկել',upload:'Վերբեռնել',saving:'Պահպանվում է...',deleteTitle:'Ջնջե՞լ ֆայլը',idMissing:'Ենթախմբի ID-ն բացակայում է',loadError:'Չհաջողվեց բեռնել ֆայլերը',fileRequired:'Ընտրեք ֆայլ',dxfRequired:'DXF ֆայլի համար լրացրեք քանակը, նյութը և հաստությունը',uploaded:'Ֆայլը ավելացվեց',uploadError:'Չհաջողվեց ավելացնել ֆայլը',deleted:'Ֆայլը ջնջվեց',deleteError:'Չհաջողվեց ջնջել ֆայլը',downloadError:'Ֆայլի ներբեռնումը ձախողվեց',project:'PMP նախագիծ',subgroup:'Ենթախումբ',allowedTypes:'Թույլատրելի ձևաչափեր',anyFileType:'Բոլոր ֆայլերը',noAllowedTypes:'Այս արտադրամասի համար թույլատրելի ֆայլի ձևաչափ սահմանված չէ։',invalidFileType:'Այս ֆայլի ձևաչափը տվյալ արտադրամասը չի ընդունում։' },
  ru: { back:'Проекты и файлы',help:'Выберите цех и работайте только с форматами файлов, разрешёнными для этого цеха.',loading:'Загрузка...',noPermission:'Нет разрешения на просмотр файлов.',workshops:'Цеха',noWorkshops:'Цеха не найдены',files:'Файлы',chooseWorkshop:'Выберите цех',noFiles:'Для этого цеха файлов нет',addFile:'Добавить файл',download:'Скачать',delete:'Удалить',chooseFile:'Выберите файл',chooseFileHint:'Выберите файл в списке слева, чтобы открыть его.',previewUnavailable:'Для этого типа файла нет встроенного просмотра. Файл можно скачать.',quantity:'Количество',material:'Материал',thickness:'Толщина',file:'Файл',searchMaterial:'Поиск материала...',cancel:'Отмена',upload:'Загрузить',saving:'Сохранение...',deleteTitle:'Удалить файл?',idMissing:'Отсутствует ID подгруппы',loadError:'Не удалось загрузить файлы',fileRequired:'Выберите файл',dxfRequired:'Для DXF заполните количество, материал и толщину',uploaded:'Файл добавлен',uploadError:'Не удалось добавить файл',deleted:'Файл удалён',deleteError:'Не удалось удалить файл',downloadError:'Не удалось скачать файл',project:'Проект PMP',subgroup:'Подгруппа',allowedTypes:'Разрешённые форматы',anyFileType:'Все файлы',noAllowedTypes:'Для этого цеха разрешённые форматы файлов не настроены.',invalidFileType:'Этот формат файла не принимается выбранным цехом.' },
  en: { back:'Projects and files',help:'Choose a workshop and work only with file formats allowed by that workshop.',loading:'Loading...',noPermission:'File viewing permission is not granted.',workshops:'Workshops',noWorkshops:'No workshops found',files:'Files',chooseWorkshop:'Choose a workshop',noFiles:'No files for this workshop',addFile:'Add file',download:'Download',delete:'Delete',chooseFile:'Choose a file',chooseFileHint:'Select a file from the list on the left to open it.',previewUnavailable:'Preview is unavailable for this file type. You can download the file.',quantity:'Quantity',material:'Material',thickness:'Thickness',file:'File',searchMaterial:'Search material...',cancel:'Cancel',upload:'Upload',saving:'Saving...',deleteTitle:'Delete file?',idMissing:'Subgroup ID is missing',loadError:'Could not load files',fileRequired:'Choose a file',dxfRequired:'For DXF, enter quantity, material and thickness',uploaded:'File added',uploadError:'Could not add file',deleted:'File deleted',deleteError:'Could not delete file',downloadError:'File download failed',project:'PMP project',subgroup:'Subgroup',allowedTypes:'Allowed formats',anyFileType:'All files',noAllowedTypes:'No allowed file formats are configured for this workshop.',invalidFileType:'This file format is not accepted by the selected workshop.' },
}

export default {
  name:'EngineerFilesView',components:{DxfViewerModal},layout:'engineer',middleware:['role-guard'],meta:{role:'engineer'},
  data(){return{loading:false,uploading:false,id:null,selectedFactoryId:null,selectedFile:null,uploadOpen:false,deleteTarget:null,materialsOpen:false,factoryPolicies:[],upload:{file:null,quantity:null,material:'',thickness:''}}},
  computed:{
    ...mapGetters('pmp',['getPmp']),...mapGetters('factory',['getFactory']),...mapGetters('materials',['getMaterials']),
    locale(){const code=String(this.$i18n?.locale||'hy').toLowerCase().split('-')[0];return['hy','ru','en'].includes(code)?code:'hy'},t(){return COPY[this.locale]||COPY.hy},
    remote(){return Array.isArray(this.getPmp?.remote_number)?this.getPmp.remote_number[0]:null},
    projectTitle(){return this.getPmp?.group_name?`${this.getPmp.group} · ${this.getPmp.group_name}`:this.t.project},remoteTitle(){return this.remote?`${this.t.subgroup}: ${this.remote.remote_number} · ${this.remote.remote_number_name}`:'—'},
    availableFactories(){const map=new Map();const merge=(f)=>{if(!f?.id)return;const id=Number(f.id);map.set(id,{...(map.get(id)||{}),...f})};(this.getFactory||[]).forEach(merge);(this.getPmp?.files||[]).forEach((file)=>merge(file.factory));this.factoryPolicies.forEach(merge);return Array.from(map.values()).sort((a,b)=>Number(a.id)-Number(b.id))},
    selectedFactory(){return this.availableFactories.find((f)=>Number(f.id)===Number(this.selectedFactoryId))||null},selectedFiles(){return(this.getPmp?.files||[]).filter((f)=>Number(f.factory_id)===Number(this.selectedFactoryId))},
    selectedAllowedExtensions(){const raw=this.selectedFactory?.extensions||[];return raw.map((item)=>String(item?.extension??item??'').trim().toLowerCase().replace(/^\./,'')).filter(Boolean)},allowsAnyFileType(){return this.selectedAllowedExtensions.includes('*')},visibleAllowedExtensions(){return this.selectedAllowedExtensions.filter((ext)=>ext!=='*')},factoryAcceptsFiles(){return this.allowsAnyFileType||this.visibleAllowedExtensions.length>0},acceptedFileTypes(){return this.allowsAnyFileType?'':this.visibleAllowedExtensions.map((ext)=>`.${ext}`).join(',')},allowedTypesText(){return this.allowsAnyFileType?this.t.anyFileType:(this.visibleAllowedExtensions.length?this.visibleAllowedExtensions.map((ext)=>`.${ext}`).join(', '):this.t.noAllowedTypes)},
    selectedType(){return this.selectedFile?this.fileType(this.selectedFile.original_name||this.selectedFile.path):null},selectedFileUrl(){if(!this.selectedFile)return null;if(this.selectedFile.id&&this.$getPmpFileUrl)return this.$getPmpFileUrl(this.selectedFile);return this.$getFileUrl?this.$getFileUrl(this.selectedFile.path):null},isDxfSelected(){return this.selectedType==='dxf'},isDxfFactory(){return String(this.selectedFactory?.value||'').toUpperCase()==='DXF'},
    materials(){return this.getMaterials||[]},filteredMaterials(){const q=this.upload.material.toLowerCase();if(!q)return this.materials;return this.materials.filter((m)=>String(m.description||'').toLowerCase().includes(q))},
  },
  async created(){this.id=this.$route.query.id;if(!this.id){this.$notify?.({type:'error',text:this.t.idMissing});return}await this.reload()},
  methods:{
    ...mapActions('pmp',['fetchPmp','deleteFile','createPmpFilesByFactory']),...mapActions('factory',['fetchFactory','downloadUploadedFile']),...mapActions('materials',['fetchMaterials']),
    async loadFactoryPolicies(){try{const data=await this.$axios.$get('/api/factory-file-policies');this.factoryPolicies=Array.isArray(data?.data)?data.data:[]}catch(e){this.factoryPolicies=[]}},
    async reload(){this.loading=true;try{const tasks=[this.fetchPmp(this.id),this.loadFactoryPolicies()];if(this.$can('factory.view'))tasks.push(this.fetchFactory());await Promise.all(tasks);if(!this.selectedFactoryId&&this.availableFactories.length)this.selectedFactoryId=this.availableFactories[0].id}catch(e){this.$notify?.({type:'error',text:this.t.loadError})}finally{this.loading=false}},
    goBack(){this.$router.push(this.localePath('/engineer/files'))},selectFactory(factory){this.selectedFactoryId=factory.id;this.selectedFile=null;this.closeUpload()},fileCount(id){return(this.getPmp?.files||[]).filter((f)=>Number(f.factory_id)===Number(id)).length},
    extension(file){return String(file?.original_name||file?.path||'file').split('.').pop().slice(0,8).toUpperCase()},fileType(name){const ext=String(name||'').toLowerCase().split('.').pop();if(ext==='dxf')return'dxf';if(ext==='pdf')return'pdf';if(['jpg','jpeg','png','webp','gif'].includes(ext))return'image';return'other'},fileMetaLine(file){const parts=[];if(file.quantity)parts.push(`${this.t.quantity}: ${file.quantity}`);if(file.material_type)parts.push(file.material_type);if(file.thickness)parts.push(`${file.thickness}`);return parts.join(' · ')||this.extension(file)},viewFile(file){this.selectedFile=file},
    async downloadFile(file){try{await this.downloadUploadedFile(file)}catch(e){this.$notify?.({type:'error',text:e?.response?.data?.message||e?.message||this.t.downloadError})}},
    openUpload(){if(!this.factoryAcceptsFiles){this.$notify?.({type:'warning',text:this.t.noAllowedTypes});return}this.resetUpload();this.uploadOpen=true},closeUpload(){this.uploadOpen=false;this.resetUpload()},
    fileExtension(file){const name=String(file?.name||'');return name.includes('.')?name.split('.').pop().toLowerCase():''},isFileAllowed(file){if(!file)return false;if(this.allowsAnyFileType)return true;return this.visibleAllowedExtensions.includes(this.fileExtension(file))},
    handleFileChange(e){const file=e.target.files?.[0]||null;if(file&&!this.isFileAllowed(file)){this.upload.file=null;e.target.value='';this.$notify?.({type:'warning',text:`${this.t.invalidFileType} ${this.allowedTypesText}`});return}this.upload.file=file},
    async loadMaterials(){this.materialsOpen=true;if(!this.materials.length)try{await this.fetchMaterials()}catch(e){}},selectMaterial(material){this.upload.material=material.description||'';this.upload.thickness=material.thickness||'';this.materialsOpen=false},
    async uploadFile(){if(!this.upload.file)return this.$notify?.({type:'warning',text:this.t.fileRequired});if(!this.isFileAllowed(this.upload.file))return this.$notify?.({type:'warning',text:`${this.t.invalidFileType} ${this.allowedTypesText}`});if(this.isDxfFactory&&(!this.upload.quantity||!this.upload.material||!this.upload.thickness))return this.$notify?.({type:'warning',text:this.t.dxfRequired});this.uploading=true;const fd=new FormData();fd.append('file',this.upload.file);fd.append('pmp_id',this.getPmp.id);fd.append('remote_number_id',this.remote?.id||this.id);fd.append('factory_id',this.selectedFactoryId);if(this.isDxfFactory){fd.append('quantity',this.upload.quantity);fd.append('material_type',this.upload.material);fd.append('thickness',this.upload.thickness)}try{await this.createPmpFilesByFactory(fd);this.$notify?.({type:'success',text:this.t.uploaded});this.closeUpload();await this.reload()}catch(e){const data=e?.response?.data||{};this.$notify?.({type:'error',text:data.message||data.error||e?.message||this.t.uploadError})}finally{this.uploading=false}},
    resetUpload(){this.upload={file:null,quantity:null,material:'',thickness:''};this.materialsOpen=false;if(this.$refs.fileInput)this.$refs.fileInput.value=''},askDelete(file){this.deleteTarget=file},
    async confirmDelete(){if(!this.deleteTarget)return;const id=this.deleteTarget.id;try{const ok=await this.deleteFile(id);if(!ok)throw new Error(this.t.deleteError);if(this.selectedFile?.id===id)this.selectedFile=null;this.$notify?.({type:'success',text:this.t.deleted});this.deleteTarget=null;await this.reload()}catch(e){this.$notify?.({type:'error',text:e?.message||this.t.deleteError})}},
  },
}
</script>

<style scoped>
.field{@apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200}.field-label{@apply mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400}.meta-chip,.policy-chip{@apply rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300}
</style>
