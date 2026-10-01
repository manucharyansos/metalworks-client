const MAX_TEXT_CHARACTERS = 200000
const CAD_EXTENSIONS = /\.(sldprt|sldasm|slddrw|dwg|ipt|iam|par|psm|dft)$/i

function startsWith(bytes, signature) {
  return signature.every((value, index) => bytes[index] === value)
}

// Inspect the payload as well as its name: a factory is a work stage, not a format.
export async function inspectFactoryPreview(blob, filename, declaredType) {
  if (!(blob instanceof Blob) || !blob.size || blob.size > 10 * 1024 * 1024) {
    throw new Error('Invalid preview payload')
  }
  if (['audio', 'video'].includes(declaredType)) {
    return {
      type: blob.type.startsWith('audio/') ? 'audio' : declaredType,
      blob,
    }
  }
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const header = new TextDecoder().decode(bytes.subarray(0, 1024))
  if (header.includes('%PDF-')) {
    return { type: 'pdf', blob: new Blob([blob], { type: 'application/pdf' }) }
  }
  let imageMime = null
  if (startsWith(bytes, [137, 80, 78, 71, 13, 10, 26, 10]))
    imageMime = 'image/png'
  else if (startsWith(bytes, [255, 216, 255])) imageMime = 'image/jpeg'
  else if (/^GIF8[79]a/.test(header)) imageMime = 'image/gif'
  else if (header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP')
    imageMime = 'image/webp'
  else if (header.startsWith('BM')) imageMime = 'image/bmp'
  if (imageMime)
    return { type: 'image', blob: new Blob([blob], { type: imageMime }) }
  if (declaredType === 'image') return { type: 'image', blob }

  let text = null
  try {
    const encoding = startsWith(bytes, [255, 254])
      ? 'utf-16le'
      : startsWith(bytes, [254, 255])
      ? 'utf-16be'
      : 'utf-8'
    text = new TextDecoder(encoding, { fatal: true }).decode(bytes)
  } catch (_) {
    // Some machine programs use Windows-1251 without an encoding marker.
    if (/\.(iqs|nc|cnc|tap|gcode)$/i.test(filename))
      text = new TextDecoder('windows-1251').decode(bytes)
  }
  if (text !== null) {
    let controls = 0
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i)
      if ((code < 32 && ![9, 10, 13].includes(code)) || code === 127) controls++
    }
    if (!text.includes('\0') && controls <= Math.max(0, text.length * 0.005)) {
      if (/(?:^|\r?\n)\s*0\r?\n\s*SECTION\r?\n/.test(text))
        return { type: 'dxf' }
      return {
        type: 'text',
        text: text.slice(0, MAX_TEXT_CHARACTERS),
        truncated: text.length > MAX_TEXT_CHARACTERS,
      }
    }
  }
  const ole = startsWith(bytes, [208, 207, 17, 224, 161, 177, 26, 225])
  if (CAD_EXTENSIONS.test(filename) || ole) return { type: 'cad', bytes }
  return { type: 'file' }
}
