export function apiFileParams(path) {
  return { path }
}

export function ext(nameOrPath = '') {
  const s = (nameOrPath || '').toLowerCase()
  const i = s.lastIndexOf('.')
  return i >= 0 ? s.slice(i) : ''
}

export function isImage(f) {
  const e = ext(f?.path || f?.original_name)
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(e)
}

export function isPdf(f) {
  const e = ext(f?.path || f?.original_name)
  return e === '.pdf'
}

export function isDxf(f) {
  const e = ext(f?.path || f?.original_name)
  return e === '.dxf'
}

export function isCad(f) {
  const e = ext(f?.path || f?.original_name)
  return [
    '.step',
    '.stp',
    '.sldprt',
    '.sldasm',
    '.igs',
    '.iges',
    '.dwg',
    '.dwt',
  ].includes(e)
}
