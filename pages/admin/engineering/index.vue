<template>
  <div>
    <h1 class="mx-auto text-center font-sans italic my-6 text-2xl">
      Ստեղծել ֆայլերի տեսակներ
    </h1>

    <div class="grid grid-cols-4 gap-2 mt-6">
      <FileExtension
        :extensions="laserExtensions"
        paragraph="Հասանելի ֆայլերի տեսակները լազերայինի համար"
        @update-extension="updateLaserExtension"
        @delete-extension="deleteLaserExtension"
      >
        <template #custom>
          <input-with-label-icon
            v-model="newLaserExtension"
            type="text"
            name="extension"
            placeholder=" "
            label="Ավելացնել նոր տեսակ"
            :id="'extension'"
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
    </div>
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
    }
  },
  computed: {
    ...mapGetters('fileExtension/laser', ['getLaserExtensions']),
    ...mapGetters('fileExtension/bend', ['getBendExtensions']),
    laserExtensions() {
      return this.getLaserExtensions
    },
    bendExtensions() {
      return this.getBendExtensions || []
    },
  },
  mounted() {
    this.fetchLaserFileExtensions()
    this.fetchBendFileExtensions()
  },
  methods: {
    ...mapActions('fileExtension/laser', [
      'fetchLaserFileExtensions',
      'createLaserFileExtension',
      'updateLaserFileExtension',
    ]),
    ...mapActions('fileExtension/bend', [
      'fetchBendFileExtensions',
      'createBendFileExtension',
      'updateBendFileExtension',
    ]),
    async addLaserFileExtension() {
      await this.createLaserFileExtension({ extension: this.newLaserExtension })
      this.newLaserExtension = ''
      await this.fetchLaserFileExtensions()
      alert('File extension added successfully')
    },
    async addBendFileExtension() {
      await this.createBendFileExtension({ extension: this.newBendExtension })
      this.newBendExtension = ''
      await this.fetchBendFileExtensions()
      alert('File extension added successfully')
    },
    async updateLaserExtension({ id, value }) {
      const success = await this.updateLaserFileExtension({
        id,
        extension: value,
      })
      if (success) {
        await this.fetchLaserFileExtensions() // թարմացում
        alert('File extension updated successfully.')
      }
    },
    async updateBendExtension({ id, value }) {
      const success = await this.updateBendFileExtension({
        id,
        extension: value,
      })
      if (success) {
        await this.fetchBendFileExtensions() // թարմացում
        alert('File extension updated successfully.')
      }
    },
    deleteLaserExtension(id) {
      this.laserExtensions = this.laserExtensions.filter((ext) => ext.id !== id)
    },
    deleteBendExtension(id) {
      this.bendExtensions = this.bendExtensions.filter((ext) => ext.id !== id)
    },
  },
}
</script>
