import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { chromium } from 'playwright'

const baseUrl = process.argv[2]
if (!baseUrl) {
  console.error('Usage: node scripts/smoke-pages.mjs <baseUrl>')
  console.error('Example: node scripts/smoke-pages.mjs http://127.0.0.1:5173/ham-radio-docs')
  process.exit(1)
}

const siteRoot = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, files)
    else if (name.endsWith('.md')) files.push(path)
  }
  return files
}

function routeFor(file) {
  let rel = relative('docs', file).split(sep).join('/')
  if (rel === 'index.md') return '/'
  if (rel.endsWith('/index.md')) return `/${rel.slice(0, -'index.md'.length)}`
  return `/${rel.slice(0, -3)}.html`
}

const pages = walk('docs').map((file) => {
  const text = readFileSync(file, 'utf8')
  const diagrams = text.match(/```mermaid\r?\n/g)?.length ?? 0
  const route = routeFor(file)
  const refresh = text.match(/http-equiv="refresh"[^>]*content="\d+\s*;\s*url=([^"]+)"/i)
  let refreshPath = null
  if (refresh) {
    refreshPath = new URL(refresh[1], pageUrl(route)).pathname
  }
  return { file, route, diagrams, refreshPath }
})

function pageUrl(route) {
  const path = route === '/' ? '' : route.replace(/^\//, '')
  return new URL(path, siteRoot).href
}

async function launch() {
  const channel = process.env.PLAYWRIGHT_CHANNEL
  return chromium.launch({
    channel: channel || undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
}

function leakScript() {
  const text = document.body.innerText
  const stray = [...document.body.children]
    .filter((el) => el.id !== 'app' && el.tagName !== 'SCRIPT')
    .map((el) => `${el.tagName}#${el.id} ${(el.textContent || '').slice(0, 120)}`)
  const diagrams = [...document.querySelectorAll('.vp-mermaid')].map((el) => ({
    svg: Boolean(el.querySelector('svg')),
    error: (el.textContent || '').includes('Syntax error in text'),
  }))
  return {
    syntax: text.includes('Syntax error in text'),
    versionLeak: /mermaid version \d/.test(text),
    stray,
    diagrams,
  }
}

async function assertPage(page, info, label) {
  if (info.diagrams > 0) {
    await page.waitForFunction(
      (expected) => {
        const nodes = [...document.querySelectorAll('.vp-mermaid')]
        return (
          nodes.length === expected &&
          nodes.every((node) => node.querySelector('svg') && !(node.textContent || '').includes('Syntax error'))
        )
      },
      info.diagrams,
      { timeout: 20000 }
    )
  } else {
    await page.waitForTimeout(400)
  }

  const result = await page.evaluate(leakScript)
  const problems = []
  if (result.syntax || result.versionLeak) {
    problems.push('page text contains a Mermaid syntax-error banner')
  }
  const strayErrors = result.stray.filter((line) => /Syntax error in text|mermaid version/.test(line))
  if (strayErrors.length) {
    problems.push(`error SVG outside #app: ${strayErrors.join(' | ')}`)
  }
  if (info.diagrams > 0 && result.diagrams.length !== info.diagrams) {
    problems.push(`expected ${info.diagrams} diagrams, found ${result.diagrams.length}`)
  }
  if (result.diagrams.some((diagram) => !diagram.svg || diagram.error)) {
    problems.push('a diagram did not render an SVG')
  }
  if (problems.length) {
    throw new Error(`${label} ${info.route}: ${problems.join('; ')}`)
  }
}

async function clientNavigate(page, href, also) {
  const requested = new URL(href).pathname
  const allowed = new Set([requested, also].filter(Boolean))
  const arrived = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('framenavigated', onFrame)
      reject(new Error(`still on ${new URL(page.url()).pathname} after clicking ${href}`))
    }, 15000)
    function onFrame(frame) {
      if (frame !== page.mainFrame()) return
      const pathname = new URL(frame.url()).pathname
      if (!allowed.has(pathname)) return
      clearTimeout(timer)
      page.off('framenavigated', onFrame)
      resolve(pathname)
    }
    page.on('framenavigated', onFrame)
  })
  await page.evaluate((next) => {
    document.getElementById('smoke-nav')?.remove()
    const anchor = document.createElement('a')
    anchor.id = 'smoke-nav'
    anchor.href = next
    anchor.textContent = 'smoke'
    anchor.style.cssText = 'position:fixed;top:40%;left:55%;z-index:2147483647;padding:8px;background:#fff;color:#000'
    const host = document.querySelector('.vp-doc') || document.body
    host.appendChild(anchor)
  }, href)
  await page.locator('#smoke-nav').click()
  await arrived
  await page.waitForTimeout(200)
}

const browser = await launch()
const failures = []

try {
  const isolated = await browser.newPage()
  for (const info of pages) {
    const href = pageUrl(info.route)
    try {
      const response = await isolated.goto(href, { waitUntil: 'networkidle', timeout: 30000 })
      const status = response?.status() ?? 0
      if (status >= 400) throw new Error(`HTTP ${status}`)
      await assertPage(isolated, info, 'load')
      console.log(`ok load ${info.route}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`FAIL load ${info.route}: ${message}`)
      failures.push(`load ${info.route}: ${message}`)
    }
  }
  await isolated.close()

  const spa = await browser.newPage()
  const first = pages[0]
  await spa.goto(pageUrl(first.route), { waitUntil: 'networkidle', timeout: 30000 })
  await assertPage(spa, first, 'spa')
  console.log(`ok spa ${first.route}`)
  for (const info of pages.slice(1)) {
    const href = pageUrl(info.route)
    try {
      await clientNavigate(spa, href, info.refreshPath)
      await assertPage(spa, info, 'spa')
      console.log(`ok spa ${info.route}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`FAIL spa ${info.route}: ${message}`)
      failures.push(`spa ${info.route}: ${message}`)
    }
  }
  await spa.close()
} finally {
  await browser.close()
}

if (failures.length) {
  console.error(`\n${failures.length} page check${failures.length === 1 ? '' : 's'} failed`)
  process.exit(1)
}

console.log(`\nChecked ${pages.length} pages with a full load and a client-side tour`)
