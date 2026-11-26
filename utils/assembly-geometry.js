import * as THREE from 'three'
import { assemble } from '@/utils/part-assembly'
import { partModel } from '@/utils/part-mesh'
import { writeAssemblyStep } from '@/utils/assembly-step'

// Resolve joints once. Each member then keeps its pose even if a different
// drawing is removed from the draft. Interior holes don't change the box.
export function placedParts(views, placements, mode) {
  const material = new THREE.MeshBasicMaterial()
  try {
    const boxes = views.map(({ part, thickness }) => {
      const model = partModel({ ...part, holes: [] }, thickness, material)
      try {
        return new THREE.Box3().setFromObject(model.group)
      } finally {
        model.dispose()
      }
    })
    return assemble(boxes, views.map(v => v.thickness), placements, mode)
      .map((matrix, i) => ({ view: views[i], placement: { type: 'free', matrix: matrix.toArray() }, mode: 'free' }))
  } finally {
    material.dispose()
  }
}

export function assemblyStep(parts) {
  const material = new THREE.MeshBasicMaterial()
  const bodies = []
  const zUp = new THREE.Matrix4().makeRotationX(Math.PI / 2)
  try {
    parts.forEach(({ view, placement }, i) => {
      const pose = new THREE.Matrix4().fromArray(placement.matrix)
      const model = partModel(view.part, view.thickness, material)
      try {
        model.group.updateMatrixWorld(true)
        model.group.traverse(mesh => {
          if (!mesh.isMesh) return
          const geo = mesh.geometry
          const vertices = geo.getAttribute('position')
          const count = geo.index ? geo.index.count : vertices.count
          const transform = zUp.clone().multiply(pose).multiply(mesh.matrixWorld)
          const triangles = []
          for (let j = 0; j < count; j += 3) {
            triangles.push([j, j + 1, j + 2].map(k => new THREE.Vector3()
              .fromBufferAttribute(vertices, geo.index ? geo.index.getX(k) : k)
              .applyMatrix4(transform).toArray()))
          }
          bodies.push({ name: `Detail ${i + 1}`, triangles })
        })
      } finally {
        model.dispose()
      }
    })
    return writeAssemblyStep(bodies)
  } finally {
    material.dispose()
  }
}
