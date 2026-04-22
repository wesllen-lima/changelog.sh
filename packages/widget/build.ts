export {}

const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  naming: 'widget.[ext]',
  minify: true,
  target: 'browser',
})

if (!result.success) {
  for (const log of result.logs) console.error(log)
  process.exit(1)
}

const content = await Bun.file('./dist/widget.js').bytes()
const gzipped = Bun.gzipSync(content)
const MAX = 4 * 1024

if (gzipped.length > MAX) {
  console.error(`Widget too large: ${gzipped.length} bytes gzipped (limit: ${MAX} bytes)`)
  process.exit(1)
}

console.log(`Widget built: ${gzipped.length}/${MAX} bytes gzipped`)
