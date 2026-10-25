import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { Window } from 'happy-dom'

const window = new Window({ url: 'http://localhost/' })
const globals = {
  window,
  document: window.document,
  DOMParser: window.DOMParser,
  HTMLElement: window.HTMLElement,
  SVGElement: window.SVGElement,
  Element: window.Element,
  Node: window.Node,
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
}
for (const [key, value] of Object.entries(globals)) {
  Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
}

const { default: mermaid } = await import('mermaid')

// Fail the docs build when a fenced diagram does not parse. Browser rendering
// is covered by scripts/smoke-pages.mjs. Layout is dagre so this check does
// not depend on elkjs, which Vite cannot load (see .vitepress/config.mts).
mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,
  securityLevel: 'loose',
  layout: 'dagre',
})

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, files)
    else if (name.endsWith('.md')) files.push(path)
  }
  return files
}

const fence = /```mermaid\r?\n([\s\S]*?)```/g
let diagrams = 0
let failed = 0

for (const file of walk('docs')) {
  const text = readFileSync(file, 'utf8')
  fence.lastIndex = 0
  let match
  let index = 0
  while ((match = fence.exec(text))) {
    index += 1
    diagrams += 1
    try {
      await mermaid.parse(match[1])
    } catch (error) {
      failed += 1
      const message = error instanceof Error ? error.message : String(error)
      console.error(`${file} diagram ${index}: ${message}`)
    }
  }
}

if (diagrams === 0) {
  console.error('No mermaid fences found under docs/')
  process.exit(1)
}

if (failed > 0) {
  console.error(`${failed} mermaid diagram${failed === 1 ? '' : 's'} failed to parse`)
  process.exit(1)
}

console.log(`Parsed ${diagrams} mermaid diagrams`)
