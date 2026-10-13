// V4 migration (G49): fields for the client's V4 features (spots, pop-up, referral/tracking/music settings, mantra, V4 FAQs, programme price-box bullets).
// Safe to re-run. Back up first: npx sanity dataset export production ../backup.tar.gz
// Run: cd studio && npx sanity exec scripts/migrate-v4.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import path from 'node:path'

const client = getCliClient({apiVersion: '2025-01-01'})
const k = () => randomUUID().slice(0, 8)
const faqs = JSON.parse(readFileSync(path.resolve(process.cwd(), '../scripts/v4-faqs.json'), 'utf8')) as Record<string, [string, string][]>
const tok = (t: string) => t.replace('within one working day', '{callback}')
async function faqId(q: string, a: string) {
  a = tok(a)
  const found = await client.fetch(`*[_type=="faq" && question==$q && answer==$a][0]._id`, {q, a})
  return found ?? (await client.create({_type: 'faq', question: q, answer: a}))._id
}
const refs = async (l: [string, string][]) => Promise.all(l.map(async ([q, a]) => ({_type: 'reference', _key: k(), _ref: await faqId(q, a)})))

async function main() {
  await client.patch('offer').set({
    pageTitle: 'A calmer, healthier and happier journey into parenthood.', pageTitleHighlight: 'calmer, healthier and happier',
    spotsTotal: 0, spotsLeft: 0, popup: true, popupDelay: 20, popupText: 'Limited-time offer: 25% off any program',
  }).commit()
  await client.patch('siteSettings').set({
    referralOn: true, referralReward: 1000, referralGift: 'a complimentary meditation session with us',
    metaPixelId: '', googleTagId: '', musicOn: false, musicLabel: 'Garbh Sanskar mantras',
  }).commit()
  // checkout summary bullets, as in V4
  const F: Record<string, string[]> = {
    preconception: ['6 guided sessions + 1 free Conscious Conception session', '60 minutes each', 'Designed for couples'],
    dincharya: ['21-day guided journey', 'For couples in any trimester', 'Online support and monitoring'],
    'power-of-11': ['11 live weekly sessions', '60 minutes each, live online', 'Guided processes and affirmations'],
    pathshala: ['21 live weekly sessions', '60 minutes each, live online', 'For couples in early pregnancy'],
  }
  for (const [slug, priceBullets] of Object.entries(F)) {
    const id = await client.fetch(`*[_type=="program" && slug.current==$slug][0]._id`, {slug})
    await client.patch(id).set({priceBullets}).commit()
  }
  await client.patch('contactPage').set({faqs: await refs(faqs.contact)}).commit()
  await client.patch('freeSessionPage').set({faqs: await refs(faqs['free-session'])}).commit()
  await client.createIfNotExists({
    _id: 'mantra-daily-chants', _type: 'mantraTrack', title: 'Garbh Sanskar daily chants', why: 'A peaceful daily practice for you and your baby',
    meaning: 'Gentle daily chants for a calm, peaceful pregnancy. Sit comfortably, breathe slowly and listen, ideally together with your partner.',
    youtubeId: 'awOFPUWhQKw', isShort: true, credit: 'H2Yoga Aryasudha', order: 1,
  })
  const orphans: string[] = await client.fetch(`*[_type=="faq" && count(*[references(^._id)]) == 0]._id`)
  for (const id of orphans) await client.delete(id)
  console.log('done; orphan FAQs removed:', orphans.length)
}
main().catch((e) => { console.error(e); process.exit(1) })
