// V4 FAQs exactly as written (with **bold** and line breaks), and the contact email. Re-runnable.
import {getCliClient} from 'sanity/cli'
import {randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import path from 'node:path'
const c = getCliClient({apiVersion: '2025-01-01'})
const k = () => randomUUID().slice(0, 8)
const all = JSON.parse(readFileSync(path.resolve(process.cwd(), '../scripts/v4-faqs-all.json'), 'utf8')) as Record<string, [string, string][]>
const tok = (t: string) => t.replace('within one working day', '{callback}')
async function faqId(q: string, a: string) {
  a = tok(a)
  return (await c.fetch(`*[_type=="faq" && question==$q && answer==$a][0]._id`, {q, a})) ?? (await c.create({_type: 'faq', question: q, answer: a}))._id
}
const refs = async (l: [string, string][]) => Promise.all(l.map(async ([q, a]) => ({_type: 'reference', _key: k(), _ref: await faqId(q, a)})))
const target = async (r: string) => r === 'home' ? 'homePage' : r === 'contact' ? 'contactPage' : r === 'free-session' ? 'freeSessionPage' : await c.fetch(`*[_type=="program" && slug.current==$r][0]._id`, {r})
for (const [r, list] of Object.entries(all)) { await c.patch(await target(r)).set({faqs: await refs(list)}).commit(); console.log('faqs', r, list.length) }
await c.patch('siteSettings').set({email: 'geethabafnadigital@gmail.com'}).commit()
const orphans: string[] = await c.fetch(`*[_type=="faq" && count(*[references(^._id)]) == 0]._id`)
for (const id of orphans) await c.delete(id)
console.log('orphans removed', orphans.length)
