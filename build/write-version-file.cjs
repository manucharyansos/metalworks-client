const fs = require('fs')
const path = require('path')

// Writes the build id next to index.html; open tabs compare it with their own
// (plugins/app-version.client.js) and reload onto the new build.
module.exports = function writeVersionFile(distPath, buildId) {
  if (!distPath || !buildId) return null
  const file = path.join(distPath, 'version.json')
  fs.mkdirSync(distPath, { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify({ buildId: String(buildId) })}\n`)
  return file
}
