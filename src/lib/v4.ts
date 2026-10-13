// V4 pages (the client's final design): src/v4/<route>.html are her pages, patched by scripts/prepare-v4.py.
// Here the @@TOKENS@@ are filled from Sanity at build time, so every editable thing is editable in Studio.
import { getSite, q, showPlaceholders, blogOn, fill } from './sanity'
import { isLive } from './offer'

const templates = import.meta.glob('../v4/*.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const env = import.meta.env
const SITE = (env.SITE || 'https://holisticpregnancycourse.com').replace(/\/$/, '')
const NOINDEX = env.PUBLIC_NOINDEX !== 'false'
const LEAD = env.PUBLIC_LEAD_ENDPOINT || '/api/submit-lead.php'
const REF = env.PUBLIC_REFERRAL_ENDPOINT || LEAD.replace('submit-lead.php', 'create-referral.php')

const esc = (t = '') => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
// JSON that is safe inside <script>
const js = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, '')

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// "Saturday, 18 Oct · 7:00 PM" in India time, or '' (V4 wording)
function whenIST(iso?: string) {
  if (!iso) return ''
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600e3) // read the UTC fields as IST
  const h = d.getUTCHours()
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]} · ${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const getData = (() => {
  let p: Promise<any> | undefined
  return () => (p ??= (async () => {
    const site = await getSite()
    const ph = { ph: showPlaceholders }
    const [testimonials, sessions, mantras, home, contact, free] = await Promise.all([
      q(`*[_type=="testimonial" && visible != false && (isPlaceholder != true || $ph)]|order(_createdAt){quote, name, stage, programmes}`, ph),
      q(`*[_type=="liveSession" && date >= $today]|order(date asc){title, date, time, type, desc, price, repeat}`, { today: new Date().toISOString().slice(0, 10) }),
      q(`*[_type=="mantraTrack"]|order(order asc){title, why, sanskrit, roman, meaning, audioUrl, youtubeId, isShort, credit}`),
      q(`*[_id=="homePage"][0]{freeHeading, freeBullets, freeButton, seo, "faqs": faqs[]->{question, answer}}`),
      q(`*[_id=="contactPage"][0]{seo, "faqs": faqs[]->{question, answer}}`),
      q(`*[_id=="freeSessionPage"][0]{lead, seo, "faqs": faqs[]->{question, answer}}`),
    ])
    const [about, community] = await Promise.all([q(`*[_id=="aboutPage"][0]{seo}`), q(`*[_id=="communityPage"][0]{seo}`)])
    return { ...site, testimonials, sessions, mantras, pages: { home, contact, 'free-session': free, about, community } }
  })())
})()

function configs(d: any) {
  const s = d.settings, o = d.offer ?? {}, pg = d.pages
  const live = d.session && d.session.mode === 'date' && d.session.startsAt && new Date(d.session.startsAt) > new Date()
  const hl = o.pageTitleHighlight && o.pageTitle?.includes(o.pageTitleHighlight)
  const headline = esc(o.pageTitle ?? '').replace(/^A /, 'A&nbsp;').replace(esc(o.pageTitleHighlight ?? '\u0000'), hl ? `<em>${esc(o.pageTitleHighlight)}</em>` : '')
  return {
    CAMPAIGN: { on: !!o.enabled, name: 'Limited-Time Offer', code: o.code ?? '', starts: o.startsAt ?? '', ends: o.endsAt ?? '', headline, subhead: o.barText ?? '', sub: o.pageIntro ?? '',
      spotsTotal: o.spotsTotal ?? 0, spotsLeft: o.spotsLeft ?? 0, discount: { type: 'percent', value: o.discountPercent ?? 0 }, ticker: o.barText ?? '',
      popupText: o.popupText ?? o.barText ?? '', popup: o.popup !== false, popupDelay: o.popupDelay ?? 20 },
    TESTIMONIALS: { on: d.testimonials.length > 0, samples: false, list: d.testimonials.map((t: any) => ({ name: t.name, detail: t.stage ?? '', program: (t.programmes ?? []).join(','), text: t.quote })) },
    MUSIC: { on: !!s.musicOn && d.mantras.length > 0, label: s.musicLabel ?? 'Garbh Sanskar mantras', tracks: d.mantras.map((m: any) => ({ title: m.title, why: m.why ?? '', sa: m.sanskrit ?? '', ro: m.roman ?? '', mean: m.meaning ?? '', src: m.audioUrl ?? '', yt: m.youtubeId ?? '', short: !!m.isShort, credit: m.credit ?? '' })) },
    SESSIONS: { on: true, samples: false, list: d.sessions.map((x: any) => ({ date: x.date, time: x.time ?? '', type: x.type ?? '', title: x.title, desc: x.desc ?? '', price: x.price ?? 'Free', repeat: x.repeat ?? '' })) },
    FREE_SESSION: { title: pg.home?.freeHeading ?? 'Begin with a free online session', topic: live ? d.session.topic ?? '' : '', when: live ? whenIST(d.session.startsAt) : '',
      intro: pg['free-session']?.lead ?? '', points: pg.home?.freeBullets ?? [], button: pg.home?.freeButton ?? 'Reserve My Free Spot',
      ticker: (s.barMessages ?? []).find((m: any) => m.linkUrl === '/free-session/')?.text ?? 'Free online session for couples planning or expecting a baby' },
    TRACK: { metaPixelId: s.metaPixelId ?? '', googleTagId: s.googleTagId ?? '' },
    REFERRAL: { on: s.referralOn !== false, reward: s.referralReward ?? 1000, gift: s.referralGift ?? 'a complimentary meditation session with us', siteUrl: SITE + '/' },
    PAY: { whatsapp: s.whatsappNumber, upiId: '', payeeName: '', bankAccountName: '', bankAccountNumber: '', bankIfsc: '', bankName: '' },
    PROGS: Object.fromEntries(d.programs.map((p: any) => [p.slug, { n: p.title, p: p.price, f: p.priceBullets ?? [] }])),
  }
}

// Runs in the browser, before V4's own scripts: lead + referral endpoints, live session/spots readers.
const clientHead = (d: any) => `<script>
window.HPC_LEAD_ENDPOINT=${js(LEAD)};window.HPC_REF_ENDPOINT=${js(REF)};window.HPC_REF_MSG=${js(d.settings.referralMessage ?? '')};
window.HPC_SESSION_URL=${js(`https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2025-01-01/data/query/${env.SANITY_DATASET || 'production'}?query=` + encodeURIComponent('*[_id=="nextSession"][0]{mode,startsAt,topic,intro}'))};
window.HPC_OFFER_URL=${js(`https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2025-01-01/data/query/${env.SANITY_DATASET || 'production'}?query=` + encodeURIComponent('*[_id=="offer"][0]{spotsLeft}'))};
/* live session (Sanity) -> the {topic,date,time,intro} shape V4 reads */
window.hpcSession=function(j){var s=j&&j.result;if(!s||s.mode!=='date'||!s.startsAt||!s.topic)return null;var p=new Date(new Date(s.startsAt).getTime()+19800000),z=function(n){return(n<10?'0':'')+n};
return{topic:s.topic,intro:s.intro||'',date:p.getUTCFullYear()+'-'+z(p.getUTCMonth()+1)+'-'+z(p.getUTCDate()),time:z(p.getUTCHours())+':'+z(p.getUTCMinutes())}};
/* send a lead to our endpoint (Airtable + confirmation email) */
window.hpcSend=function(o){
 var STAGE={'Need guidance in deciding':'Not sure yet'},TIME=function(t){t=t||'';return/^Morning/.test(t)?'Morning':/^Afternoon/.test(t)?'Afternoon':/^Evening/.test(t)?'Evening':''};
 var a={};try{a=JSON.parse(sessionStorage.getItem('hpc_attr')||'{}')}catch(e){}
 if(!a.landing_page){var u=new URLSearchParams(location.search);a={utm_source:u.get('utm_source')||(document.referrer?new URL(document.referrer).hostname:''),utm_medium:u.get('utm_medium')||'',utm_campaign:u.get('utm_campaign')||'',landing_page:location.pathname};try{sessionStorage.setItem('hpc_attr',JSON.stringify(a))}catch(e){}}
 var C=window.CAMPAIGN||{},now=Date.now(),act=C.on&&(!C.ends||new Date(C.ends).getTime()>now)&&(!C.starts||new Date(C.starts).getTime()<=now);
 var ref=o.ref_code||'';if(!ref){try{ref=sessionStorage.getItem('hp_ref')||''}catch(e){}}
 var fd=new FormData();
 var put=function(k,v){if(v!==undefined&&v!==null&&String(v)!=='')fd.append(k,v)};
 put('type',o.type);put('programme',o.programme);put('name',o.name);put('phone',o.phone);put('email',o.email);put('stage',STAGE[o.stage]||o.stage);put('question',o.question);put('call_time',TIME(o.call_time));
 put('consent','1');put('ref_code',ref);put('offer_code',act?C.code:'');put('price_quoted',o.price||'');
 for(var k in a)put(k,a[k]);fd.append('website','');
 return fetch(window.HPC_LEAD_ENDPOINT,{method:'POST',body:fd}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){
  if(r.ok&&j.ok)return{ok:true};
  return{ok:false,msg:j.fields?'Please check your '+j.fields.join(', ')+'.':r.status===429?'Too many tries. Please wait a few minutes.':'Something went wrong. Please try again, or message us on WhatsApp.'}})}).catch(function(){return{ok:false,msg:'We could not reach the server. Please try again, or message us on WhatsApp.'}})};
</script>`

// Our additions to V4's CSS. Placed at the END of the page so they win over V4's own rules.
const extraCss = `<style>.cp-prem.note{display:block;margin-left:0;margin-right:0;padding:18px 24px}.cp-prem.note blockquote{margin:0;font:500 italic 19px/1.45 'Playfair Display',serif;color:#12264a}.cp-prem.note figcaption{margin-top:8px;font-size:12.5px;font-weight:600;letter-spacing:.06em;color:#636d7d}.cp-prem.note figcaption::before{content:"— "}
.lg-meta,.bl-meta{color:var(--muted);font-size:14px}.legal{max-width:760px;margin:0 auto}.legal h1{font-size:clamp(30px,4.5vw,42px);margin-bottom:8px}
.richtext h2{font-size:24px;margin:28px 0 8px}.richtext h3{font-size:19px;margin:22px 0 6px}.richtext p{margin:0 0 14px}.richtext ul,.richtext ol{margin:0 0 14px;padding-left:22px}.richtext a{color:var(--cta);text-decoration:underline}.richtext img{border-radius:16px;margin:18px 0;max-width:100%;height:auto}
.draftflag{background:var(--pink);border-radius:10px;padding:10px 14px;font-size:14px;color:var(--ink);margin:14px 0}
.posts{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.post{background:var(--card);border:1px solid var(--line);border-radius:24px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:box-shadow .3s,transform .3s}.post[hidden]{display:none}
.post .im{aspect-ratio:16/9;width:100%;object-fit:cover}.post .bd{padding:18px}.post h2{font-size:20px;margin:6px 0 8px}.post p{margin:0;color:var(--muted);font-size:14.5px}.post small{color:var(--muted);font-size:12.5px}
.posts.two{grid-template-columns:1fr 1fr;max-width:820px;margin:0 auto}
.bl-show{display:grid;grid-template-columns:1.1fr 1fr;background:var(--card);border:1px solid var(--line);border-radius:24px;overflow:hidden;margin-bottom:26px;text-decoration:none;color:inherit}.bl-show img{width:100%;height:100%;min-height:240px;object-fit:cover}
.bl-show .bd{padding:30px 32px;display:flex;flex-direction:column;justify-content:center;gap:8px}.bl-show h2{font-size:clamp(24px,3vw,32px);margin:0}.bl-show p{margin:0;color:var(--muted)}.bl-show small{color:var(--muted);font-size:12.5px}.bl-more{margin-top:6px;font-weight:700;color:var(--cta)}
.chooser+.posts{margin-top:18px}.bl-art{max-width:760px}.bl-cover{width:100%;height:auto;border-radius:24px;margin:6px 0 26px}.bl-body{font-size:17.5px;line-height:1.75;color:var(--text)}
.bl-body>p:first-of-type::first-letter{font:600 56px/.9 'Playfair Display',serif;float:left;margin:6px 10px 0 0;color:var(--cta)}
.bl-body .pull{margin:30px 0;padding:4px 0 4px 22px;border-left:3px solid var(--coral);font:500 italic 24px/1.4 'Playfair Display',serif;color:var(--ink)}.bl-body .pull p{margin:0}.bl-body .pull cite{display:block;margin-top:10px;font:600 13px Montserrat,sans-serif;font-style:normal;letter-spacing:.06em;color:var(--muted)}
.bl-body .callout{margin:26px 0;padding:18px 22px;background:var(--soft);border-radius:16px}.bl-body .callout h3{margin:0 0 6px;font-size:18px}.bl-body .callout p{margin:0;font-size:16px}
.bl-cta{margin:40px 0 6px;padding:28px;text-align:center;background:var(--blush);border:1px solid var(--line);border-radius:24px}.bl-cta h3{margin:0 0 6px}.bl-cta p{margin:0 0 14px;color:var(--muted)}
/* contrast (WCAG AA): a hair darker than V4 for small text */:root{--muted:#636d7d}.cp-off{color:#3a5942!important}.cc-pill,.cp-pill{background:var(--cta)!important}.sx-k,.pc-trust b,.gs-goal{color:var(--cta)!important}
/* hero photo is an <img> (fast LCP) */.arch.im10{background-image:none;overflow:hidden}.arch.im10>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 32%;border-radius:inherit}
/* perf: below-the-fold sections are not rendered (so their background images are not fetched) until near the screen */.pg>section,.pg>div:not(.h-hero):not(.hero2),#faq,#free,#about{content-visibility:auto;contain-intrinsic-size:auto 700px}
@media(max-width:1020px){.posts{grid-template-columns:1fr 1fr}}@media(max-width:860px){.bl-show{grid-template-columns:1fr}.bl-show .bd{padding:22px}.posts.two,.posts{grid-template-columns:1fr}.bl-body{font-size:16.5px}}</style>`

const fontCss = `<style>@font-face{font-family:'Playfair Display';font-style:normal;font-weight:400 900;font-display:swap;src:url(/fonts/playfair-display-latin-wght-normal.woff2) format('woff2')}
@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400 900;font-display:swap;src:url(/fonts/playfair-display-latin-wght-italic.woff2) format('woff2')}
@font-face{font-family:Montserrat;font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/montserrat-latin-wght-normal.woff2) format('woff2')}
@font-face{font-family:Caveat;font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/caveat-latin-500-normal.woff2) format('woff2')}
</style>
<link rel="preload" href="/fonts/playfair-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/playfair-display-latin-wght-italic.woff2" as="font" type="font/woff2" crossorigin>`

// answers may use **bold** and blank lines (Studio FAQ text)
const rich = (t: string) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')
const plain = (t: string) => t.replace(/\*\*/g, '')
const faqHtml = (list: any[], callback: string) =>
  list.length ? `<div class="faq">${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.question)}</summary><p>${rich(fill(f.answer, { callback }))}</p></details>`).join('')}</div>` : ''
const faqLd = (list: any[], callback: string) =>
  list.length ? `<script type="application/ld+json">${js({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: plain(fill(f.answer, { callback })) } })) })}</script>` : ''

// The founder's note replaces the offer box when the offer is off (it is added after V4's script has decided there is no offer box).
const endBody = (d: any) => {
  const o = d.offer
  if (!o?.blurb) return extraCss
  return extraCss + `<script>(function(){var C=window.CAMPAIGN||{},now=Date.now();if(C.on&&(!C.ends||new Date(C.ends).getTime()>now))return;var c=document.querySelector('.h-hero .cta');if(!c||document.querySelector('.h-hero .cp-prem'))return;
c.insertAdjacentHTML('afterend','<figure class="cp-prem note"><blockquote><em>'+${js(esc(o.blurb))}+'</em></blockquote>'+${js(o.blurbBy ? `<figcaption>${esc(o.blurbBy)}</figcaption>` : '')}+'</figure>')})()</script>`
}

type Shell = { id: string; html: string; title: string; description?: string; path: string; noindex?: boolean }

// Pages that are not in V4 (legal, blog, 404) use V4's own header, bar, footer, styles and scripts: the home template with <main> swapped.
export async function renderShell(x: Shell) {
  return build('', x)
}
export const renderV4 = (route: string) => build(route)

async function build(route: string, shell?: Shell) {
  const d = await getData()
  let raw = templates[`../v4/${route || 'home'}.html`]
  if (!raw) throw new Error(`no V4 template for "${route}"`)
  if (shell) {
    // keep V4's other page containers (checkout, refer, offer...) so its scripts find what they expect; the home block stays hidden
    const a = raw.indexOf('<div class="pg on" id="p-home">'), b = raw.indexOf('<div class="pg" id="p-preconception">')
    const mine = shell.id === 'home' ? `<div class="pg on" id="p-home">${shell.html}</div>` : `<div class="pg on" id="p-${shell.id}">${shell.html}</div>` + raw.slice(a, b).replace('class="pg on" id="p-home"', 'class="pg" id="p-home"')
    raw = raw.slice(0, a) + mine + raw.slice(b)
    raw = raw.replace(/<title>[^<]*<\/title>/, `<title>${esc(shell.title)}</title>`).replace(/(rel="canonical" href=")[^"]*/, `$1https://holisticpregnancycourse.com${shell.path}`)
      .replace(/(property="og:url" content=")[^"]*/, `$1https://holisticpregnancycourse.com${shell.path}`)
      .replace(/(property="og:title" content=")[^"]*/, `$1${esc(shell.title)}`).replace(/(name="twitter:title" content=")[^"]*/, `$1${esc(shell.title)}`)
    if (shell.description) raw = raw.replace(/(name="description" content=")[^"]*/, `$1${esc(shell.description)}`).replace(/(property="og:description" content=")[^"]*/, `$1${esc(shell.description)}`).replace(/(name="twitter:description" content=")[^"]*/, `$1${esc(shell.description)}`)
    raw = raw.replace(/@@ROBOTS:[^@]*@@/, shell.noindex ? '@@ROBOTS:noindex, follow@@' : '@@ROBOTS:index, follow@@')
  }
  const s = d.settings, cb = s.callbackPromise ?? 'within one working day'
  const prog = d.programs.find((p: any) => p.slug === route)
  const faqs = shell ? [] : prog ? prog.faqs ?? [] : route === '' ? d.pages.home?.faqs ?? [] : d.pages[route]?.faqs ?? []
  const seo = shell ? undefined : prog?.seo ?? d.pages[route || 'home']?.seo
  const cfg = configs(d)
  let h = raw
  for (const [k, v] of Object.entries(cfg)) h = h.replace(`@@${k}@@`, () => js(v))
  h = h
    .replace('@@FAQ@@', () => faqHtml(faqs, cb))
    .replace('@@FAQLD@@', () => faqLd(faqs, cb))
    .replace('@@BLOGLINK@@', () => (blogOn(s, d.postCount) ? '<a href="/blog/">Blog</a>' : s.externalBlogUrl ? `<a href="${esc(s.externalBlogUrl)}" target="_blank" rel="noopener">Blog</a>` : ''))
    .replace(/@@ROBOTS:([^@]*)@@/, (_, r) => `<meta name="robots" content="${NOINDEX ? 'noindex, nofollow' : r}">`)
    .replace('@@FONTS@@', () => fontCss + clientHead(d))
    .replace('@@ENDBODY@@', () => endBody(d))
    .replaceAll('https://holisticpregnancycourse.com', SITE)
    .replaceAll('919880905511', s.whatsappNumber ?? '919880905511')
    .replaceAll('+91 98809 05511', s.phone ?? '+91 98809 05511')
    .replaceAll('geethabafnadigital@gmail.com', s.email ?? 'geethabafnadigital@gmail.com')
  // page title / description from Sanity when the editor has set them (seeded from V4's own)
  if (seo?.title) h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`).replace(/(property="og:title" content=")[^"]*/, `$1${esc(seo.title)}`).replace(/(name="twitter:title" content=")[^"]*/, `$1${esc(seo.title)}`)
  if (seo?.description) h = h.replace(/(name="description" content=")[^"]*/, `$1${esc(seo.description)}`).replace(/(property="og:description" content=")[^"]*/, `$1${esc(seo.description)}`).replace(/(name="twitter:description" content=")[^"]*/, `$1${esc(seo.description)}`)
  if (/@@[A-Z_]+/.test(h)) throw new Error(`unfilled token left on "${route}": ${h.match(/@@[A-Z_:]+/)![0]}`)
  return new Response(h, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
