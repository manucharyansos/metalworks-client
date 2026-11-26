// Bends a customer adds to a flat part: straight lines right across it, all
// one way (upright lines, or level ones), each at its own angle, upwards or
// downwards. The flat sheet stays as drawn; the bend lines go into the DXF on
// the BEND layer (the server counts them as bends) and the 3D view folds the
// part along them. Imports only part-templates, so tests load this file directly.
import { samplePolygon } from '@/utils/part-templates'

// Inner radius ≈ thickness and the neutral axis at 40 % of it, as for the bent templates.
const K_FACTOR = 0.4
export const BEND_AXES = ['x', 'y']
export const BEND_LIMITS = { min: 30, max: 170 }

// Where a line across the part (x = at for upright lines, y = at for level
// ones) runs inside the outline: [[from, to], …] along the line.
export function crossings(part, axis, at) {
  const points = samplePolygon(part.outline, 24)
  const hits = []
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % points.length]
    const [a1, b1, a2, b2] = axis === 'y' ? [y1, x1, y2, x2] : [x1, y1, x2, y2]
    if (a1 > at === a2 > at || a1 === a2) continue
    hits.push(b1 + ((at - a1) * (b2 - b1)) / (a2 - a1))
  }
  hits.sort((a, b) => a - b)
  const out = []
  for (let i = 0; i + 1 < hits.length; i += 2) out.push([hits[i], hits[i + 1]])
  return out
}

// A new bend in the middle of the widest stretch the other bends leave free.
export function newBend(part, bends = [], axis = 'x') {
  const length = axis === 'y' ? part.height : part.width
  const marks = [
    0,
    ...bends.map((b) => Number(b.at)).sort((a, b) => a - b),
    length,
  ]
  let best = null
  for (let i = 0; i + 1 < marks.length; i++)
    if (!best || marks[i + 1] - marks[i] > best[1] - best[0])
      best = [marks[i], marks[i + 1]]
  return { axis, at: Math.round((best[0] + best[1]) / 2), angle: 90, up: true }
}

/**
 * The part with its bends: { part, issue }. The part gains the bend lines and
 * `fold` (for 3D and for keeping patterns off the bends); `issue` names the
 * first problem: an angle out of range, a flange too short to bend, two bends
 * too close, or a hole too near a bend.
 */
export function applyBends(part, bends, thickness) {
  const list = (bends || []).map((b) => ({
    at: Number(b.at),
    angle: Number(b.angle),
    up: b.up !== false,
  }))
  if (!list.length) return { part, issue: null }
  const axis = bends[0].axis === 'y' ? 'y' : 'x'
  const t = Math.max(0.5, Number(thickness) || 1)
  const radius = t
  const length = axis === 'y' ? part.height : part.width
  const zones = list
    .map((b, index) => {
      const turn = ((180 - b.angle) * Math.PI) / 180
      return {
        index,
        at: b.at,
        angle: b.angle,
        turn: b.up ? turn : -turn,
        allowance: Math.abs(turn) * (radius + K_FACTOR * t),
      }
    })
    .sort((a, b) => a.at - b.at)
  let issue = null
  const flag = (key, index) => {
    if (!issue) issue = { key, index }
  }
  // A flange needs about twice the thickness of flat metal to be held and bent.
  const keep = 2 * t
  zones.forEach((zone, i) => {
    if (
      !Number.isFinite(zone.angle) ||
      zone.angle < BEND_LIMITS.min ||
      zone.angle > BEND_LIMITS.max
    )
      flag('bendAngle', zone.index)
    if (
      !Number.isFinite(zone.at) ||
      zone.at - zone.allowance / 2 < keep ||
      zone.at + zone.allowance / 2 > length - keep
    )
      flag('bendEdge', zone.index)
    const next = zones[i + 1]
    if (
      next &&
      next.at - next.allowance / 2 - (zone.at + zone.allowance / 2) < keep
    )
      flag('bendClose', next.index)
  })
  // Holes too near a bend are pulled out of round.
  for (const hole of part.holes) {
    const along = samplePolygon(hole, 8).map(([x, y]) => (axis === 'y' ? y : x))
    const [lo, hi] = [Math.min(...along), Math.max(...along)]
    for (const zone of zones) {
      if (
        hi > zone.at - zone.allowance / 2 - keep &&
        lo < zone.at + zone.allowance / 2 + keep
      ) {
        flag('holesBend', zone.index)
        break
      }
    }
  }
  const lines = []
  for (const zone of zones) {
    for (const [from, to] of crossings(part, axis, zone.at)) {
      lines.push(
        axis === 'y'
          ? { x1: from, y1: zone.at, x2: to, y2: zone.at }
          : { x1: zone.at, y1: from, x2: zone.at, y2: to }
      )
    }
  }
  return {
    part: {
      ...part,
      bends: [...part.bends, ...lines],
      fold: {
        thickness: t,
        radius,
        k: K_FACTOR,
        axis,
        bends: zones.map((zone) => ({
          x: zone.at,
          turn: zone.turn,
          allowance: zone.allowance,
        })),
      },
    },
    issue,
  }
}
