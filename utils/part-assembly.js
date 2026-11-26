// How several parts sit together in an assembly, as world matrices:
//   - a part joined by an edge to an earlier part's edge, at an angle
//     between the two (180° carries the sheet on, 90° stands it up);
//   - a part placed freely (its matrix kept as the customer left it);
//   - or, in a row, all of them side by side in their order.
// Edges are those of a part's box as built by partModel(): the front
// (the drawing's bottom), right, back (top) and left edges of its lowest sheet.
import * as THREE from 'three'

export const EDGES = ['bottom', 'right', 'top', 'left']
export const ASSEMBLY_MODES = ['edge', 'free', 'row']

// A part's four edges, in its own frame: ends a → b, the outward direction
// across the edge, the sheet's normal, and `slide`, the way a positive
// offset moves along it: as the drawing's axes, to the right on the front
// and back edges and backwards on the side ones.
export function partEdges(box, thickness) {
  const y = box.min.y + Math.max(0.5, Number(thickness) || 1) / 2
  const [x0, x1, front, back] = [box.min.x, box.max.x, box.max.z, box.min.z]
  const normal = new THREE.Vector3(0, 1, 0)
  const right = new THREE.Vector3(1, 0, 0)
  const backwards = new THREE.Vector3(0, 0, -1)
  const edge = (a, b, out, slide) => ({ a, b, out, normal, slide })
  const v = (x, z) => new THREE.Vector3(x, y, z)
  return {
    bottom: edge(v(x0, front), v(x1, front), new THREE.Vector3(0, 0, 1), right),
    right: edge(
      v(x1, front),
      v(x1, back),
      new THREE.Vector3(1, 0, 0),
      backwards
    ),
    top: edge(v(x1, back), v(x0, back), new THREE.Vector3(0, 0, -1), right),
    left: edge(
      v(x0, back),
      v(x0, front),
      new THREE.Vector3(-1, 0, 0),
      backwards
    ),
  }
}

// A new part joins the first one: the edges it has not used yet first, at 90°.
export function newJoint(placements) {
  const taken = (placements || [])
    .filter((p) => p && p.type === 'joint' && p.parent === 0)
    .map((p) => p.parentEdge)
  return {
    type: 'joint',
    parent: 0,
    parentEdge: EDGES.find((edge) => !taken.includes(edge)) || 'top',
    edge: 'bottom',
    angle: 90,
    offset: 0,
    flip: false,
  }
}

// The first part stays put; a joint must name an earlier part, and one that
// does not (or the old first part, moved down) joins the first part on an
// edge it still has free.
function settle(list) {
  const out = list.map((placement, i) => {
    if (i === 0) return { type: 'root' }
    if (placement?.type === 'free') return placement
    if (
      placement?.type === 'joint' &&
      placement.parent >= 0 &&
      placement.parent < i
    )
      return placement
    return null
  })
  out.forEach((placement, i) => {
    if (!placement) out[i] = newJoint(out.filter(Boolean))
  })
  return out
}

// The placements once parts `index` and `other` swap places: joints follow
// the parts they name.
export function swapPlacements(placements, index, other) {
  const list = [...placements]
  ;[list[index], list[other]] = [list[other], list[index]]
  const map = (i) => (i === index ? other : i === other ? index : i)
  return settle(
    list.map((placement) =>
      placement?.type === 'joint'
        ? { ...placement, parent: map(placement.parent) }
        : placement
    )
  )
}

// The placements once part `index` is taken out of the assembly.
export function dropPlacement(placements, index) {
  return settle(
    placements
      .filter((_, i) => i !== index)
      .map((placement) => {
        if (placement?.type !== 'joint') return placement
        if (placement.parent === index) return { ...placement, parent: -1 }
        return placement.parent > index
          ? { ...placement, parent: placement.parent - 1 }
          : placement
      })
  )
}

/**
 * The world matrix of a child whose `edge` lies along the parent's
 * `parentEdge` (both given in world space), `angle` degrees between the two
 * sheets, slid `offset` mm along the edge (the edge's `slide` way), `flip`
 * turning it over.
 */
export function jointMatrix(
  parentEdge,
  childEdge,
  { angle = 90, offset = 0, flip = false } = {}
) {
  const u = parentEdge.b.clone().sub(parentEdge.a).normalize()
  const slide = parentEdge.slide ? parentEdge.slide.clone().normalize() : u
  const target = parentEdge.a
    .clone()
    .add(parentEdge.b)
    .multiplyScalar(0.5)
    .add(slide.multiplyScalar(Number(offset) || 0))
  const bend = Math.PI - (Number(angle) * Math.PI) / 180
  const d = parentEdge.out
    .clone()
    .multiplyScalar(Math.cos(bend))
    .add(parentEdge.normal.clone().multiplyScalar(Math.sin(bend)))
    .normalize()
  // Edges of neighbouring sheets run opposite ways, like the pages of a book.
  const along = flip ? u.clone() : u.clone().negate()
  const cu = childEdge.b.clone().sub(childEdge.a).normalize()
  const inward = childEdge.out.clone().negate()
  const hand = Math.sign(cu.clone().cross(inward).dot(childEdge.normal)) || 1
  const local = new THREE.Matrix4().makeBasis(cu, inward, childEdge.normal)
  const world = new THREE.Matrix4().makeBasis(
    along,
    d,
    along.clone().cross(d).multiplyScalar(hand)
  )
  const rotation = world.multiply(local.clone().transpose())
  const middle = childEdge.a
    .clone()
    .add(childEdge.b)
    .multiplyScalar(0.5)
    .applyMatrix4(rotation)
  return rotation.setPosition(target.sub(middle))
}

function worldEdge(edge, matrix) {
  const turn = new THREE.Matrix3().setFromMatrix4(matrix)
  return {
    a: edge.a.clone().applyMatrix4(matrix),
    b: edge.b.clone().applyMatrix4(matrix),
    out: edge.out.clone().applyMatrix3(turn).normalize(),
    normal: edge.normal.clone().applyMatrix3(turn).normalize(),
    slide: edge.slide.clone().applyMatrix3(turn).normalize(),
  }
}

/**
 * World matrices for every part. `boxes[i]` is part i's box in its own frame
 * and `thicknesses[i]` its sheet; `placements[i]` says how it sits. The first
 * part, and any part whose joint names no earlier part, stays where it is.
 */
export function assemble(boxes, thicknesses, placements, mode = 'edge') {
  const matrices = []
  if (mode === 'row') {
    // Side by side along x in their order, a little apart.
    const gap = Math.max(20, ...boxes.map((b) => (b.max.x - b.min.x) * 0.15))
    let x = 0
    boxes.forEach((box) => {
      matrices.push(
        new THREE.Matrix4().makeTranslation(
          x - box.min.x,
          -box.min.y,
          -box.max.z
        )
      )
      x += box.max.x - box.min.x + gap
    })
    return matrices
  }
  boxes.forEach((box, i) => {
    const placement = placements[i]
    if (placement?.type === 'free' && Array.isArray(placement.matrix)) {
      matrices.push(new THREE.Matrix4().fromArray(placement.matrix))
      return
    }
    if (
      placement?.type === 'joint' &&
      placement.parent >= 0 &&
      placement.parent < i
    ) {
      const parent = placement.parent
      const parentEdges = partEdges(boxes[parent], thicknesses[parent])
      const childEdges = partEdges(box, thicknesses[i])
      const from = parentEdges[placement.parentEdge] || parentEdges.top
      const to = childEdges[placement.edge] || childEdges.bottom
      matrices.push(
        jointMatrix(worldEdge(from, matrices[parent]), to, placement)
      )
      return
    }
    matrices.push(new THREE.Matrix4())
  })
  return matrices
}
