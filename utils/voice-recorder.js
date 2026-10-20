import { allowsExtension, MAX_UPLOAD_BYTES } from './factory-file-policy'

const formats = [
  { mime: 'audio/webm;codecs=opus', extension: 'webm' },
  { mime: 'audio/webm', extension: 'webm' },
  { mime: 'audio/mp4', extension: 'm4a' },
  { mime: 'audio/mp4', extension: 'mp4' },
  { mime: 'audio/ogg;codecs=opus', extension: 'ogg' },
]

// A non-empty container can still contain no audio. Verify actual decoded
// samples before presenting a microphone recording as ready to upload.
export async function validateRecordedAudio(file, AudioContext) {
  if (!AudioContext) return
  const context = new AudioContext()
  try {
    const audio = await context.decodeAudioData(await file.arrayBuffer())
    if (
      !Number.isFinite(audio.duration) ||
      audio.duration < 0.15 ||
      !audio.numberOfChannels
    )
      throw new Error('recording_empty')
    let peak = 0
    for (let channel = 0; channel < audio.numberOfChannels; channel++) {
      const samples = audio.getChannelData(channel)
      for (let index = 0; index < samples.length; index++) {
        peak = Math.max(peak, Math.abs(samples[index]))
      }
    }
    if (peak < 0.00001) throw new Error('recording_silent')
    return { duration: audio.duration, peak }
  } catch (error) {
    if (['recording_empty', 'recording_silent'].includes(error.message))
      throw error
    throw new Error('recording_failed')
  } finally {
    await context.close().catch(() => {})
  }
}

export function recordingFormat(Recorder, extensions) {
  if (typeof Recorder?.isTypeSupported !== 'function') return undefined
  return formats.find(
    (format) =>
      allowsExtension(extensions, format.extension) &&
      Recorder.isTypeSupported(format.mime)
  )
}

export class VoiceRecorder {
  constructor({
    Recorder,
    mediaDevices,
    extensions,
    onFile,
    onError,
    onState,
    onStream,
    validateFile,
  }) {
    Object.assign(this, {
      Recorder,
      mediaDevices,
      extensions,
      onFile,
      onError,
      onState,
      onStream,
      validateFile,
    })
    this.generation = 0
    this.state = 'idle'
    this.stream = null
    this.recorder = null
  }

  setState(state) {
    this.state = state
    this.onState(state)
  }

  releaseStream() {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
  }

  async start() {
    if (this.state !== 'idle') return
    const format = recordingFormat(this.Recorder, this.extensions)
    if (!format) {
      this.onError('recording_format_unavailable')
      return
    }
    const generation = ++this.generation
    this.setState('requesting')
    try {
      const stream = await this.mediaDevices.getUserMedia({ audio: true })
      if (generation !== this.generation) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      this.stream = stream
      const tracks = stream.getAudioTracks?.() || []
      if (
        tracks.length &&
        tracks.every((track) => track.readyState === 'ended' || !track.enabled)
      ) {
        this.cancel()
        this.onError('recording_silent')
        return
      }
      this.onStream?.(stream)
      const recorder = new this.Recorder(stream, {
        mimeType: format.mime,
        audioBitsPerSecond: 128000,
      })
      this.recorder = recorder
      const chunks = []
      let bytes = 0
      recorder.ondataavailable = (event) => {
        if (generation !== this.generation || !event.data?.size) return
        bytes += event.data.size
        if (bytes > MAX_UPLOAD_BYTES) {
          this.cancel()
          this.onError('too_large')
          return
        }
        chunks.push(event.data)
      }
      recorder.onerror = () => {
        if (generation === this.generation) {
          this.cancel()
          this.onError('recording_failed')
        }
      }
      recorder.onstop = async () => {
        if (generation !== this.generation) return
        const type =
          chunks.find((chunk) => chunk.type)?.type ||
          recorder.mimeType ||
          format.mime
        const file = new File(
          chunks,
          `voice-${Date.now()}.${format.extension}`,
          { type }
        )
        this.releaseStream()
        try {
          if (!file.size) throw new Error('recording_empty')
          if (this.validateFile) {
            this.setState('processing')
            await this.validateFile(file)
          }
          if (generation !== this.generation) return
          this.recorder = null
          // Parent upload validation must see recording=false before the file.
          this.setState('idle')
          this.onFile(file)
        } catch (error) {
          if (generation !== this.generation) return
          this.recorder = null
          this.setState('idle')
          this.onError(error.message || 'recording_failed')
        }
      }
      recorder.start(1000)
      this.setState('recording')
    } catch (error) {
      if (generation !== this.generation) return
      this.cancel()
      this.onError(
        error?.name === 'NotAllowedError'
          ? 'microphone_denied'
          : 'recording_failed'
      )
    }
  }

  finish() {
    if (this.state !== 'recording') return
    this.setState('stopping')
    try {
      if (this.recorder.state !== 'inactive') this.recorder.stop()
    } catch (_) {
      this.cancel()
      this.onError('recording_failed')
    }
  }

  cancel() {
    ++this.generation
    const recorder = this.recorder
    this.recorder = null
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null
      if (recorder.state !== 'inactive') recorder.stop()
    }
    this.releaseStream()
    this.setState('idle')
  }
}
