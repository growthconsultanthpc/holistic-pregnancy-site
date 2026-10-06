// v2 migration (G37-G39): overwrites ONLY the fields the client's v2 design changes, from scripts/v2-data.json
// (generated from the client's HTML). Safe to re-run. A dataset backup was taken first.
// Run: cd studio && npx sanity exec scripts/migrate-v2.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import path from 'node:path'

const client = getCliClient({apiVersion: '2025-01-01'})
const data = JSON.parse(readFileSync(path.resolve(process.cwd(), 'scripts/v2-data.json'), 'utf8'))
const k = () => randomUUID().slice(0, 8)
const ref = (id: string) => ({_type: 'reference', _ref: id, _key: k()})
// "within one working day" becomes a token so one Sanity setting changes it everywhere (decision 5B)
const tok = (t: string) => t.replace('within one working day', '{callback}')

const faqIds = new Map<string, string>()
async function faq(q: string, a: string) {
  a = tok(a)
  const key = q + '|' + a
  if (!faqIds.has(key)) {
    const found = await client.fetch(`*[_type=="faq" && question==$q && answer==$a][0]._id`, {q, a})
    faqIds.set(key, found ?? (await client.create({_type: 'faq', question: q, answer: a}))._id)
  }
  return faqIds.get(key)!
}
const faqRefs = async (list: [string, string][]) => Promise.all(list.map(async ([q, a]) => ref(await faq(q, a))))
const oldFaqIds = new Set<string>()
async function remember(id: string) {
  const old = await client.fetch(`*[_id==$id][0].faqs[]._ref`, {id})
  ;(old ?? []).forEach((r: string) => oldFaqIds.add(r))
}

const P: Record<string, any> = {
  preconception: {title: 'Pre-Conception Program', order: 1, signature: false, tag: 'Planning a pregnancy', price: 9999, cardMeta: '6 sessions · 60 min',
    cardBullets: ['For anyone planning a pregnancy', 'Body, mind and soul preparation'], inLadder: false},
  pathshala: {title: 'Holistic Paatshala', order: 2, signature: true, tag: 'Early pregnancy', price: 29999, cardMeta: '21 weekly sessions',
    cardBullets: ['Start in early pregnancy', 'End-to-end mind, body and soul care'], inLadder: true},
  dincharya: {title: '21 Days of Dinacharya', order: 3, signature: false, tag: 'Habit-forming', price: 9999, cardMeta: '21-day guided journey',
    cardBullets: ['For any trimester', 'Build daily pregnancy habits'], inLadder: true},
  'power-of-11': {title: 'Power of 11', order: 4, signature: false, tag: '11 power-packed sessions', price: 16499, cardMeta: '11 weekly sessions',
    cardBullets: ['For pregnant women', 'Garbh Sanskar, meditation, affirmations'], inLadder: true},
}
const OBSOLETE = ['layout', 'intro', 'ctaLabel', 'whoIntro', 'whoNote', 'questions', 'covers', 'gain', 'howPills', 'priceNote', 'trimesters',
  'planHeading', 'planIntro', 'sessions', 'planIsPlaceholder']
const ladderNote = (slug: string) => data.dincharya.ladder.find((l: any) => l.slug === slug)?.note ?? ''

async function main() {
  // ---- programmes
  for (const [slug, base] of Object.entries(P)) {
    const id = await client.fetch(`*[_type=="program" && slug.current==$slug][0]._id`, {slug})
    if (!id) throw new Error('programme missing: ' + slug)
    await remember(id)
    const d = data[slug]
    await client.patch(id).set({
      ...base, ladderNote: base.inLadder ? ladderNote(slug) : '',
      priceBullets: d.priceBullets, eyebrow: d.eyebrow, heroBefore: d.heroBefore, heroHighlight: d.heroHighlight, heroAfter: d.heroAfter,
      heroLead: d.heroLead, heroMeta: d.heroMeta, primaryLabel: d.primaryLabel, secondaryLabel: d.secondaryLabel, secondaryType: d.secondaryType,
      closePrimaryLabel: d.closePrimaryLabel, faqs: await faqRefs(d.faqs),
    }).unset(OBSOLETE).commit()
    console.log('programme updated:', slug)
  }
  // ---- site settings
  const bar = (text: string, linkLabel = '', linkUrl = '') => ({_key: k(), _type: 'barMessage', text, linkLabel, linkUrl})
  await client.patch('siteSettings').set({
    statYears: 15, statCouples: 1000, statHours: 1000, statMission: 11,
    callbackPromise: 'within one working day', payNote: 'No payment needed now. Our team will call you and share payment details.',
    barMessages: [
      bar('Free online session for couples planning or expecting a baby', 'Join Free Session', '/free-session/'),
      bar('15+ years of experience · 1,000+ couples’ lives touched'),
      bar('Planning a baby?', 'Explore the Pre-Conception Program', '/preconception/'),
      bar('Newly pregnant?', 'Discover Holistic Paatshala', '/pathshala/'),
      bar('Live online sessions · Partners welcome'),
    ],
  }).unset(['barText', 'barLinkLabel']).commit()
  console.log('siteSettings updated')
  // ---- home
  const byTitle = async (t: string) => client.fetch(`*[_type=="program" && title==$t][0]._id`, {t})
  await remember('homePage'); await remember('contactPage')
  await client.patch('homePage').set({
    chooser: [
      {_key: k(), label: 'Planning a baby', programmes: [ref(await byTitle('Pre-Conception Program'))]},
      {_key: k(), label: 'Newly pregnant', programmes: [ref(await byTitle('Holistic Paatshala'))]},
      {_key: k(), label: 'Pregnant, any trimester', programmes: [ref(await byTitle('21 Days of Dinacharya')), ref(await byTitle('Power of 11'))]},
    ],
    faqs: await faqRefs(data._home.faqs),
  }).commit()
  await client.patch('contactPage').set({faqs: await faqRefs(data._contact.faqs)}).commit()
  console.log('home + contact updated')
  // ---- about: larger purpose
  await client.patch('aboutPage').set({
    purposeEyebrow: 'Our larger purpose',
    purposeLines: ['If you want one year of prosperity, grow seeds.', 'If you want ten years of prosperity, grow trees.', 'If you want one hundred years of prosperity, grow people.'],
    purposeBefore: 'At Holistic Pregnancy, our vision goes beyond a single pregnancy. Our mission is to reach',
    purposeBold: '11 million couples',
    purposeAfter: 'and, through more conscious beginnings and more mindful parenting, contribute towards building a more conscious humanity.',
    purposeClose: 'Because when we nurture parents, we help nurture the generations that follow.',
    purposeName: 'Geetha Bafna', purposeRole: 'Founder, Holistic Pregnancy',
  }).commit()
  console.log('about updated')
  // ---- enrol thank-you (v2 checkout success panel)
  await client.patch('thankYouPages').set({
    'enrol.heading': 'Thank you, {name}!',
    'enrol.body': 'Your request for {programme} is in. Our team will call you {callback} to answer your questions, confirm your batch and share payment details.',
    'enrol.nextSteps': ['We call you at your preferred time', 'You receive payment details on WhatsApp (UPI or bank transfer)', 'Your seat is confirmed once payment is received'],
    'enrol.whatsappPrompt': 'Can’t wait?',
  }).commit()
  console.log('thank-you updated')
  // ---- delete only the old FAQs that were replaced and are no longer referenced anywhere
  let removed = 0
  for (const id of oldFaqIds) {
    const used = await client.fetch(`count(*[references($id)])`, {id})
    if (used === 0) { await client.delete(id); removed++ }
  }
  console.log(`done. old FAQs removed (no longer referenced): ${removed}; FAQ docs now: ${await client.fetch('count(*[_type=="faq"])')}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
