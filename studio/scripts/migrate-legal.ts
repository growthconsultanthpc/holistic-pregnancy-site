// The client's four policies (PDFs) into the Sanity legal pages. Text comes from scripts/legal-v1.json (scripts/extract-legal.py).
// Overwrites title, body, lastUpdated and approval of the four legal pages. Back up first. Re-runnable.
// Run: cd studio && npx sanity exec scripts/migrate-legal.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import path from 'node:path'

const c = getCliClient({apiVersion: '2025-01-01'})
const k = () => randomUUID().slice(0, 8)
const data = JSON.parse(readFileSync(path.resolve(process.cwd(), '../scripts/legal-v1.json'), 'utf8')) as Record<string, {title: string; blocks: {t: 'h2' | 'p' | 'li'; runs: [string, boolean][]}[]}>
const LINK = /([\w.+-]+@[\w-]+\.[\w.]+|consumerhelpline\.gov\.in)/

// one block -> spans + link marks (emails and the helpline site become links)
function block(b: {t: string; runs: [string, boolean][]}) {
  const markDefs: any[] = [], children: any[] = []
  for (const [text, bold] of b.runs)
    for (const part of text.split(LINK)) {
      if (!part) continue
      const marks: string[] = bold ? ['strong'] : []
      if (LINK.test(part) && part === (part.match(LINK) ?? [])[0]) {
        const key = k(); markDefs.push({_key: key, _type: 'link', href: part.includes('@') ? `mailto:${part}` : `https://${part}`}); marks.push(key)
      }
      children.push({_type: 'span', _key: k(), text: part, marks})
    }
  return {_type: 'block', _key: k(), style: b.t === 'h2' ? 'h2' : 'normal', ...(b.t === 'li' ? {listItem: 'bullet', level: 1} : {}), markDefs, children}
}

for (const [slug, d] of Object.entries(data)) {
  const id = await c.fetch(`*[_type=="legalPage" && slug==$slug][0]._id`, {slug})
  if (!id) throw new Error('legal page missing: ' + slug)
  await c.patch(id).set({title: d.title, body: d.blocks.map(block), lastUpdated: '2026-10-16', status: 'approved', approvedOn: '2026-10-16'}).commit()
  console.log(slug, d.blocks.length, 'blocks')
}
