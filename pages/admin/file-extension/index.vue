<template>
  <div>
    <h1 class="mx-auto text-center font-montserrat my-6 text-2xl">
      Ստեղծել ֆայլերի տեսակներ
    </h1>

    <div class="grid grid-cols-3 gap-2 mt-6">
      <FileExtension
        :extensions="laserExtensions"
        paragraph="Հասանելի ֆայլերի տեսակները լազերայինի համար"
        @update-extension="updateLaserExtension"
        @delete-extension="deleteLaserExtension"
      >
        <template #custom>
          <input-with-label-icon
            :id="'extension'"
            v-model="newLaserExtension"
            type="text"
            name="extension"
            placeholder=" "
            label="Ավելացնել նոր տեսակ"
          />
          <button
            class="border-gray-500 rounded-2xl bg-indigo-600 text-white h-8 px-6 py-1.5 flex items-center"
            @click="addLaserFileExtension"
          >
            Ավելացնել
          </button>
        </template>
      </FileExtension>

      <FileExtension
        :extensions="bendExtensions"
        paragraph="Հասանելի ֆայլերի տեսակները ճկման համար"
        @update-extension="updateBendExtension"
        @delete-extension="deleteBendExtension"
      >
        <template #custom>
          <input-with-label-icon
            v-model="newBendExtension"
            type="text"
            name="bendExtension"
            placeholder=" "
            label="Ավելացնել նոր տեսակ"
          />
          <button
            class="border-gray-500 rounded-2xl bg-indigo-600 text-white h-8 px-6 py-1.5 flex items-center"
            @click="addBendFileExtension"
          >
            Ավելացնել
          </button>
        </template>
      </FileExtension>

      <FileExtension
        :extensions="extensions"
        paragraph="Հասանելի պատվերի համար"
        @update-extension="updateAllExtension"
        @delete-extension="deleteAllExtension"
      >
        <template #custom>
          <input-with-label-icon
            v-model="newExtension"
            type="text"
            name="bendExtension"
            placeholder=" "
            label="Ավելացնել նոր տեսակ"
          />
          <button
            class="border-gray-500 rounded-2xl bg-indigo-600 text-white h-8 px-6 py-1.5 flex items-center"
            @click="addAllFileExtension"
          >
            Ավելացնել
          </button>
        </template>
      </FileExtension>
    </div>
    <notifications />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import FileExtension from '~/components/File/FileExtension/index.vue'

export default {
  components: { InputWithLabelIcon, FileExtension },
  layout: 'AdminLayout',
  middleware: ['admin', 'roleRedirect'],
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
      return this.getLaserExtensions
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
    ]),
    ...mapActions('fileExtension', [
      'createFileExtension',
      'updateFileExtension',
      'deleteFileExtension',
      'fetchFileExtensions',
    ]),
    async addLaserFileExtension() {
      await this.createLaserFileExtension({ extension: this.newLaserExtension })
      this.newLaserExtension = ''
      await this.fetchLaserFileExtensions()
      this.$notify({
        text: `Ֆայլի ընդլայնումը հաջողությամբ ավելացվեց:`,
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },
    async addBendFileExtension() {
      await this.createBendFileExtension({ extension: this.newBendExtension })
      this.newBendExtension = ''
      await this.fetchBendFileExtensions()
      this.$notify({
        text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց:`,
        duration: 3000,
        speed: 1000,
        position: 'top',
        type: 'success',
      })
    },
    async addAllFileExtension() {
      await this.createFileExtension({ extension: this.newExtension })
      this.newExtension = ''
      await this.fetchFileExtensions()
      this.$notify({
        text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց:`,
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
          text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց:`,
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
          text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց:`,
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
          text: `Ֆայլի ընդլայնումը հաջողությամբ թարմացվեց:`,
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
