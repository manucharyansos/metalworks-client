<template>
  <div class="space-y-4 min-w-0">
    <div
      class="grid grid-cols-2 sm:grid-cols-4 gap-2"
      role="group"
      :aria-label="$t('file_upload.content_type')"
    >
      <button
        v-for="item in modes"
        :key="item"
        type="button"
        class="rounded-xl border px-3 py-3 text-sm font-semibold disabled:opacity-50"
        :class="
          mode === item
            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
            : 'border-gray-200 dark:border-gray-700'
        "
        :aria-pressed="mode === item"
        :disabled="disabled || recording || (item === 'text' && !textAllowed)"
        @click="$emit('mode-change', item)"
      >
        {{ $t(`file_upload.${item}`) }}
      </button>
    </div>
    <div v-if="mode === 'text'" class="space-y-3">
      <label class="block text-sm">
        {{ $t('file_upload.text_title') }}
        <input
          :value="title"
          :disabled="disabled"
          maxlength="100"
          class="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3"
          @input="$emit('title-change', $event.target.value)"
        />
      </label>
      <label class="block text-sm">
        {{ $t('file_upload.text_body') }}
        <textarea
          :value="text"
          :disabled="disabled"
          rows="8"
          class="mt-1 w-full resize-y rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3"
          @input="$emit('text-change', $event.target.value)"
        />
      </label>
      <p class="text-xs text-gray-500">{{ $t('file_upload.text_hint') }}</p>
    </div>
    <div v-if="mode === 'audio'" class="space-y-3">
      <div class="flex flex-wrap gap-2 items-center">
        <button
          v-if="voiceState === 'idle' && voiceSupported"
          type="button"
          :disabled="disabled"
          class="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          @click="startRecording"
        >
          {{ $t('file_upload.record_voice') }}
        </button>
        <button
          v-if="voiceState === 'recording'"
          type="button"
          class="rounded-lg bg-red-600 px-4 py-2 text-white"
          @click="voice.finish()"
        >
          {{ $t('file_upload.stop_recording') }}
        </button>
        <button
          v-if="recording"
          type="button"
          class="rounded-lg border px-4 py-2"
          @click="voice.cancel()"
        >
          {{ $t('file_upload.cancel_recording') }}
        </button>
        <span v-if="recording" class="text-sm text-red-600" role="status">{{
          $t(`file_upload.${voiceState}`)
        }}</span>
        <p v-if="!voiceSupported" class="text-xs text-gray-500">
          {{ $t('file_upload.recording_unavailable') }}
        </p>
      </div>
      <audio
        v-if="audioUrl"
        :src="audioUrl"
        controls
        preload="metadata"
        class="w-full"
      />
    </div>
    <p v-if="voiceError" role="alert" class="text-sm text-red-600">
      {{ voiceError }}
    </p>
  </div>
</template>

<script>
import { allowsExtension } from '~/utils/factory-file-policy'
import { recordingFormat, VoiceRecorder } from '~/utils/voice-recorder'

export default {
  props: {
    mode: { type: String, default: 'file' },
    title: { type: String, default: '' },
    text: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    extensions: { type: Array, default: () => [] },
    file: { type: Object, default: null },
  },
  data: () => ({
    modes: ['text', 'image', 'audio', 'file'],
    voice: null,
    voiceState: 'idle',
    voiceSupported: false,
    voiceError: '',
    audioUrl: '',
  }),
  computed: {
    textAllowed() {
      return allowsExtension(this.extensions, 'txt')
    },
    recording() {
      return this.voiceState !== 'idle'
    },
  },
  watch: {
    file: 'updateAudioPreview',
    mode() {
      this.voiceError = ''
      this.updateAudioPreview()
    },
    extensions() {
      this.setupVoice()
    },
  },
  mounted() {
    this.setupVoice()
    this.updateAudioPreview()
  },
  beforeDestroy() {
    this.voice?.cancel()
    this.clearAudioPreview()
  },
  methods: {
    setupVoice() {
      this.voice?.cancel()
      this.voiceSupported =
        typeof MediaRecorder !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia &&
        !!recordingFormat(MediaRecorder, this.extensions)
      if (!this.voiceSupported) {
        this.voice = null
        return
      }
      this.voice = new VoiceRecorder({
        Recorder: MediaRecorder,
        mediaDevices: navigator.mediaDevices,
        extensions: this.extensions,
        onFile: (file) => this.$emit('file-selected', file),
        onError: (key) => {
          this.voiceError = this.$t(`file_upload.${key}`)
        },
        onState: (state) => {
          this.voiceState = state
          this.$emit('recording-change', state !== 'idle')
        },
      })
    },
    startRecording() {
      this.voiceError = ''
      this.voice?.start()
    },
    clearAudioPreview() {
      if (this.audioUrl) URL.revokeObjectURL(this.audioUrl)
      this.audioUrl = ''
    },
    updateAudioPreview() {
      this.clearAudioPreview()
      if (this.mode === 'audio' && this.file)
        this.audioUrl = URL.createObjectURL(this.file)
    },
  },
}
</script>
