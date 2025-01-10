<template>
  <div>
    <h1 class="text-2xl text-center font-sans italic w-full my-6">
      Ստեղծել նոր պատվեր
    </h1>
    <template v-if="isUploadLaserFile">
      <div class="text-start h-96 font-sans italic my-6 border border-gray-600 rounded-xl grid grid-cols-1 md:grid-cols-2">
        <div class="flex items-center justify-around flex-col">
          <p>Լազերաին ֆայլեր</p>
          <input type="file" placeholder="Ներբեռնում" @change="handleUploadFile" />
          <button
            class="text-white bg-green-600 rounded-xl px-3 py-1"
            @click="doneUploadLaserFile"
          >
            Առաջ
          </button>
        </div>
        <div class="flex items-center justify-center">
          <button
            v-if="!isLaserExtension"
            class="text-white bg-indigo-500 px-3 py-1 flex items-center rounded-xl"
            @click="isLaserExtension = !isLaserExtension"
          >Ֆայլերի տեսակներ
          </button>
          <template v-if="isLaserExtension">
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
            <button
              v-if="isLaserExtension"
              class="rounded-full text-red-800 float-end"
              @click="isLaserExtension = !isLaserExtension"
            ><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50" fill="red">
              <path d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"></path>
            </svg>
            </button>
          </template>
        </div>


      </div>
    </template>
    <template v-if="isUploadBendFile">
      <div
        class="text-start h-80 font-sans italic my-6 border border-gray-600 rounded-xl flex items-center justify-around flex-col"
      >
        <p>Կռման ֆայլեր</p>
        <input type="file" placeholder="Ներբեռնում" />
        <button
          class="text-white bg-green-600 rounded-xl px-3 py-1"
          @click="doneUploadBendFile"
        >
          Առաջ
        </button>
      </div>
    </template>
    <notifications />
  </div>
</template>
<script>
import {mapActions, mapGetters} from "vuex";
import InputWithLabelIcon from '~/components/form/InputWithLabelIcon.vue'
import FileExtension from '~/components/File/FileExtension/index.vue'

export default {
  components: { FileExtension, InputWithLabelIcon },
  layout: 'EngineerLayout',
  middleware: ['admin', 'roleRedirect'],
  data() {
    return {
      isUploadLaserFile: true,
      isUploadBendFile: false,
      isLaserExtension: false,
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
      'deleteLaserFileExtension',
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
    async deleteLaserExtension(id) {
      await this.deleteLaserFileExtension(id)
      await this.fetchLaserFileExtensions()
    },
    async deleteBendExtension(id) {
      await this.deleteBendFileExtension(id)
      await this.fetchBendFileExtensions()
    },
    doneUploadLaserFile() {
      this.isUploadLaserFile = false
      this.isUploadBendFile = true
    },
    doneUploadBendFile() {
      this.isUploadBendFile = false
    },
  },
}
</script>
