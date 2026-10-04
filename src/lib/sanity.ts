import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

const env = import.meta.env
export const client = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
  token: env.SANITY_READ_TOKEN || undefined,
})
const builder = createImageUrlBuilder(client)

// Placeholder content (dummy posts, example testimonials, dummy session plans) shows on staging only (G17/G25/G30).
export const showPlaceholders = env.PUBLIC_SHOW_PLACEHOLDERS === 'true'

type Img = {asset?: {_ref: string}; alt?: string} | undefined
// Sanity asset ids carry the size: image-<hash>-<w>x<h>-<ext>
const dims = (i: Img) => {
  const m = i?.asset?._ref.match(/-(\d+)x(\d+)-/)
  return m ? {w: +m[1], h: +m[2]} : {w: 0, h: 0}
}
export function pic(i: Img, widths: number[], sizes: string) {
  if (!i?.asset) return null
  const {w, h} = dims(i)
  const ws = widths.filter((x) => !w || x <= w)
  if (!ws.length) ws.push(widths[0])
  const src = (x: number) => builder.image(i as any).width(x).auto('format').quality(80).url()
  return {src: src(ws[ws.length - 1]), srcset: ws.map((x) => `${src(x)} ${x}w`).join(', '), sizes, alt: i.alt ?? '', width: w, height: h}
}

export const q = (groq: string, params: Record<string, unknown> = {}) => client.fetch(groq, params)

const memo = <T,>(fn: () => Promise<T>) => { let p: Promise<T> | undefined; return () => (p ??= fn()) }

export const getSite = memo(() =>
  q(`{
    "postCount": count(*[_type=="post" && (isPlaceholder != true || $ph)]),
    "settings": *[_id=="siteSettings"][0],
    "session": *[_id=="nextSession"][0],
    "programs": *[_type=="program"]|order(order){title, "slug": slug.current, tag, price, meta, cardImage, cardBullets, ctaLabel}
  }`, {ph: showPlaceholders}),
)

// "Wed 14 Oct · 7:00 pm IST", or null once the date has passed or mode is "none" (auto-revert, G15).
export function sessionLabel(s: any, now = new Date()) {
  if (s?.mode !== 'date' || !s.startsAt || new Date(s.startsAt) <= now) return null
  const d = new Date(s.startsAt)
  const date = d.toLocaleDateString('en-IN', {weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata'})
  const time = d.toLocaleTimeString('en-IN', {hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'}).replace(' ', ' ')
  return {text: `${date} · ${time} IST`, startsAt: s.startsAt as string, extra: s.label as string | undefined}
}

export const wa = (settings: any, msg?: string) =>
  `https://wa.me/${settings?.whatsappNumber}${msg || settings?.whatsappMessage ? `?text=${encodeURIComponent(msg ?? settings.whatsappMessage)}` : ''}`

// Local preview of the blog without touching the Sanity toggle: PREVIEW_BLOG=true npm run dev
// The blog is live only if the toggle is ON *and* at least one publishable post exists (never an empty blog).
export const blogOn = (s: any, postCount = 1) => (!!s?.blogEnabled || process.env.PREVIEW_BLOG === 'true') && postCount > 0
export const faqLd = (items: {question: string; answer: string}[] = []) =>
  items.length ? {'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({'@type': 'Question', name: f.question, acceptedAnswer: {'@type': 'Answer', text: f.answer}}))} : null
