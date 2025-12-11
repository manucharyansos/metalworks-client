<template>
  <div class="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <header class="mb-6 md:mb-8 text-center">
        <h1
          class="font-montserrat text-2xl md:text-3xl font-bold text-slate-900"
        >
          Ստեղծել ֆայլերի տեսակներ
        </h1>
        <p class="mt-2 text-sm md:text-base text-slate-500">
          Կառավարեք լազերի, ճկման և ընդհանուր պատվերների համար հասանելի ֆայլերի
          ընդլայնումները մեկ էկրանից։
        </p>
      </header>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6"
      >
        <!-- Լազեր -->
        <FileExtension
          :extensions="laserExtensions"
          paragraph="Հասանելի ֆայլերի տեսակները լազերայինի համար"
          @update-extension="updateLaserExtension"
          @delete-extension="deleteLaserExtension"
        >
          <template #custom>
            <div class="flex w-full flex-col sm:flex-row items-center gap-2">
              <input-with-label-icon
                :id="'laser-extension'"
                v-model="newLaserExtension"
                type="text"
                name="extension"
                placeholder=" "
                label="Ավելացնել նոր տեսակ"
              />
              <button
                class="inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white text-sm font-medium h-9 px-4 sm:px-5 shadow-sm hover:bg-indigo-700 hover:shadow-md active:scale-95 transition duration-150"
                @click="addLaserFileExtension"
              >
                Ավելացնել
              </button>
            </div>
          </template>
        </FileExtension>

        <!-- Ճկում -->
        <FileExtension
          :extensions="bendExtensions"
          paragraph="Հասանելի ֆայլերի տեսակները ճկման համար"
          @update-extension="updateBendExtension"
          @delete-extension="deleteBendExtension"
        >
          <template #custom>
            <div class="flex w-full flex-col sm:flex-row items-center gap-2">
              <input-with-label-icon
                v-model="newBendExtension"
                type="text"
                name="bendExtension"
                placeholder=" "
                label="Ավելացնել նոր տեսակ"
              />
              <button
                class="inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white text-sm font-medium h-9 px-4 sm:px-5 shadow-sm hover:bg-indigo-700 hover:shadow-md active:scale-95 transition duration-150"
                @click="addBendFileExtension"
              >
                Ավելացնել
              </button>
            </div>
          </template>
        </FileExtension>

        <!-- Ընդհանուր պատվերի համար -->
        <FileExtension
          :extensions="extensions"
          paragraph="Հասանելի պատվերի համար"
          @update-extension="updateAllExtension"
          @delete-extension="deleteAllExtension"
        >
          <template #custom>
            <div class="flex w-full flex-col sm:flex-row items-center gap-2">
              <input-with-label-icon
                v-model="newExtension"
                type="text"
                name="allExtension"
                placeholder=" "
                label="Ավելացնել նոր տեսակ"
              />
              <button
                class="inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white text-sm font-medium h-9 px-4 sm:px-5 shadow-sm hover:bg-indigo-700 hover:shadow-md active:scale-95 transition duration-150"
                @click="addAllFileExtension"
              >
                Ավելացնել
              </button>
            </div>
          </template>
        </FileExtension>
      </div>

      <notifications />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import FileExtension from '~/components/File/FileExtension/index.vue'

export default {
  components: { InputWithLabelIcon, FileExtension },
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      newLaserExtension: '',
      newBendExtension: '',
      newExtension: '',
    }
  },
  computed: {
    ...mapGetters('fileExtension/laser', ['getLaserExtensions']),
    ...mapGetters('fileExtension/bend', ['getBendExtensions']),
    ...mapGetters('fileExtension', ['getExtensions']),
    laserExtensions() {
      return this.getLaserExtensions || []
    },
    bendExtensions() {
      return this.getBendExtensions || []
    },
    extensions() {
      return this.getExtensions || []
    },
  },
  mounted() {
    this.fetchLaserFileExtensions()
    this.fetchBendFileExtensions()
    this.fetchFileExtensions()
  },
  methods: {
    ...mapActions('fileExtension/laser', [
      'fetchLaserFileExtensions',
      'createLaserFileExtension',
      'updateLaserFileExtension',
      'deleteLaserFileExtension',
    ]),
    ...mapActions('fileExtension/bend', [
      'fetchBendFileExtensions',
      'createBendFileExtension',
      'updateBendFileExtension',
      'deleteBendFileExtension',
    ]),
    ...mapActions('fileExtension', [
      'createFileExtension',
      'updateFileExtension',
      'deleteFileExtension',
      'fetchFileExtensions',
    ]),

    async addLaserFileExtension() {
      if (!this.newLaserExtension?.trim()) return
      await this.createLaserFileExtension({
        extension: this.newLaserExtension.trim(),
      })
      this.newLaserExtension = ''
      await this.fetchLaserFileExtensions()
      this.$notify({
        text: `Ֆայլի ընդլայնումը հաջողությամբ ավելացվեց։`,
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },

    async addBendFileExtension() {
      if (!this.newBendExtension?.trim()) return
      await this.createBendFileExtension({
        extension: this.newBendExtension.trim(),
      })
      this.newBendExtension = ''
      await this.fetchBendFileExtensions()
      this.$notify({
        text: `Ֆայլի ընդլայնումը հաջողությամբ ավելացվեց։`,
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },

    async addAllFileExtension() {
      if (!this.newExtension?.trim()) return
      await this.createFileExtension({
        extension: this.newExtension.trim(),
      })
      this.newExtension = ''
      await this.fetchFileExtensions()
      this.$notify({
        text: `Ֆայլի ընդլայնումը հաջողությամբ ավելացվեց։`,
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },

    async updateLaserExtension({ id, value }) {
      const success = await this.updateLaserFileExtension({
        id,
        extension: value,
      })
      if (success) {
        await this.fetchLaserFileExtensions()
        this.$notify({
          text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
      }
    },

    async updateBendExtension({ id, value }) {
      const success = await this.updateBendFileExtension({
        id,
        extension: value,
      })
      if (success) {
        await this.fetchBendFileExtensions()
        this.$notify({
          text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
      }
    },

    async updateAllExtension({ id, value }) {
      const success = await this.updateFileExtension({
        id,
        extension: value,
      })
      if (success) {
        await this.fetchFileExtensions()
        this.$notify({
          text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց։`,
          duration: 3000,
          speed: 1000,
          position: 'top',
          type: 'success',
        })
      }
    },

    async deleteLaserExtension(id) {
      await this.deleteLaserFileExtension(id)
      await this.fetchLaserFileExtensions()
    },

    async deleteBendExtension(id) {
      await this.deleteBendFileExtension(id)
      await this.fetchBendFileExtensions()
    },

    async deleteAllExtension(id) {
      await this.deleteFileExtension(id)
      await this.fetchFileExtensions()
    },
  },
}
</script>
