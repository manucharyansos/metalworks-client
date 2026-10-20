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
          data-voice-start
          @click="startRecording"
        >
          <svg
            class="mr-2 inline-block h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" />
          </svg>
          {{ $t('file_upload.record_voice') }}
        </button>
        <button
          v-if="voiceState === 'recording'"
          type="button"
          class="rounded-lg bg-red-600 px-4 py-2 text-white"
          data-voice-stop
          @click="voice.finish()"
        >
          <svg
            class="mr-2 inline-block h-4 w-4"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="12" height="12" rx="2" />
          </svg>
          {{ $t('file_upload.stop_recording') }}
        </button>
        <button
          v-if="recording"
          type="button"
          class="rounded-lg border px-4 py-2"
          data-voice-cancel
          @click="voice.cancel()"
        >
          {{ $t('file_upload.cancel_recording') }}
        </button>
        <span
          v-if="recording"
          class="text-sm text-red-600"
          role="status"
          aria-live="polite"
          >{{ $t(`file_upload.${voiceState}`) }}</span
        >
        <p v-if="!voiceSupported" class="text-xs text-gray-500">
          {{ $t('file_upload.recording_unavailable') }}
        </p>
      </div>
      <div
        v-if="voiceState === 'recording'"
        data-voice-live
        class="flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30"
      >
        <span
          class="voice-microphone flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white"
          aria-hidden="true"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" />
          </svg>
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-rose-800 dark:text-rose-200">
            {{ $t('file_upload.microphone_level') }}
          </p>
          <div
            class="mt-2 flex h-10 items-center gap-1"
            role="meter"
            :aria-label="$t('file_upload.microphone_level')"
            :aria-valuenow="Math.round(level * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
            data-voice-level
          >
            <span
              v-for="bar in 14"
              :key="bar"
              class="voice-bar w-1.5 rounded-full bg-rose-500"
              :style="{
                height: `${4 + Math.round(level * (16 + (bar % 5) * 5))}px`,
              }"
            />
          </div>
        </div>
        <time
          class="shrink-0 font-mono text-lg font-bold tabular-nums text-rose-700 dark:text-rose-200"
          data-voice-timer
          >{{ elapsedLabel }}</time
        >
      </div>
      <p
        v-if="voiceState === 'recording' && elapsedMs > 3000 && level < 0.005"
        class="text-xs text-amber-700 dark:text-amber-300"
      >
        {{ $t('file_upload.microphone_quiet') }}
      </p>
      <audio
        v-if="audioUrl && !recording"
        :src="audioUrl"
        controls
        preload="metadata"
        class="w-full"
        data-voice-preview
        @error="voiceError = $t('file_upload.recording_failed')"
      />
      <p v-if="audioUrl && !recording" class="text-xs text-slate-500">
        <span v-if="elapsedMs" class="mr-2 font-mono font-semibold">{{
          elapsedLabel
        }}</span
        >{{ $t('file_upload.listen_before_upload') }}
      </p>
    </div>
    <p v-if="voiceError" role="alert" class="text-sm text-red-600">
      {{ voiceError }}
    </p>
  </div>
</template>

<script>
import { allowsExtension } from '~/utils/factory-file-policy'
import {
  recordingFormat,
  validateRecordedAudio,
  VoiceRecorder,
} from '~/utils/voice-recorder'

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
    elapsedMs: 0,
    level: 0,
  }),
  computed: {
    elapsedLabel() {
      const seconds = Math.floor(this.elapsedMs / 1000)
      return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
        seconds % 60
      ).padStart(2, '0')}`
    },
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
      this.voice?.cancel()
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
    this.stopMeter()
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
        onFile: (file) => {
          this.$nextTick(() => {
            if (!this._isDestroyed && this.mode === 'audio')
              this.$emit('file-selected', file)
          })
        },
        onStream: (stream) => this.connectMeter(stream),
        validateFile: async (file) => {
          const audio = await validateRecordedAudio(
            file,
            window.AudioContext || window.webkitAudioContext
          )
          if (audio && !this._isDestroyed)
            this.elapsedMs = audio.duration * 1000
        },
        onError: (key) => {
          this.voiceError = this.$t(`file_upload.${key}`)
        },
        onState: (state) => {
          this.voiceState = state
          if (state === 'recording') this.startMeterClock()
          else if (state !== 'requesting') this.stopMeter()
          this.$emit('recording-change', state !== 'idle')
        },
      })
    },
    startRecording() {
      if (this.disabled || this.recording || !this.voice) return
      this.voiceError = ''
      this.elapsedMs = 0
      // Open/resume in the button gesture so mobile browsers permit metering.
      const AudioContext = window.AudioContext || window.webkitAudioContext
      try {
        this._meterContext = AudioContext ? new AudioContext() : null
        this._meterContext?.resume().catch(() => {})
      } catch (_) {}
      this.voice.start()
    },
    connectMeter(stream) {
      try {
        if (!this._meterContext) return
        this._meterSource = this._meterContext.createMediaStreamSource(stream)
        this._meterAnalyser = this._meterContext.createAnalyser()
        this._meterAnalyser.fftSize = 512
        this._meterSource.connect(this._meterAnalyser)
        // Keep the graph processing even on browsers that suspend an analyser
        // with no output. A zero gain prevents microphone feedback.
        this._meterSink = this._meterContext.createGain()
        this._meterSink.gain.value = 0
        this._meterAnalyser.connect(this._meterSink)
        this._meterSink.connect(this._meterContext.destination)
        this._meterSamples = new Float32Array(512)
      } catch (_) {
        // Metering is optional; recording still uses the original microphone stream.
      }
    },
    startMeterClock() {
      const started = performance.now()
      this._meterTimer = setInterval(() => {
        this.elapsedMs = performance.now() - started
        if (this._meterAnalyser && this._meterSamples) {
          this._meterAnalyser.getFloatTimeDomainData(this._meterSamples)
          let sum = 0
          for (const sample of this._meterSamples) sum += sample * sample
          this.level = Math.min(
            1,
            Math.sqrt(sum / this._meterSamples.length) * 4
          )
        }
      }, 100)
    },
    stopMeter() {
      clearInterval(this._meterTimer)
      this._meterSource?.disconnect()
      this._meterAnalyser?.disconnect()
      this._meterSink?.disconnect()
      this._meterContext?.close().catch(() => {})
      this._meterContext = this._meterSource = this._meterAnalyser = null
      this._meterSink = null
      this._meterSamples = null
      this.level = 0
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

<style scoped>
.voice-microphone {
  animation: voice-pulse 1.3s ease-in-out infinite;
}
.voice-bar {
  transition: height 100ms linear;
}
@keyframes voice-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(225, 29, 72, 0.08);
  }
}
@media (prefers-reduced-motion: reduce) {
  .voice-microphone {
    animation: none;
  }
  .voice-bar {
    transition: none;
  }
}
</style>
