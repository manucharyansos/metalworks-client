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
export function normalizeCadModel(source, format, unit) {
  if (
    !source?.success ||
    !Array.isArray(source.meshes) ||
    !source.meshes.length
  )
    invalid('empty')
  if (source.meshes.length > MAX_MODEL_PARTS) invalid('too_complex')
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
    const normal =
      normalValues?.length === position.length
        ? new Float32Array(normalValues)
        : null
    if (normal && !normal.every(Number.isFinite)) invalid()
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
      name: String(mesh.name || '').slice(0, 200),
      position,
      normal,
      index,
      color: color(mesh.color),
      faceColors,
    }
  })
  if (!triangles || !bounds.max.some((value, axis) => value > bounds.min[axis]))
    invalid('empty')
  return { format, unit, meshes, bounds, triangles, vertices }
}

export function modelTransferables(model) {
  return model.meshes.flatMap((mesh) =>
    [mesh.position.buffer, mesh.index.buffer, mesh.normal?.buffer].filter(
      Boolean
    )
  )
}
