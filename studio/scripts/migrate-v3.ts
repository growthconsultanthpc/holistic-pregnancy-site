// v3 migration (G45): offer singleton, programme crmLabel, five real testimonials, referral message, showcase post, referral clause in Terms.
// Safe to re-run. Back up first: npx sanity dataset export production ../backup.tar.gz
// Run: cd studio && npx sanity exec scripts/migrate-v3.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import path from 'node:path'

const client = getCliClient({apiVersion: '2025-01-01'})
const k = () => randomUUID().slice(0, 8)
const T = JSON.parse(readFileSync(path.resolve(process.cwd(), 'scripts/v3-testimonials.json'), 'utf8'))

// crmLabel = the option already live in Airtable; the public title may be reworded later without touching leads.
const CRM: Record<string, string> = {preconception: 'Preconception Program', dincharya: '21 Days of Dincharya', pathshala: 'Holistic Pathshala', 'power-of-11': 'Power of 11'}
const PUBLIC: Record<string, string> = {preconception: 'Pre-Conception Program', dincharya: '21 Days of Dinacharya', pathshala: 'Holistic Pathshala', 'power-of-11': 'Power of 11'}

async function main() {
  for (const [slug, crmLabel] of Object.entries(CRM)) {
    const id = await client.fetch(`*[_type=="program" && slug.current==$slug][0]._id`, {slug})
    if (!id) throw new Error('programme missing: ' + slug)
    await client.patch(id).set({crmLabel, title: PUBLIC[slug]}).commit()
  }
  console.log('programmes: crmLabel set')

  await client.createIfNotExists({
    _id: 'offer', _type: 'offer', enabled: true, discountPercent: 25, code: 'OFFER25', endsAt: '2026-11-15T23:59:00+05:30',
    tag: '✦ Limited-time offer', subline: 'on all our programs', barText: 'Limited-time offer: 25% off all programs',
    pageTitle: 'A calmer, healthier and happier journey into parenthood.',
    pageIntro: 'For a limited time, get 25% off any of our live online programs. Enroll before the timer runs out to lock in the offer price.',
    endedText: 'This offer has ended. Our programs are still open, talk to us and we will help you choose.',
    blurb: 'Holistic Pregnancy began with a simple belief: every woman deserves to feel seen, heard and cared for, from planning a baby through every step of pregnancy.', blurbBy: 'Geetha Bafna',
  })
  console.log('offer ready')

  await client.patch('siteSettings').setIfMissing({
    email: 'geethabafnadigital@gmail.com',
    referralMessage: 'Hi , I would like to refer you for a program at Holistic Pregnancy. Use this referral code {code} at {site} for their programs.',
  }).commit()

  // testimonials: retire the dummy examples, add the five real ones (match by name)
  const dummies = await client.fetch(`*[_type=="testimonial" && isPlaceholder==true]._id`)
  for (const id of dummies) await client.patch(id).set({visible: false}).commit()
  for (const t of T) {
    const programmes = t.program.split(',').map((s: string) => s.trim()).filter(Boolean)
    const doc = {_type: 'testimonial', name: t.name, stage: t.detail, quote: t.text, programmes, visible: true, showOnHome: true, isPlaceholder: false}
    const id = await client.fetch(`*[_type=="testimonial" && name==$n && isPlaceholder!=true][0]._id`, {n: t.name})
    id ? await client.patch(id).set(doc).commit() : await client.create(doc)
  }
  console.log('testimonials:', T.length)

  // referral clause in Terms (stays Draft for the client to approve)
  const terms = await client.fetch(`*[_type=="legalPage" && slug=="terms"][0]{_id, body}`)
  if (terms && !JSON.stringify(terms.body).includes('Referral')) {
    const block = (text: string, style = 'normal') => ({_type: 'block', _key: k(), style, markDefs: [], children: [{_type: 'span', _key: k(), text, marks: []}]})
    await client.patch(terms._id).set({body: [...terms.body,
      block('Referral rewards', 'h2'),
      block('Referral rewards (₹1,000 off a programme, or a complimentary meditation session) are given at our discretion once the referred person has enrolled and paid. Codes have no cash value, cannot be combined with other offers unless we say so, and we may withdraw a code that is misused. [CLIENT TO CONFIRM: reward terms.]')]}).commit()
    console.log('terms: referral clause added')
  }

  // one showcase article (the site picks one featured post at random; staging only while it is a dummy)
  const firstPost = await client.fetch(`*[_type=="post" && isPlaceholder==true][0]._id`)
  if (firstPost) await client.patch(firstPost).set({featured: true}).commit()
  console.log('done')
}
main().catch((e) => { console.error(e); process.exit(1) })
