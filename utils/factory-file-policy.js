export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const imageExtensions = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'bmp',
  'avif',
  'heic',
  'heif',
  'tif',
  'tiff',
]
const audioExtensions = [
  'mp3',
  'wav',
  'ogg',
  'oga',
  'opus',
  'webm',
  'weba',
  'm4a',
  'aac',
  'flac',
  'mp4',
  'amr',
  '3gp',
  'aiff',
]
// Keep the client hint consistent with RejectDangerousUploads on the server.
const blockedExtensions = [
  'php',
  'php2',
  'php3',
  'php4',
  'php5',
  'php6',
  'php7',
  'php8',
  'phtml',
  'pht',
  'phtm',
  'phps',
  'phar',
  'cgi',
  'fcgi',
  'pl',
  'py',
  'rb',
  'sh',
  'bash',
  'zsh',
  'fish',
  'exe',
  'com',
  'bat',
  'cmd',
  'msi',
  'dll',
  'htaccess',
  'htpasswd',
  'html',
  'htm',
  'xhtml',
  'svg',
]

export function normalizeExtensions(extensions) {
  if (!Array.isArray(extensions)) return []
  return [
    ...new Set(
      extensions
        .map((item) =>
          String(typeof item === 'string' ? item : item?.extension || '')
            .trim()
            .toLowerCase()
            .replace(/^\.+/, '')
        )
        .filter((item) => item === '*' || /^[a-z0-9][a-z0-9._+-]*$/.test(item))
    ),
  ]
}

export function fileExtension(name) {
  const parts = String(name || '')
    .toLowerCase()
    .split('.')
  return parts.length > 1 ? parts.pop() : ''
}

export function allowsExtension(extensions, extension) {
  const allowed = normalizeExtensions(extensions)
  return (
    allowed.includes('*') || allowed.includes(String(extension).toLowerCase())
  )
}

export function inputAccept(extensions, mode = 'file') {
  const allowed = normalizeExtensions(extensions)
  if (allowed.includes('*'))
    return mode === 'image' ? 'image/*' : mode === 'audio' ? 'audio/*' : ''
  const group =
    mode === 'image'
      ? imageExtensions
      : mode === 'audio'
      ? audioExtensions
      : null
  return allowed
    .filter((ext) => !group || group.includes(ext))
    .map((ext) => `.${ext}`)
    .join(',')
}

function unsafeCharacter(character) {
  const code = character.charCodeAt(0)
  return character === '/' || character === '\\' || code < 32 || code === 127
}

export function validateFactoryFile(file, extensions, mode = 'file') {
  if (!file) return 'file_required'
  const name = String(file.name || '')
  if (
    !name ||
    new Blob([name]).size > 255 ||
    [...name].some(unsafeCharacter) ||
    name === '.' ||
    name === '..'
  )
    return 'unsafe_file'
  if (
    name
      .toLowerCase()
      .replace(/[.\s]+$/, '')
      .split('.')
      .slice(1)
      .some((ext) => blockedExtensions.includes(ext.trim()))
  )
    return 'unsafe_file'
  if (!Number.isFinite(file.size) || file.size <= 0) return 'empty_file'
  if (file.size > MAX_UPLOAD_BYTES) return 'too_large'
  const ext = fileExtension(name)
  if (!allowsExtension(extensions, ext)) return 'format_not_allowed'
  if (
    mode === 'image' &&
    !imageExtensions.includes(ext) &&
    !String(file.type || '').startsWith('image/')
  )
    return 'image_required'
  if (
    mode === 'audio' &&
    !audioExtensions.includes(ext) &&
    !String(file.type || '').startsWith('audio/')
  )
    return 'audio_required'
  return ''
}

export function previewType(name) {
  const ext = fileExtension(name)
  if (ext === 'dxf') return 'dxf'
  if (ext === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'].includes(ext))
    return 'image'
  if (audioExtensions.includes(ext) && ext !== 'mp4' && ext !== '3gp')
    return 'audio'
  if (['mp4', 'mov', 'm4v', '3gp', 'ogv'].includes(ext)) return 'video'
  if (['txt', 'md', 'csv', 'log', 'json', 'xml', 'yaml', 'yml'].includes(ext))
    return 'text'
  return 'file'
}

export function textAttachment(title, text) {
  let stem =
    String(title || 'info')
      .trim()
      .split('')
      .map((character) => (unsafeCharacter(character) ? '-' : character))
      .join('')
      .replace(/\.+$/, '')
      .slice(0, 100) || 'info'
  while (new Blob([stem]).size > 240) stem = stem.slice(0, -1)
  return new File([String(text)], `${stem}.txt`, {
    type: 'text/plain;charset=utf-8',
  })
}

export function uploadErrorMessage(error, fallback) {
  const data = error?.response?.data
  const validation =
    data?.errors &&
    Object.values(data.errors)
      .flat()
      .find((message) => typeof message === 'string')
  return validation || data?.message || fallback
}
