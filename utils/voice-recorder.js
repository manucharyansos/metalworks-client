import { allowsExtension, MAX_UPLOAD_BYTES } from './factory-file-policy'

const formats = [
  { mime: 'audio/webm;codecs=opus', extension: 'webm' },
  { mime: 'audio/mp4', extension: 'm4a' },
  { mime: 'audio/mp4', extension: 'mp4' },
  { mime: 'audio/ogg;codecs=opus', extension: 'ogg' },
]

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
  }) {
    Object.assign(this, {
      Recorder,
      mediaDevices,
      extensions,
      onFile,
      onError,
      onState,
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
      recorder.onstop = () => {
        if (generation !== this.generation) return
        const type = recorder.mimeType || format.mime
        const file = new File(
          chunks,
          `voice-${Date.now()}.${format.extension}`,
          { type }
        )
        this.recorder = null
        this.releaseStream()
        this.setState('idle')
        if (file.size) this.onFile(file)
        else this.onError('empty_file')
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
    this.recorder.stop()
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
