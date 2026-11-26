// AP203 faceted solids, in millimetres. Each folded panel or bend segment
// stays a closed solid at the same world position as in the assembly viewer.
export function writeAssemblyStep(bodies) {
  const rows = []
  function entity(value) {
    rows.push(`#${rows.length + 1}=${value};`)
    return `#${rows.length}`
  }
  const app = entity("APPLICATION_CONTEXT('configuration controlled 3d designs of mechanical parts and assemblies')")
  entity(`APPLICATION_PROTOCOL_DEFINITION('international standard','config_control_design',1994,${app})`)
  const mechanical = entity(`MECHANICAL_CONTEXT('',${app},'mechanical')`)
  const product = entity(`PRODUCT('Assembly','Assembly','',(${mechanical}))`)
  const formation = entity(`PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE('','',${product},.NOT_KNOWN.)`)
  const context = entity(`DESIGN_CONTEXT('',${app},'design')`)
  const definition = entity(`PRODUCT_DEFINITION('design','',${formation},${context})`)
  const shape = entity(`PRODUCT_DEFINITION_SHAPE('','',${definition})`)
  const mm = entity('(LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.))')
  const rad = entity('(NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.))')
  const sr = entity('(NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT())')
  const tolerance = entity(`UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-6),${mm},'distance_accuracy_value','')`)
  const frame = entity(`(GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((${tolerance})) GLOBAL_UNIT_ASSIGNED_CONTEXT((${mm},${rad},${sr})) REPRESENTATION_CONTEXT('','3D'))`)
  const solids = bodies.map(({ name, triangles }) => {
    const points = new Map()
    const faces = []
    for (const triangle of triangles) {
      const corners = triangle.map((xyz) => {
        const key = xyz.map((n) => n.toFixed(6)).join(',')
        if (!points.has(key)) points.set(key, entity(`CARTESIAN_POINT('',(${key}))`))
        return points.get(key)
      })
      if (new Set(corners).size < 3) continue
      const [a,b,c] = triangle
      const ab = b.map((n,i) => n-a[i])
      const ac = c.map((n,i) => n-a[i])
      const normal = [ab[1]*ac[2]-ab[2]*ac[1], ab[2]*ac[0]-ab[0]*ac[2], ab[0]*ac[1]-ab[1]*ac[0]]
      if (Math.hypot(...normal) < 1e-12) continue
      const direction = vector => {
        const length = Math.hypot(...vector)
        return entity(`DIRECTION('',(${vector.map(n => (n/length).toFixed(12))}))`)
      }
      const axis = entity(`AXIS2_PLACEMENT_3D('',${corners[0]},${direction(normal)},${direction(ab)})`)
      const plane = entity(`PLANE('',${axis})`)
      const loop = entity(`POLY_LOOP('',(${corners}))`)
      const bound = entity(`FACE_OUTER_BOUND('',${loop},.T.)`)
      faces.push(entity(`FACE_SURFACE('',(${bound}),${plane},.T.)`))
    }
    if (!faces.length) throw new Error('Empty STEP body')
    const shell = entity(`CLOSED_SHELL('',(${faces}))`)
    return entity(`FACETED_BREP('${name}',${shell})`)
  })
  if (!solids.length) throw new Error('Empty assembly')
  const representation = entity(`FACETED_BREP_SHAPE_REPRESENTATION('',(${solids}),${frame})`)
  entity(`SHAPE_DEFINITION_REPRESENTATION(${shape},${representation})`)
  return ["ISO-10303-21;", "HEADER;", "FILE_DESCRIPTION(('Metalworks faceted assembly'),'2;1');",
    `FILE_NAME('assembly.step','${new Date().toISOString().slice(0,19)}',('Metalworks'),('Metalworks'),'Metalworks','Metalworks','');`,
    "FILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));", 'ENDSEC;', 'DATA;', ...rows, 'ENDSEC;', 'END-ISO-10303-21;'].join('\n')
}
