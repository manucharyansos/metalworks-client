import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { normalizeCadModel, modelTransferables } from '~/utils/cad-model'

const VENDOR_VERSION = '0.0.23'

async function importCad(bytes, format) {
  // The worker is served in _nuxt under the application's router base.
  const vendor = new URL(
    '../cad-vendor/' + VENDOR_VERSION + '/',
    self.location.href
  )
  self.importScripts(new URL('occt-import-js.js', vendor).href)
  const occt = await self.occtimportjs({
    locateFile: (name) => new URL(name, vendor).href,
    print: () => {},
    printErr: () => {},
  })
  const options = {
    linearUnit: 'millimeter',
    linearDeflectionType: 'bounding_box_ratio',
    linearDeflection: 0.001,
    angularDeflection: 0.3,
  }
  return format === 'iges'
    ? occt.ReadIgesFile(bytes, options)
    : occt.ReadStepFile(bytes, options)
}

function meshSource(geometry, name) {
  return {
    name,
    attributes: {
      position: { array: geometry.attributes.position.array },
      normal: geometry.attributes.normal
        ? { array: geometry.attributes.normal.array }
        : null,
    },
    index: geometry.index ? { array: geometry.index.array } : null,
  }
}

self.onmessage = async ({ data }) => {
  try {
    if (
      !(data.buffer instanceof ArrayBuffer) ||
      !data.buffer.byteLength ||
      data.buffer.byteLength > 10 * 1024 * 1024 ||
      !['iges', 'step', 'stl', 'obj'].includes(data.format)
    )
      throw new Error('invalid')
    const bytes = new Uint8Array(data.buffer)
    let source
    if (['iges', 'step'].includes(data.format)) {
      source = await importCad(bytes, data.format)
    } else if (data.format === 'stl') {
      // STLLoader trusts a binary header's triangle count when allocating arrays.
      // Check it against the actual payload before invoking the loader.
      const header = new TextDecoder().decode(bytes.subarray(0, 512))
      const count =
        bytes.length >= 84 ? new DataView(data.buffer).getUint32(80, true) : 0
      const binary = count > 0 && 84 + count * 50 === bytes.length
      if (!binary && !/^\s*solid\b/i.test(header)) throw new Error('invalid')
      const geometry = new STLLoader().parse(data.buffer)
      source = { success: true, meshes: [meshSource(geometry, data.filename)] }
      geometry.dispose()
    } else {
      const object = new OBJLoader().parse(
        new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      )
      const meshes = []
      object.traverse((child) => {
        if (child.isMesh) meshes.push(meshSource(child.geometry, child.name))
        if (child.geometry) child.geometry.dispose()
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material]
        materials.forEach((material) => {
          if (material) material.dispose()
        })
      })
      source = { success: true, meshes }
    }
    const model = normalizeCadModel(
      source,
      data.format,
      ['iges', 'step'].includes(data.format) ? 'mm' : null
    )
    self.postMessage({ model }, modelTransferables(model))
  } catch (error) {
    self.postMessage({
      error: ['empty', 'too_complex'].includes(error.code)
        ? error.code
        : 'invalid',
    })
  }
}
