// v3 migration part 2 (G45): the client's v3 images, FAQs and home copy. Safe to re-run (images are re-uploaded; FAQ docs reused by text).
// Run: cd studio && npx sanity exec scripts/migrate-v3b.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {randomUUID} from 'node:crypto'
import {createReadStream, readFileSync} from 'node:fs'
import path from 'node:path'

const client = getCliClient({apiVersion: '2025-01-01'})
const k = () => randomUUID().slice(0, 8)
const root = path.resolve(process.cwd(), '..')
const faqs = JSON.parse(readFileSync(path.join(root, 'scripts/v3-faqs.json'), 'utf8')) as Record<string, [string, string][]>
const tok = (t: string) => t.replace('within one working day', '{callback}')

async function img(file: string, alt: string) {
  const a = await client.assets.upload('image', createReadStream(path.join(root, 'reference/v3_design/img', file)), {filename: file})
  return {_type: 'image', asset: {_type: 'reference', _ref: a._id}, alt}
}
async function faqId(q: string, a: string) {
  a = tok(a)
  const found = await client.fetch(`*[_type=="faq" && question==$q && answer==$a][0]._id`, {q, a})
  return found ?? (await client.create({_type: 'faq', question: q, answer: a}))._id
}
const refs = async (list: [string, string][]) => Promise.all(list.map(async ([q, a]) => ({_type: 'reference', _key: k(), _ref: await faqId(q, a)})))

async function main() {
  // programme images (card + page top share the v3 picture)
  const IM: Record<string, [string, string]> = {
    preconception: ['im11.webp', 'A happy couple planning for a baby, writing together in a journal'],
    pathshala: ['im7.webp', 'Expectant mother smiling, hand resting on her small baby bump'],
    dincharya: ['im6.webp', 'Expectant mother resting her hand on her baby bump'],
    'power-of-11': ['im3.webp', 'A pregnant woman resting on a soft blanket, hands on her baby bump'],
  }
  for (const [slug, [file, alt]] of Object.entries(IM)) {
    const id = await client.fetch(`*[_type=="program" && slug.current==$slug][0]._id`, {slug})
    const image = await img(file, alt)
    await client.patch(id).set({cardImage: image, heroImage: image, faqs: await refs(faqs[slug])}).commit()
    console.log('programme', slug, 'images + faqs')
  }
  // home
  await client.patch('homePage').set({
    heroImage: await img('im10.webp', 'A happy expecting couple'),
    heroHighlight: 'calmer, healthier and happier',
    trustItems: ['Live online sessions', 'Small batches of 5–6 mothers', 'Partners welcome', 'Works alongside your doctor', 'Free first session'],
    founderCreds: ['Certified Prenatal Yoga Trainer (RPYT)', 'Pregnancy & Garbh Sanskar Coach', 'Educationalist', '1,000+ mothers mentored'],
    faqs: await refs(faqs.home),
  }).commit()
  console.log('home updated')
  // drop FAQ docs nothing points to any more (the v2 set)
  const orphans: string[] = await client.fetch(`*[_type=="faq" && count(*[references(^._id)]) == 0]._id`)
  for (const id of orphans) await client.delete(id)
  console.log('orphan FAQs removed:', orphans.length)
}
main().catch((e) => { console.error(e); process.exit(1) })
