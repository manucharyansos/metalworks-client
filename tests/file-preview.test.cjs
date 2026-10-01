const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const CFB = require('cfb')
const { deflateSync } = require('fflate')
const { extractPreview } = require('cad-preview')
const source = fs.readFileSync(path.join(__dirname, '..', 'utils/factory-preview.js'), 'utf8')
const helpers = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK3sAAAAASUVORK5CYII=', 'base64')

test('DLD and IQS payloads use the actual PDF or DXF content rather than factory names', async () => {
  const { inspectFactoryPreview } = await helpers
  const pdf = await inspectFactoryPreview(new Blob(['%PDF-1.7\nfixture']), 'bend.dld', 'file')
  assert.equal(pdf.type, 'pdf')
  assert.equal(pdf.blob.type, 'application/pdf')
  const dxf = await inspectFactoryPreview(new Blob(['0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n']), 'drawing.iqs', 'file')
  assert.equal(dxf.type, 'dxf')
})

test('textual machine programs render multilingual text; binary programs keep the download fallback', async () => {
  const { inspectFactoryPreview } = await helpers
  const content = 'Ծրագիր\nПрограмма\nG01 X20 Y30\n<script>plain text</script>'
  const text = await inspectFactoryPreview(new Blob([content]), 'cut.iqs', 'file')
  assert.equal(text.type, 'text')
  assert.equal(text.text, content)
  const binary = await inspectFactoryPreview(new Blob([new Uint8Array([0, 255, 1, 2, 3])]), 'cut.iqs', 'file')
  assert.equal(binary.type, 'file')
})

test('large text previews are bounded and UTF-16 programs remain readable', async () => {
  const { inspectFactoryPreview } = await helpers
  const long = await inspectFactoryPreview(new Blob(['a'.repeat(200001)]), 'cut.iqs', 'file')
  assert.equal(long.text.length, 200000)
  assert.equal(long.truncated, true)
  const utf16 = await inspectFactoryPreview(new Blob([Buffer.from([255, 254]), Buffer.from('Программа', 'utf16le')]), 'cut.iqs', 'file')
  assert.equal(utf16.text, 'Программа')
})

test('SolidWorks preview extraction handles both OLE thumbnails and modern compressed images', async () => {
  const cfb = CFB.utils.cfb_new()
  CFB.utils.cfb_add(cfb, 'PreviewPNG', png)
  const ole = CFB.write(cfb, { type: 'buffer' })
  const result = extractPreview(new Uint8Array(ole), { filename: 'part.sldprt' })
  assert.equal(result.format, 'png')
  assert.deepEqual(Buffer.from(result.data), png)
  const modern = Buffer.concat([Buffer.from([1, 2, 3, 4, 0x27, 0x56, 0x67, 0x96, 0x56, 0x77]), Buffer.from(deflateSync(png))])
  const saved = extractPreview(new Uint8Array(modern), { filename: 'assembly.sldasm' })
  assert.equal(saved.format, 'png')
  assert.deepEqual(Buffer.from(saved.data), png)
})

test('SolidWorks files without a thumbnail and transport-only fixtures never invent geometry', async () => {
  const { inspectFactoryPreview } = await helpers
  const binary = new Uint8Array([0, 1, 2, 255, 0, 2, 3, 4])
  assert.equal((await inspectFactoryPreview(new Blob([binary]), 'part.sldprt', 'file')).type, 'cad')
  assert.equal(extractPreview(binary, { filename: 'part.sldprt' }), null)
  const fixture = await inspectFactoryPreview(new Blob(['QA transport fixture only. Not a SolidWorks model.']), 'fixture.sldprt', 'file')
  assert.equal(fixture.type, 'text')
})

test('empty and oversized responses fail without allocating a preview', async () => {
  const { inspectFactoryPreview } = await helpers
  for (const blob of [new Blob([]), new Blob([new Uint8Array(10 * 1024 * 1024 + 1)])]) {
    await assert.rejects(inspectFactoryPreview(blob, 'cut.iqs', 'file'), /Invalid preview/)
  }
})
