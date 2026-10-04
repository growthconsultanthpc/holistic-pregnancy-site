// Seed content from reference/index.html + decisions G1-G32. Safe to re-run: creates only what is missing,
// never overwrites edits. Run: npx sanity exec scripts/seed.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {createReadStream} from 'node:fs'
import {randomUUID} from 'node:crypto'
import path from 'node:path'

const client = getCliClient({apiVersion: '2025-01-01'})
const REF = path.resolve(process.cwd(), '../reference') // run from studio/
const k = () => randomUUID().slice(0, 8)
const arr = <T,>(items: T[]) => items.map((i: any) => (typeof i === 'object' ? {_key: k(), ...i} : i))
const strs = (items: string[]) => items // string arrays need no _key
const ref = (id: string) => ({_type: 'reference', _ref: id, _key: k()})
let created = 0, kept = 0

// ---------- images ----------
const assets: Record<string, string> = {}
async function img(file: string, alt: string) {
  if (!assets[file]) {
    const a = await client.assets.upload('image', createReadStream(path.join(REF, file)), {filename: file})
    assets[file] = a._id
  }
  return {_type: 'image', asset: {_type: 'reference', _ref: assets[file]}, alt}
}

// ---------- helpers ----------
async function once(type: string, filter: string, params: Record<string, any>, doc: any) {
  const found = await client.fetch(`*[_type==$type && ${filter}][0]._id`, {type, ...params})
  if (found) { kept++; return found as string }
  const d = await client.create({_type: type, ...doc}); created++; return d._id as string
}
async function single(id: string, doc: any) {
  if (await client.getDocument(id)) { kept++; return }
  await client.create({_id: id, _type: id, ...doc}); created++
}
const faqIds = new Map<string, string>()
async function faq(q: string, a: string) {
  const key = q + '|' + a
  if (!faqIds.has(key)) faqIds.set(key, await once('faq', 'question==$q && answer==$a', {q, a}, {question: q, answer: a}))
  return faqIds.get(key)!
}
const faqs = async (list: [string, string][]) => arr(await Promise.all(list.map(async ([q, a]) => ref(await faq(q, a)))))
// Portable Text from tiny markup: "## Heading", "- bullet", blank-line separated paragraphs.
function pt(md: string) {
  return md.trim().split('\n').filter((l) => l.trim()).map((l) => {
    const h = l.startsWith('## '), b = l.startsWith('- ')
    return {_type: 'block', _key: k(), style: h ? 'h2' : 'normal', ...(b ? {listItem: 'bullet', level: 1} : {}), markDefs: [],
      children: [{_type: 'span', _key: k(), marks: [], text: h ? l.slice(3) : b ? l.slice(2) : l}]}
  })
}

const DISC = 'No. It works alongside your doctor.'

async function main() {
  const [hero, i1, i2, i3, i4, founder, logo] = await Promise.all([
    img('im0.webp', 'An expectant mother smiling and holding a small bunch of flowers'),
    img('im1.webp', 'Couple preparing together for parenthood'),
    img('im2.webp', 'Expectant couple in a calm moment'),
    img('im3.webp', 'Expectant mother in a supportive, nurturing setting'),
    img('im4.webp', 'Expectant mother practising gentle movement'),
    img('im5.webp', 'Geetha Bafna, founder of Holistic Pregnancy'),
    img('logo-img.webp', 'Holistic Pregnancy'),
  ])

  // ---------- FAQs ----------
  const homeFaqs = await faqs([
    ['Who is this for?', 'Individuals and couples who are planning a pregnancy, currently pregnant, or in the early postpartum period, and want holistic, practical guidance.'],
    ['Can my partner join?', 'Yes. Partners are included and encouraged to take part.'],
    ['Does this replace medical care?', 'No. Our programs work alongside the care of your doctor and are not a substitute for medical advice.'],
    ['How do I enroll?', "Choose a program, tap Enroll, and fill in a short form. Our team will call you to confirm your seat and share the payment details. Or book a free call and we'll help you pick."],
  ])

  // ---------- Programmes ----------
  const sessionsFor = (n: number) => arr(Array.from({length: n}, (_, i) => ({
    title: `Session ${i + 1}: title to come`, summary: 'Placeholder. The real session plan is awaited from the client.', duration: '60 min'})))
  const prog = async (slug: string, d: any) => once('program', 'slug.current==$slug', {slug}, {slug: {_type: 'slug', current: slug}, planHeading: 'Your session plan', planIsPlaceholder: true, ...d})

  const pre = await prog('preconception', {
    title: 'Preconception Program', order: 1, layout: 'standard', tag: 'Planning a baby', price: 9999, meta: '6 sessions · 60 min',
    cardImage: i1, heroImage: i1, cardBullets: ['Prepare mind and body', 'Partner included'],
    intro: 'Planning for a baby is just as important as the pregnancy itself. A 6-session online program for couples preparing for parenthood.',
    ctaLabel: 'Enroll Now', whoIntro: 'Couples who are planning for a baby and want to prepare physically, mentally and emotionally before conception.',
    questions: ['How can we prepare our body and mind before conception?', 'How do we improve our overall wellbeing before parenthood?', 'How can we approach conception more consciously and align as a couple?'],
    covers: arr([{title: 'Physical preparation'}, {title: 'Mental and emotional preparation'}, {title: 'Conscious conception'}, {title: 'Couple alignment for parenthood'}]),
    gain: 'Build greater readiness for parenthood, improve overall wellbeing for both partners, understand conscious conception, and align as a couple before beginning the pregnancy journey.',
    howPills: ['6 sessions', '60 minutes each', 'Online', 'For couples'], priceBullets: ['6 online sessions', '60 minutes each', 'Designed for couples'],
    priceNote: 'Our team will call you to confirm your seat.', sessions: sessionsFor(6),
    faqs: await faqs([['Who is this for?', 'Couples who are planning a baby and want to prepare body, mind and emotions first.'], ['Can my partner join?', 'Yes. Your partner is included in the program.'], ['How are sessions held?', 'All 6 sessions are online, 60 minutes each.'], ['Does this replace medical care?', DISC]]),
  })
  const din = await prog('dincharya', {
    title: '21 Days of Dincharya', order: 2, layout: 'standard', tag: 'Pregnant, any trimester', price: 9999, meta: '6 sessions · 60 min',
    cardImage: i2, heroImage: i2, cardBullets: ['For couples in any trimester', 'Fathers-to-be encouraged'],
    intro: 'Our basic pregnancy course, designed for couples in any trimester.', ctaLabel: 'Enroll Now',
    whoIntro: 'Couples in any trimester who want guided support through pregnancy.', whoNote: 'Fathers-to-be are encouraged to join as well.',
    questions: ['How do we connect more deeply with our baby?', 'How can we support our baby’s early development?', 'How do we manage stress and keep our energy up?', 'How can we meditate and follow healthier eating habits during pregnancy?'],
    covers: arr([{title: 'Prenatal bonding'}, {title: 'Prenatal memory practices'}, {title: 'Stress management'}, {title: 'Natural energy and meditation'}, {title: 'Healthy dietary habits'}]),
    gain: 'Develop a deeper connection with your baby, learn supportive prenatal practices, manage stress better, support your energy and wellbeing, and build healthier pregnancy routines together as a couple.',
    howPills: ['6 weekly sessions', '60 minutes each', 'Live online on Zoom', 'Fathers-to-be welcome'], priceBullets: ['6 weekly one-hour sessions', 'Live online on Zoom', 'Partner welcome'],
    priceNote: 'Our team will call you to confirm your seat.', sessions: sessionsFor(6),
    faqs: await faqs([['Who is this for?', 'Couples in any trimester of pregnancy.'], ['Can my partner join?', 'Yes, and we highly recommend it. Pregnancy is a shared journey, and fathers-to-be can make a big difference.'], ['Does this replace medical care?', DISC]]),
  })
  const pow = await prog('power-of-11', {
    title: 'Power of 11', order: 3, layout: 'standard', tag: 'Emotional and mental care', price: 16500, meta: '11 weekly sessions',
    cardImage: i3, heroImage: i3, cardBullets: ['Emotional and mental care', 'Live classes and community'],
    intro: 'Nurturing sessions to support your journey through motherhood with emotional, mental and spiritual care.', ctaLabel: 'Enroll Now',
    whoIntro: 'Expecting mothers and couples looking for ongoing emotional, mental and spiritual support through the motherhood journey.',
    questions: ['How can I feel more emotionally supported?', 'How do I stay mentally grounded through the changes?', 'How can I feel more spiritually connected on this journey?'],
    covers: arr([{title: 'Emotional wellbeing'}, {title: 'Mental wellbeing'}, {title: 'Spiritual care'}, {title: 'Ongoing guided support'}]),
    gain: 'Feel more supported and nurtured, emotionally, mentally and spiritually, through a guided pregnancy journey.',
    howPills: ['11 weekly sessions', '1 hour each', '11 hours in total', 'Live classes and private recordings', 'Community support'],
    priceBullets: ['11 weekly one-hour sessions', 'Live classes and private recordings', 'Community support'],
    priceNote: 'Our team will call you to confirm your seat.', sessions: sessionsFor(11),
    faqs: await faqs([['Are the classes live or recorded?', 'You can choose live classes or private recordings.'], ['Does this replace medical care?', DISC]]),
  })
  const pat = await prog('pathshala', {
    title: 'Holistic Pathshala', order: 4, layout: 'pathshala', tag: 'Pregnant, weekly guidance', price: 30000, meta: '21 weekly sessions',
    cardImage: i4, heroImage: i4, cardBullets: ['Guidance through every trimester', 'Live weekly sessions'],
    intro: 'Weekly guidance for you, your baby and your partner through pregnancy.', ctaLabel: 'Enroll Now',
    covers: arr([
      {title: 'Trimester guidance', text: 'Know what to expect, stage by stage.'}, {title: 'Nutrition', text: 'Nourishment for you and your baby.'},
      {title: 'Safe movement', text: 'Gentle exercise suited to pregnancy.'}, {title: 'Emotional wellbeing', text: 'Support for the ups and downs.'},
      {title: 'Meditation and bonding', text: 'Calm, and closeness with your baby.'}, {title: 'Birth readiness', text: 'Feel prepared for labour and beyond.'}]),
    howPills: ['21 weekly sessions', '1 hour each', '21 hours in total', 'Online'],
    trimesters: arr([{title: 'Trimester 1', text: 'Settle and nourish.'}, {title: 'Trimester 2', text: 'Strengthen and connect.'}, {title: 'Trimester 3', text: 'Prepare for birth and early recovery.'}]),
    priceBullets: ['21 weekly one-hour sessions', '21 hours of guidance', 'Partner welcome'], priceNote: 'Our team will call you to confirm your seat.', sessions: sessionsFor(21),
    faqs: await faqs([['Who is this for?', 'Expectant mothers and their partners.'], ['Is it suitable for a high-risk pregnancy?', 'Please speak with your doctor first. Our program supports, but never replaces, medical care.'], ['Does this replace medical care?', DISC], ['How do I enroll?', 'Tap Enroll Now, or book a free call and we will help you choose.']]),
  })

  // ---------- Single pages ----------
  const email = (subject: string, body: string) => ({subject, body})
  const signoff = '\n\nWith care,\nHolistic Pregnancy\n\nThis is educational support and works alongside, not instead of, care from your doctor.'
  await single('siteSettings', {
    businessName: 'Holistic Pregnancy', tagline: 'Nurturing mothers. Healthier families. A brighter future.', logo,
    phone: '+91 98809 05511', email: 'geethabafna@gmail.com', whatsappNumber: '919880905511', whatsappMessage: "Hi, I'd like to know more about Holistic Pregnancy.",
    calendlyUrl: 'https://calendly.com/anand-arora/meeting',
    instagramUrl: 'https://www.instagram.com/holisticpregnancyforu/', facebookUrl: 'https://www.facebook.com/holisticpregnancyforu', threadsUrl: 'https://www.threads.com/@holisticpregnancyforu',
    legalEntity: 'Holistic Pregnancy', barEnabled: true, barText: 'Free online session for couples planning or expecting a baby.', barLinkLabel: 'Join Free Session', barShowDate: true,
    blogEnabled: false,
    emailFreeSession: email("We've saved your spot, {{firstName}}", 'Hi {{firstName}},\n\nThank you. We have received your request for our free online session. Our team will be in touch soon with the date and joining link.' + signoff),
    emailEnrol: email("We've received your enrolment request, {{firstName}}", 'Hi {{firstName}},\n\nThank you. We have received your enrolment request for {{programme}} and our team will call you back soon.\n\nPayment is collected offline. We will share the details on the call.' + signoff),
    emailContact: email("We've received your message, {{firstName}}", 'Hi {{firstName}},\n\nThank you. We have received your message and our team will call you back soon.' + signoff),
    paymentInstructions: 'Payment is collected offline. Our team will share the details on the call.',
    notFoundHeading: "We couldn't find that page.", notFoundText: 'Let us help you find the right programme.',
    disclaimer: 'Holistic Pregnancy is educational support and works alongside, not instead of, care from your doctor.',
  })
  await single('nextSession', {mode: 'none', fallbackText: 'Free · Live online · Date and joining link sent on WhatsApp'})
  await single('homePage', {
    heroBefore: 'A', heroHighlight: 'calmer, healthier', heroAfter: 'journey into parenthood.',
    heroLead: 'Feel informed, supported and prepared at every step, from preconception to pregnancy and postpartum.',
    heroPrimaryLabel: 'Explore Programs', heroSecondaryLabel: 'Book a Free Call', heroImage: hero,
    heroBadges: ['Nourished body', 'Balanced mind', 'Blossoming together'],
    trustItems: ['Live online sessions', 'Partners welcome', 'Works alongside your doctor', 'Free first session'],
    programmesHeading: 'Support designed for your stage', programmesIntro: 'Four programs, one gentle approach. Choose the one that fits where you are.',
    chooserQuestion: 'Where are you right now?',
    chooser: arr([{label: 'Planning a baby', programmes: [ref(pre)]}, {label: 'I am pregnant', programmes: [ref(din), ref(pat)]}, {label: 'I want emotional support', programmes: [ref(pow)]}]),
    notSureLabel: 'Not sure? Talk to us', steps: ['Choose a program', 'Join live guidance', 'Practice at home', 'Get ongoing support'],
    founderHeading: 'Guided with care and experience',
    founderBody: 'Holistic Pregnancy began with a simple belief: every woman deserves to feel seen, heard and cared for, from planning a baby through every step of pregnancy.',
    founderImage: founder, founderPoints: ['Founder-led guidance', 'Maternal wellness', 'Mindful movement', 'Emotional wellbeing'],
    founderButton: 'Know Our Story', founderSignature: 'with care, Geetha Bafna ♡',
    freeHeading: 'Begin with a free online session', freeBullets: ['Understand your stage', 'Learn simple daily practices', 'Ask your questions live'],
    freeButton: 'Reserve My Free Spot', freeNote: 'Takes 30 seconds. No payment needed. We never share your information.',
    faqHeading: 'Questions, answered simply', faqs: homeFaqs,
    seo: {title: 'Holistic Pregnancy – A calmer, healthier journey into parenthood', description: 'Holistic Pregnancy by Geetha Bafna: online programs and a supportive community for preconception, pregnancy and postpartum. Feel informed, supported and prepared at every step.'},
  })
  await single('aboutPage', {
    headline: 'Holistic Pregnancy began with a simple belief.', lead: 'Every woman deserves to feel seen, heard and cared for, from planning a baby through every step of pregnancy.',
    signature: 'Geetha Bafna, Founder', image: founder, storyHeading: 'Our story',
    story: 'Holistic Pregnancy: A complete guide for mind, body and soul, helps expecting mothers understand the importance of pre-pregnancy habits and focus on holistic practices to ensure a healthy and smooth pregnancy, delivery and post-delivery. From nutrition to meditation, this covers everything there is to know about pregnancy.',
    approachHeading: 'Our approach', approach: arr([{title: 'Mind', text: 'Practical tools for emotional wellbeing.'}, {title: 'Body', text: 'Nourishment and mindful movement.'}, {title: 'Bond', text: 'Deeper connection with your baby and partner.'}]),
    promiseHeading: 'Our promise', promise: arr([{title: 'Inclusive'}, {title: 'Religion-agnostic'}, {title: 'Partner-friendly'}, {title: 'Responsible'}]),
    closingHeading: 'Choose the support that fits your stage.',
  })
  await single('communityPage', {
    eyebrow: '🌸 A community for your journey', headline: 'Holistic Pregnancy Community', stages: ['Preconception', 'Pregnancy', 'Postpartum'],
    intro: 'Parenthood begins with hopes and questions, and unfolds through many changes. Wherever you are in that journey, you are welcome here. 💛',
    joinLabel: 'Join the Community', joinMessage: "Hi, I'd like to join the Holistic Pregnancy community",
    whoHeading: 'Who it’s for', who: 'This community brings together women and couples to learn, connect and nurture wellbeing, from preparing for conception to pregnancy and life after birth.',
    shareHeading: 'What we share', shareIntro: 'Thoughtful guidance, alongside updates on our programs and live sessions. There is room for your questions, experiences and small milestones too. 🌿',
    shareItems: ['Everyday routines', 'Nutrition', 'Emotional wellbeing', 'Mindful living'], careHeading: 'How we care for this space',
    careRules: ['Listen with empathy. Each person’s choices, circumstances and experiences are their own.', 'Share thoughtfully and keep conversations relevant to the journey.', 'Keep personal stories and conversations within the community.'],
    closingHeading: 'You are welcome here.',
  })
  await single('contactPage', {
    headline: 'Not sure which program is right for you?', lead: 'Tell us where you are, and we will help you choose.', formButton: 'Send my message',
    formNote: 'Takes 30 seconds. No payment needed. We never share your information.', directHeading: 'Reach us directly', faqHeading: 'Quick answers',
    faqs: await faqs([
      ['Which program should I choose?', 'Preconception if you are planning a baby. 21 Days of Dincharya, Power of 11 or Holistic Pathshala if you are expecting. Send us a message and we will help you choose.'],
      ['How does payment work?', 'Payment is collected offline. After you enrol, our team will call you and share the payment details.'],
      ['How do I access sessions?', 'Once you enroll, we will send you the session link and schedule on WhatsApp and email. Just tap the link at the session time to join.'],
      ['Is this medical advice?', DISC]]),
  })
  await single('freeSessionPage', {
    headline: 'Begin with a free online session', lead: 'A live, friendly online session. Reserve your spot and we will send you the date, time and joining link.',
    bullets: ['Understand your stage', 'Learn simple daily practices', 'Ask your questions live'], formButton: 'Reserve My Free Spot',
    whoHeading: 'Who should join', whoItems: ['Planning a pregnancy', 'Newly pregnant', 'Seeking calm, structured guidance'],
    founderHeading: 'Meet the founder', founderImage: founder,
    founderBody: 'Holistic Pregnancy was founded by Geetha Bafna with a simple belief: every woman deserves to feel seen, heard and cared for, from planning a baby through every step of pregnancy.',
    closingHeading: 'Reserve your free spot', faqHeading: 'Questions, answered simply',
    faqs: await faqs([['Is it free?', 'Yes, the session is free.'], ['Can my partner join?', 'Yes, please bring your partner.']]),
  })
  await single('thankYouPages', {
    freeSession: {heading: "You're in. We've saved your spot.", body: 'We have your details. Our team will be in touch shortly with the date and joining link, and a confirmation is on its way to your email.', whatsappLabel: 'Message us on WhatsApp'},
    enrol: {heading: 'Thank you. We have your enrolment request.', body: 'Our team will call you to confirm your seat and share the payment details. A confirmation is on its way to your email.', whatsappLabel: 'Message us on WhatsApp'},
    contact: {heading: "Thank you. We'll call you back soon.", body: 'We have your message and a confirmation is on its way to your email.', whatsappLabel: 'Message us on WhatsApp'},
  })

  // ---------- Legal pages (DRAFT: client must review; markers show what only the client can supply) ----------
  const legal = (slug: string, title: string, body: string) => once('legalPage', 'slug==$slug', {slug}, {slug, title, body: pt(body), lastUpdated: '2026-10-03', status: 'draft'})
  await legal('privacy', 'Privacy Policy', `
DRAFT: for the client to review before launch. Items marked [CLIENT TO CONFIRM] must be completed by the client.
## Who we are
Holistic Pregnancy ([CLIENT TO CONFIRM: legal entity name and registered address]) offers online programs and community support for preconception, pregnancy and postpartum.
## What we collect
When you use a form on this website we collect: your name, phone or WhatsApp number, email address, your stage (planning a pregnancy, currently pregnant, or not sure), the programme you are interested in, and optionally a question and preferred call time. We also record where you came from (for example the link or campaign you clicked) and the time you agreed to this policy.
Your pregnancy stage is sensitive personal information. We collect only what we need and only with your consent.
## Why we collect it
- To contact you about your request, including calling you back and sending you a confirmation email.
- To enrol you in a programme and share session details.
- To understand which of our channels people find us through.
## Who handles your information
We store enquiries in Airtable and send confirmation emails through Resend. These services process your information on our behalf. We do not sell your information.
## How long we keep it
[CLIENT TO CONFIRM: retention period.]
## Your choices
You can ask us to correct or delete your information, or withdraw your consent, at any time by writing to [CLIENT TO CONFIRM: contact email].
## Grievances
[CLIENT TO CONFIRM: name and contact of the person who handles privacy complaints.]
## Cookies
[CLIENT TO CONFIRM: describe any cookies or analytics once chosen.]
`)
  await legal('terms', 'Terms', `
DRAFT: for the client to review before launch. Items marked [CLIENT TO CONFIRM] must be completed by the client.
## About these terms
By using this website or enrolling in a programme you agree to these terms. [CLIENT TO CONFIRM: legal entity name.]
## Educational support only
Our programmes offer educational and wellbeing support. They are not medical advice and do not replace care from your doctor.
## Enrolment and payment
Enrolment is confirmed after our team speaks with you and payment is received offline. [CLIENT TO CONFIRM: payment terms, schedule changes and missed sessions.]
## Using our sessions and materials
Session links, recordings and materials are for your personal use and must not be shared or resold without written permission. [CLIENT TO CONFIRM: recordings policy.]
## Community conduct
We ask everyone to listen with empathy, share thoughtfully and keep personal stories within the community.
## Limits of liability
[CLIENT TO CONFIRM: wording with legal advice, including governing law and jurisdiction.]
## Contact
[CLIENT TO CONFIRM: contact email.]
`)
  await legal('refund', 'Refund Policy', `
DRAFT: for the client to review before launch. The client must decide the refund terms: nothing below is a commitment.
## Refunds
[CLIENT TO CONFIRM: whether refunds are offered, and until when.]
## How to ask for a refund
[CLIENT TO CONFIRM: who to contact and what information to include.]
## Time to process
[CLIENT TO CONFIRM: how long a refund takes, and to which account.]
## Programme changes or cancellation by us
[CLIENT TO CONFIRM: what happens if a session or programme is rescheduled or cancelled.]
`)
  await legal('medical-disclaimer', 'Medical Disclaimer', `
DRAFT: for the client to review before launch.
## Not medical advice
Holistic Pregnancy provides educational and wellbeing support. Nothing on this website or in our sessions is medical advice, diagnosis or treatment.
## Work alongside your doctor
Our programmes work alongside, not instead of, the care of your doctor or other qualified health professional. Always speak with your doctor before starting new practices, especially if your pregnancy is high-risk or you have a medical condition.
## In an emergency
If you have a medical emergency or are worried about your health or your baby's, contact your doctor or local emergency services straight away.
`)

  // ---------- Blog (dummy, staging only) ----------
  const authorId = await once('author', 'name==$n', {n: 'Geetha Bafna'}, {name: 'Geetha Bafna', role: 'Founder', photo: founder, bio: 'Founder of Holistic Pregnancy.'})
  const cat = (title: string) => once('category', 'title==$t', {t: title}, {title, slug: {_type: 'slug', current: title.toLowerCase().replace(/\W+/g, '-')}})
  const [cWell, cPre] = await Promise.all([cat('Pregnancy wellness'), cat('Preconception')])
  const postDoc = (slug: string, title: string, excerpt: string, c: string, cover: any) => once('post', 'slug.current==$slug', {slug}, {
    title, slug: {_type: 'slug', current: slug}, publishedAt: '2026-10-01T09:00:00Z', author: {_type: 'reference', _ref: authorId},
    categories: [ref(c)], excerpt, coverImage: cover, isPlaceholder: true,
    body: pt(`DUMMY POST. This is placeholder text so the blog layout can be reviewed. It is never published on the live site.\n## A sample heading\nReal articles written by the client will appear here once the blog is switched on in Site settings.\n- A sample bullet\n- Another sample bullet`)})
  await postDoc('dummy-gentle-habits-for-a-calmer-pregnancy', 'Gentle habits for a calmer pregnancy (dummy)', 'Placeholder article used to review the blog layout.', cWell, i2)
  await postDoc('dummy-preparing-your-mind-and-body-before-conception', 'Preparing your mind and body before conception (dummy)', 'Placeholder article used to review the blog layout.', cPre, i1)
  await postDoc('dummy-why-partners-matter-in-pregnancy', 'Why partners matter in pregnancy (dummy)', 'Placeholder article used to review the blog layout.', cWell, i3)

  // ---------- Testimonials (examples, staging only) ----------
  for (const n of ['Example One', 'Example Two', 'Example Three'])
    await once('testimonial', 'name==$n', {n}, {name: n, quote: 'EXAMPLE ONLY. Real testimonials from participants will replace this text.', stage: 'Example', isPlaceholder: true})

  console.log(`Seed finished. created=${created} kept(existing)=${kept}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
