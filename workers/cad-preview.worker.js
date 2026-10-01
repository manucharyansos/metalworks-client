import { extractPreview } from 'cad-preview'

// Extraction is isolated so malformed or expensive CAD data cannot freeze the UI.
self.onmessage = ({ data }) => {
  try {
    if (
      !(data.buffer instanceof ArrayBuffer) ||
      data.buffer.byteLength > 10 * 1024 * 1024
    ) {
      self.postMessage(null)
      return
    }
    const preview = extractPreview(new Uint8Array(data.buffer), {
      filename: data.filename,
    })
    if (!preview || preview.data.byteLength > 8 * 1024 * 1024) {
      self.postMessage(null)
      return
    }
    const bytes = new Uint8Array(preview.data)
    self.postMessage({ bytes, format: preview.format }, [bytes.buffer])
  } catch (_) {
    self.postMessage(null)
  }
}
