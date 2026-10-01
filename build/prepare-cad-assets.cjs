const fs = require('node:fs')
const path = require('node:path')

// Keep the unmodified CAD runtime on our origin. No model is sent to a vendor.
module.exports = function prepareCadAssets(projectRoot) {
  const manifest = require.resolve('occt-import-js/package.json')
  const version = require(manifest).version
  const source = path.join(path.dirname(manifest), 'dist')
  const target = path.join(projectRoot, 'static', 'cad-vendor', version)
  fs.mkdirSync(target, { recursive: true })
  for (const name of [
    'occt-import-js.js',
    'occt-import-js.wasm',
    'license.occt-import-js.txt',
    'license.occt.txt',
  ]) {
    fs.copyFileSync(path.join(source, name), path.join(target, name))
  }
  fs.writeFileSync(
    path.join(target, 'SOURCE.txt'),
    'Unmodified occt-import-js ' +
      version +
      ' JavaScript/WebAssembly runtime.\n' +
      'Source: https://github.com/kovacsv/occt-import-js\n' +
      'Distribution/source archive: https://registry.npmjs.org/occt-import-js/-/occt-import-js-' +
      version +
      '.tgz\n' +
      'Licenses: license.occt-import-js.txt and license.occt.txt\n'
  )
}
