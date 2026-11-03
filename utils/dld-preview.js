// Delem XML is data only: never evaluate the embedded stylesheet.
export function parseDld(text, Parser = globalThis.DOMParser) {
  if (
    !Parser ||
    text.length > 8 * 1024 * 1024 ||
    /<!DOCTYPE|<!ENTITY/i.test(text)
  )
    throw new Error('Unsupported DLD document')
  const doc = new Parser().parseFromString(text, 'application/xml')
  if (
    doc.getElementsByTagName('parsererror').length ||
    !doc.getElementsByTagName('Workpiece').length
  )
    throw new Error('Invalid DLD document')
  const value = (node, name) =>
    node.getElementsByTagName(name)[0]?.getAttribute('value') || ''
  const parts = []
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  }
  let segments = 0
  const point = (x, y) => {
    if (
      ![x, y].every(Number.isFinite) ||
      Math.max(Math.abs(x), Math.abs(y)) > 1e7
    )
      throw new Error('Invalid coordinate')
    bounds.minX = Math.min(bounds.minX, x)
    bounds.maxX = Math.max(bounds.maxX, x)
    bounds.minY = Math.min(bounds.minY, -y || 0)
    bounds.maxY = Math.max(bounds.maxY, -y || 0)
  }
  function outlines(raw, multiple) {
    if (!raw) return ''
    const tokens = raw.trim().split(/\s+/)
    let i = 0
    const number = () => {
      const t = tokens[i++]
      if (!t || !/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(t))
        throw new Error('Invalid number')
      return Number(t)
    }
    const count = () => {
      const n = number()
      if (!Number.isInteger(n) || n < 0 || n > 20000)
        throw new Error('Invalid count')
      return n
    }
    const boolean = () => {
      const t = tokens[i++]
      if (!['true', 'false'].includes(t)) throw new Error('Invalid flag')
      return t === 'true'
    }
    const total = multiple ? count() : 1
    let path = ''
    for (let c = 0; c < total; c++) {
      if (multiple && tokens[i++] !== 'Outline')
        throw new Error('Unsupported outline')
      const n = count()
      let first, previous
      for (let j = 0; j < n; j++) {
        if (++segments > 50000) throw new Error('Drawing too complex')
        const x1 = number()
        const y1 = number()
        const x2 = number()
        const y2 = number()
        const arc = boolean()
        point(x1, y1)
        point(x2, y2)
        if (!j) {
          path += `M${x1} ${-y1}`
          first = [x1, y1]
        } else if (Math.hypot(x1 - previous[0], y1 - previous[1]) > 0.02)
          throw new Error('Disconnected outline')
        if (arc) {
          const clockwise = boolean()
          const cx = number()
          const cy = number()
          const radius = Math.hypot(x1 - cx, y1 - cy)
          if (
            !radius ||
            Math.abs(radius - Math.hypot(x2 - cx, y2 - cy)) >
              Math.max(0.02, radius * 0.001)
          )
            throw new Error('Invalid arc')
          const start = Math.atan2(y1 - cy, x1 - cx)
          const end = Math.atan2(y2 - cy, x2 - cx)
          const sweep =
            ((clockwise ? start - end : end - start) + 2 * Math.PI) %
            (2 * Math.PI)
          const fullCircle = Math.hypot(x2 - x1, y2 - y1) < 1e-8
          for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
            const distance =
              ((clockwise ? start - angle : angle - start) + 4 * Math.PI) %
              (2 * Math.PI)
            if (fullCircle || distance <= sweep + 1e-10)
              point(
                cx + radius * Math.cos(angle),
                cy + radius * Math.sin(angle)
              )
          }
          if (Math.hypot(x2 - x1, y2 - y1) < 1e-8) {
            path += `A${radius} ${radius} 0 1 ${clockwise ? 1 : 0} ${
              2 * cx - x1
            } ${-(2 * cy - y1)}A${radius} ${radius} 0 1 ${
              clockwise ? 1 : 0
            } ${x2} ${-y2}`
          } else
            path += `A${radius} ${radius} 0 ${sweep > Math.PI ? 1 : 0} ${
              clockwise ? 1 : 0
            } ${x2} ${-y2}`
        } else path += `L${x2} ${-y2}`
        previous = [x2, y2]
      }
      if (n) {
        if (Math.hypot(first[0] - previous[0], first[1] - previous[1]) > 0.02)
          throw new Error('Open outline')
        path += 'Z'
      }
    }
    if (i !== tokens.length) throw new Error('Unsupported geometry')
    return path
  }
  const workpiece = doc.getElementsByTagName('Workpiece')[0]
  for (const component of Array.from(
    workpiece.getElementsByTagName('StaticComponent')
  )) {
    for (const part of Array.from(
      component.getElementsByTagName('StaticComponentPart')
    )) {
      const hull = outlines(value(part, 'StaticComponentHull'), false)
      if (hull)
        parts.push({
          name: value(component, 'WorkpieceComponentName'),
          path: hull + outlines(value(part, 'StaticComponentHoles'), true),
        })
    }
  }
  if (!parts.length || !Object.values(bounds).every(Number.isFinite))
    throw new Error('No supported contours')
  const bends = Array.from(doc.getElementsByTagName('BendStep'))
    .map((step, index) => ({
      step: index + 1,
      angle: value(step, 'BendAngle'),
      length: value(step, 'BendLength'),
    }))
    .filter((row) => row.angle || row.length)
  return {
    parts,
    bounds,
    bends,
    name: value(workpiece, 'WorkpieceName'),
    thickness: value(workpiece, 'WorkpieceThickness'),
    material: value(workpiece, 'MaterialName'),
  }
}
