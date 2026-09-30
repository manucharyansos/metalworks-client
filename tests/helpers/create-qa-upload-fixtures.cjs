// Creates disposable upload fixtures. SW/IQS fixtures test transport only,
// and are intentionally not usable manufacturing files.
const fs = require('node:fs')
const path = require('node:path')
const directory = path.resolve(process.argv[2] || '.')
fs.mkdirSync(directory, { recursive: true })
const save = (name, data) => fs.writeFileSync(path.join(directory, `metalworks-qa-20260930-${name}`), data)
save('note.txt', 'QA TEST — DO NOT USE IN PRODUCTION\nՏեքստային փորձարկում\nТест вложения INFO\n')
save('model.sldprt', 'QA transport fixture only. Not a SolidWorks model. Do not use in production.\n')
save('laser.iqs', 'QA transport fixture only. Not manufacturing data. Do not use in production.\n')
save('part.dxf', '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1009\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nQA_DO_NOT_MANUFACTURE\n10\n0\n20\n0\n30\n0\n11\n100\n21\n0\n31\n0\n0\nCIRCLE\n8\nQA_DO_NOT_MANUFACTURE\n10\n50\n20\n20\n30\n0\n40\n10\n0\nENDSEC\n0\nEOF\n')
save('image.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZVYAAAAASUVORK5CYII=', 'base64'))
const audio = Buffer.alloc(44 + 8000 * 2)
audio.write('RIFF'); audio.writeUInt32LE(audio.length - 8, 4); audio.write('WAVE', 8)
audio.write('fmt ', 12); audio.writeUInt32LE(16, 16); audio.writeUInt16LE(1, 20); audio.writeUInt16LE(1, 22)
audio.writeUInt32LE(8000, 24); audio.writeUInt32LE(16000, 28); audio.writeUInt16LE(2, 32); audio.writeUInt16LE(16, 34)
audio.write('data', 36); audio.writeUInt32LE(16000, 40)
for (let i = 0; i < 8000; i++) audio.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 440 / 8000) * 700), 44 + i * 2)
save('audio.wav', audio)
const content = 'BT /F1 12 Tf 20 110 Td (QA TEST FIXTURE) Tj 0 -22 Td (DO NOT USE IN PRODUCTION) Tj ET\n'
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 260 160] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`,
]
let pdf = '%PDF-1.4\n'
const offsets = [0]
objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n` })
const xref = Buffer.byteLength(pdf)
pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`
pdf += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
save('drawing.pdf', pdf)
console.log(`Created 7 marked QA fixtures in ${directory}`)
