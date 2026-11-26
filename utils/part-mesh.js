// A part as a three.js model: the flat sheet with its holes, or the same sheet
// folded along its bend lines by any share from flat (0) to fully bent (1).
// Used by the builder's 3D view and by the assembly view.
import * as THREE from 'three'
import { samplePolygon } from '@/utils/part-templates'

// Unpainted metals: colour, how metallic and how rough the surface looks.
const METALS = {
  steel: { color: 0x8c949c, metalness: 0.7, roughness: 0.42 },
  stainless: { color: 0xc5cad0, metalness: 0.85, roughness: 0.28 },
  aluminium: { color: 0xd3d7db, metalness: 0.75, roughness: 0.35 },
}

// Bare metal, or powder coat in a colour (#rrggbb).
export function surface(material, { paint = '', metal = 'steel' } = {}) {
  const look = paint
    ? { color: new THREE.Color(paint), metalness: 0.15, roughness: 0.55 }
    : { ...(METALS[metal] || METALS.steel) }
  material.color = new THREE.Color(look.color)
  material.metalness = look.metalness
  material.roughness = look.roughness
  material.needsUpdate = true
  return material
}

function shape(points) {
  const s = new THREE.Shape()
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  return s
}

function path(points) {
  const p = new THREE.Path()
  points.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)))
  p.closePath()
  return p
}

// The part of a polygon between u = a and u = b (Sutherland–Hodgman).
function clip(points, a, b) {
  const cut = (list, keep, at) => {
    const out = []
    for (let i = 0; i < list.length; i++) {
      const p = list[i]
      const q = list[(i + 1) % list.length]
      const [inP, inQ] = [keep(p), keep(q)]
      if (inP) out.push(p)
      if (inP !== inQ) {
        const t = (at - p[0]) / (q[0] - p[0])
        out.push([at, p[1] + t * (q[1] - p[1])])
      }
    }
    return out
  }
  return cut(
    cut(points, (p) => p[0] >= a, a),
    (p) => p[0] <= b,
    b
  )
}

// Where the line u = at runs inside the polygon: [[w0, w1], …].
function across(points, at) {
  const hits = []
  for (let i = 0; i < points.length; i++) {
    const [u1, w1] = points[i]
    const [u2, w2] = points[(i + 1) % points.length]
    if (u1 > at === u2 > at || u1 === u2) continue
    hits.push(w1 + ((at - u1) * (w2 - w1)) / (u2 - u1))
  }
  hits.sort((x, y) => x - y)
  const out = []
  for (let i = 0; i + 1 < hits.length; i += 2) out.push([hits[i], hits[i + 1]])
  return out
}

/**
 * { group, pose(share), dispose() }: the part's meshes in a group. pose()
 * folds it (0 flat, 1 bent) and stands it on its middle panel, so a channel
 * opens upwards. Flat parts lie on the XZ plane, thickness upwards.
 */
export function partModel(part, thickness, material) {
  const t = Math.max(0.5, Number(part.fold?.thickness || thickness) || 2)
  const group = new THREE.Group()
  const fold = part.fold?.bends?.length ? part.fold : null
  if (!fold) {
    const s = shape(samplePolygon(part.outline, 24))
    for (const hole of part.holes) s.holes.push(path(samplePolygon(hole, 10)))
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: t,
      bevelEnabled: false,
    })
    geometry.rotateX(-Math.PI / 2)
    group.add(new THREE.Mesh(geometry, material))
    return {
      group,
      pose() {},
      dispose: () => geometry.dispose(),
    }
  }

  // Bends across upright lines walk along x; level lines are walked along y,
  // the part turned a quarter (a turn, not a mirror, so holes stay true).
  const level = fold.axis === 'y'
  const toUW = level ? ([x, y]) => [y, part.width - x] : ([x, y]) => [x, y]
  const outline = samplePolygon(part.outline, 24).map(toUW)
  const holes = part.holes.map((hole) => samplePolygon(hole, 10).map(toUW))
  const length = level ? part.height : part.width
  const zones = [...fold.bends].sort((a, b) => a.x - b.x)
  const marks = [0]
  for (const zone of zones)
    marks.push(zone.x - zone.allowance / 2, zone.x + zone.allowance / 2)
  marks.push(length)

  // Flat panels between the bends, each built once in its own frame.
  const panels = []
  for (let i = 0; i < marks.length; i += 2) {
    const [a, b] = [marks[i], marks[i + 1]]
    if (b - a <= 1e-6) {
      panels.push(null)
      continue
    }
    const piece = clip(outline, a, b)
    if (piece.length < 3) {
      panels.push(null)
      continue
    }
    const s = shape(piece.map(([u, w]) => [u - a, w]))
    for (const points of holes)
      if (points.every(([u]) => u >= a - 1e-6 && u <= b + 1e-6))
        s.holes.push(path(points.map(([u, w]) => [u - a, w])))
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: t,
      bevelEnabled: false,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.matrixAutoUpdate = false
    group.add(mesh)
    panels.push({ mesh, length: b - a })
  }
  // Each bend's strips (where the bend line crosses the outline), rebuilt per pose.
  const strips = zones.map((zone) => across(outline, zone.x))
  let curved = []

  const pose = (share = 1) => {
    for (const mesh of curved) {
      group.remove(mesh)
      mesh.geometry.dispose()
    }
    curved = []
    let at = new THREE.Vector2(0, 0)
    let heading = 0
    const headings = []
    const place = (panel) => {
      if (!panel) return
      const d = new THREE.Vector3(Math.cos(heading), Math.sin(heading), 0)
      const n = new THREE.Vector3(-Math.sin(heading), Math.cos(heading), 0)
      // Along the profile, across the part (into the screen), through the thickness.
      const matrix = new THREE.Matrix4().makeBasis(
        d,
        new THREE.Vector3(0, 0, -1),
        n
      )
      matrix.setPosition(at.x - (n.x * t) / 2, at.y - (n.y * t) / 2, 0)
      panel.mesh.matrix.copy(matrix)
      headings.push(heading)
      at = at
        .clone()
        .add(new THREE.Vector2(d.x * panel.length, d.y * panel.length))
    }
    zones.forEach((zone, i) => {
      place(panels[i])
      const turn = zone.turn * share
      const side = turn >= 0 ? 1 : -1
      const n = new THREE.Vector2(-Math.sin(heading), Math.cos(heading))
      if (Math.abs(turn) < 1e-4) {
        // Not bent yet: the bend zone is still flat sheet.
        const d = new THREE.Vector2(Math.cos(heading), Math.sin(heading))
        for (const [w0, w1] of strips[i]) {
          const s = shape([
            [at.x - (n.x * t) / 2, at.y - (n.y * t) / 2],
            [
              at.x - (n.x * t) / 2 + d.x * zone.allowance,
              at.y - (n.y * t) / 2 + d.y * zone.allowance,
            ],
            [
              at.x + (n.x * t) / 2 + d.x * zone.allowance,
              at.y + (n.y * t) / 2 + d.y * zone.allowance,
            ],
            [at.x + (n.x * t) / 2, at.y + (n.y * t) / 2],
          ])
          const geometry = new THREE.ExtrudeGeometry(s, {
            depth: w1 - w0,
            bevelEnabled: false,
          })
          geometry.translate(0, 0, -w1)
          const mesh = new THREE.Mesh(geometry, material)
          group.add(mesh)
          curved.push(mesh)
        }
        at = at.clone().add(d.multiplyScalar(zone.allowance))
        return
      }
      // The neutral line keeps the zone's flat length: its radius follows the turn.
      const r = Math.max(zone.allowance / Math.abs(turn), t / 2 + 1e-3)
      const centre = at.clone().add(n.clone().multiplyScalar(side * r))
      const a0 = heading - (side * Math.PI) / 2
      const a1 = a0 + turn
      const [inner, outer] = [r - t / 2, r + t / 2]
      for (const [w0, w1] of strips[i]) {
        const s = new THREE.Shape()
        s.moveTo(
          centre.x + outer * Math.cos(a0),
          centre.y + outer * Math.sin(a0)
        )
        s.absarc(centre.x, centre.y, outer, a0, a1, turn < 0)
        s.lineTo(
          centre.x + inner * Math.cos(a1),
          centre.y + inner * Math.sin(a1)
        )
        s.absarc(centre.x, centre.y, inner, a1, a0, turn >= 0)
        s.closePath()
        const geometry = new THREE.ExtrudeGeometry(s, {
          depth: w1 - w0,
          bevelEnabled: false,
          curveSegments: 24,
        })
        geometry.translate(0, 0, -w1)
        const mesh = new THREE.Mesh(geometry, material)
        group.add(mesh)
        curved.push(mesh)
      }
      at = new THREE.Vector2(
        centre.x + r * Math.cos(a1),
        centre.y + r * Math.sin(a1)
      )
      heading += turn
    })
    place(panels[zones.length])
    // Stand it on its middle panel.
    group.rotation.set(0, 0, -(headings[Math.floor(headings.length / 2)] || 0))
    group.updateMatrixWorld(true)
  }
  pose(1)
  return {
    group,
    pose,
    dispose() {
      for (const panel of panels) panel?.mesh.geometry.dispose()
      for (const mesh of curved) mesh.geometry.dispose()
    },
  }
}
