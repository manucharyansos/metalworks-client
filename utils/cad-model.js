export const MAX_MODEL_TRIANGLES = 500000
export const MAX_MODEL_VERTICES = 1000000
export const MAX_MODEL_PARTS = 512

function invalid(code = 'invalid') {
  const error = new Error(code)
  error.code = code
  throw error
}

function color(value) {
  return Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (channel) => Number.isFinite(channel) && channel >= 0 && channel <= 1
    )
    ? value.slice()
    : null
}

function numericArray(value) {
  return (
    Array.isArray(value) ||
    (ArrayBuffer.isView(value) && !(value instanceof DataView))
  )
}

// Normalize both OpenCascade and mesh-loader output before it reaches WebGL.
function hasZeroNormal(normal) {
  for (let i = 0; i < normal.length; i += 3) {
    if (Math.abs(normal[i]) + Math.abs(normal[i + 1]) + Math.abs(normal[i + 2]) < 1e-6)
      return true
  }
  return false
}

// CAD systems name a shape by its type ("SOLID", "Body2") when the user gave
// it no name; such names say nothing, so the viewer numbers those parts.
const GENERIC_PART_NAME =
  /^(solid|shell|compound|compsolid|body|part|mesh|default|unnamed|noname|none)[\s_-]*\d*$/i

function cleanPartName(value) {
  const name = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
  return GENERIC_PART_NAME.test(name) ? '' : name
}

// Component names from the STEP/IGES assembly tree, for solids that carry no
// name themselves: each mesh takes the nearest named node that lists it.
function treePartNames(root) {
  const names = new Map()
  const seen = new Set()
  const walk = (node, inherited, depth) => {
    if (!node || typeof node !== 'object' || depth > 64 || seen.has(node)) return
    seen.add(node)
    const name = cleanPartName(node.name) || inherited
    for (const index of Array.isArray(node.meshes) ? node.meshes : []) {
      if (Number.isInteger(index) && name && !names.has(index))
        names.set(index, name)
    }
    for (const child of Array.isArray(node.children) ? node.children : [])
      walk(child, name, depth + 1)
  }
  walk(root, '', 0)
  return names
}

// STEP strings escape non-ASCII text (ISO 10303-21): \X2\…\X0\ holds UTF-16
// code units, \X4\…\X0\ code points, \X\hh and \S\c single Latin-1 letters.
const STEP_ESCAPE =
  /\\X2\\((?:[0-9A-Fa-f]{4})*)\\X0\\|\\X4\\((?:[0-9A-Fa-f]{8})*)\\X0\\|\\X\\([0-9A-Fa-f]{2})|\\S\\([\s\S])|\\P[A-I]\\|\\\\|''/g

export function decodeStepString(value) {
  return String(value ?? '').replace(
    STEP_ESCAPE,
    (match, utf16, utf32, latin1, high) => {
      if (utf16 !== undefined)
        return utf16.replace(/[0-9A-Fa-f]{4}/g, (hex) =>
          String.fromCharCode(parseInt(hex, 16))
        )
      if (utf32 !== undefined)
        return utf32.replace(/[0-9A-Fa-f]{8}/g, (hex) => {
          const point = parseInt(hex, 16)
          return point <= 0x10ffff ? String.fromCodePoint(point) : ''
        })
      if (latin1 !== undefined) return String.fromCharCode(parseInt(latin1, 16))
      if (high !== undefined) return String.fromCharCode(high.charCodeAt(0) + 128)
      if (match === '\\\\') return '\\'
      if (match === "''") return "'"
      return ''
    }
  )
}

const STEP_SOLID =
  /#(\d+)\s*=\s*(?:MANIFOLD_SOLID_BREP|BREP_WITH_VOIDS|FACETED_BREP)\s*\(\s*'((?:[^']|'')*)'/g
const STEP_SHAPE_ITEMS =
  /=\s*[A-Z_]*SHAPE_REPRESENTATION\s*\(\s*'(?:[^']|'')*'\s*,\s*\(([^)]*)\)/g

// Body names of a single-part STEP file (a SolidWorks multi-body part), in
// the order OpenCascade reads the bodies. OpenCascade leaves these bodies
// unnamed. Assemblies return null: their names come from the assembly tree.
export function stepBodyNames(text) {
  if (typeof text !== 'string') return null
  const names = new Map()
  for (const [, id, name] of text.matchAll(STEP_SOLID)) names.set(id, name)
  if (names.size < 2) return null
  let bodies = null
  for (const [, items] of text.matchAll(STEP_SHAPE_ITEMS)) {
    const solids = (items.match(/#\d+/g) || [])
      .map((ref) => ref.slice(1))
      .filter((id) => names.has(id))
    if (!solids.length) continue
    if (bodies) return null
    bodies = solids
  }
  return bodies && bodies.map((id) => decodeStepString(names.get(id)))
}

function fileTitle(filename) {
  const name = String(filename ?? '')
    .split(/[\\/]/)
    .pop()
  return cleanPartName(name.replace(/\.[^.]*$/, '') || name)
}

// Repeated parts (six bolts) become "bolt (1)" … "bolt (6)".
function numberRepeatedNames(meshes) {
  const total = new Map()
  for (const mesh of meshes)
    if (mesh.name) total.set(mesh.name, (total.get(mesh.name) || 0) + 1)
  const used = new Map()
  for (const mesh of meshes) {
    if (!mesh.name || total.get(mesh.name) < 2) continue
    const number = (used.get(mesh.name) || 0) + 1
    used.set(mesh.name, number)
    mesh.name = `${mesh.name} (${number})`
  }
}

// Part names, best first: the body name from the STEP text, the name the
// importer gave the part, the nearest named assembly node, and for a single
// part the file name. Parts left unnamed are numbered by the viewer.
export function normalizeCadModel(source, format, unit, options = {}) {
  if (
    !source?.success ||
    !Array.isArray(source.meshes) ||
    !source.meshes.length
  )
    invalid('empty')
  if (source.meshes.length > MAX_MODEL_PARTS) invalid('too_complex')
  const treeNames = treePartNames(source.root)
  const bodyNames =
    Array.isArray(options.bodyNames) &&
    source.meshes.length > 1 &&
    options.bodyNames.length === source.meshes.length
      ? options.bodyNames
      : null
  let triangles = 0
  let vertices = 0
  const bounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  }
  const meshes = source.meshes.map((mesh, id) => {
    const values = mesh.attributes?.position?.array
    if (!numericArray(values) || !values.length || values.length % 3) invalid()
    vertices += values.length / 3
    if (vertices > MAX_MODEL_VERTICES) invalid('too_complex')
    const position = new Float32Array(values)
    for (let i = 0; i < position.length; i++) {
      if (!Number.isFinite(position[i])) invalid()
      const axis = i % 3
      bounds.min[axis] = Math.min(bounds.min[axis], position[i])
      bounds.max[axis] = Math.max(bounds.max[axis], position[i])
    }
    const indices = mesh.index?.array
    if (indices != null && !numericArray(indices)) invalid()
    const indexCount = indices == null ? position.length / 3 : indices.length
    if (!indexCount || indexCount % 3) invalid()
    triangles += indexCount / 3
    if (triangles > MAX_MODEL_TRIANGLES) invalid('too_complex')
    const index = new Uint32Array(indexCount)
    for (let i = 0; i < index.length; i++) {
      const value = indices ? indices[i] : i
      if (!Number.isInteger(value) || value < 0 || value >= position.length / 3)
        invalid()
      index[i] = value
    }
    const normalValues = mesh.attributes?.normal?.array
    if (normalValues != null && !numericArray(normalValues)) invalid()
    let normal =
      normalValues?.length === position.length
        ? new Float32Array(normalValues)
        : null
    if (normal && !normal.every(Number.isFinite)) invalid()
    // STL files may store zero normals; the viewer then computes real ones,
    // otherwise the model is lit as a flat black shape.
    if (normal && hasZeroNormal(normal)) normal = null
    const faces = Array.isArray(mesh.brep_faces) ? mesh.brep_faces : []
    if (faces.length > MAX_MODEL_TRIANGLES) invalid('too_complex')
    let coloredIndices = 0
    const faceColors = faces.flatMap((face) => {
      const rgb = color(face.color)
      if (!rgb) return []
      if (
        !Number.isInteger(face.first) ||
        !Number.isInteger(face.last) ||
        face.first < 0 ||
        face.last < face.first ||
        face.last >= index.length / 3
      )
        invalid()
      coloredIndices += (face.last - face.first + 1) * 3
      if (coloredIndices > index.length) invalid()
      return [
        {
          start: face.first * 3,
          count: (face.last - face.first + 1) * 3,
          color: rgb,
        },
      ]
    })
    return {
      id,
      name:
        cleanPartName(bodyNames?.[id]) ||
        cleanPartName(mesh.name) ||
        treeNames.get(id) ||
        '',
      position,
      normal,
      index,
      color: color(mesh.color),
      faceColors,
    }
  })
  if (!triangles || !bounds.max.some((value, axis) => value > bounds.min[axis]))
    invalid('empty')
  if (meshes.length === 1 && !meshes[0].name)
    meshes[0].name = fileTitle(options.filename)
  numberRepeatedNames(meshes)
  return { format, unit, meshes, bounds, triangles, vertices }
}

export function modelTransferables(model) {
  return model.meshes.flatMap((mesh) =>
    [mesh.position.buffer, mesh.index.buffer, mesh.normal?.buffer].filter(
      Boolean
    )
  )
}
