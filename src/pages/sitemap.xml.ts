import type { APIRoute } from 'astro'
import { getSite, q, blogOn } from '../lib/sanity'

// V4's sitemap (offer and refer stay out: they are noindex) + the legal pages + the blog when it is on.
const ROUTES = ['', 'preconception/', 'pathshala/', 'dincharya/', 'power-of-11/', 'postpartum/', 'about/', 'sessions/', 'free-session/', 'community/', 'contact/']
export const GET: APIRoute = async ({ site }) => {
  const { settings, postCount } = await getSite()
  const legal: string[] = (await q(`*[_type=="legalPage"].slug`)).map((s: string) => `${s}/`)
  const posts: string[] = blogOn(settings, postCount) ? ['blog/', ...(await q(`*[_type=="post" && isPlaceholder != true].slug.current`)).map((s: string) => `blog/${s}/`)] : []
  const urls = [...ROUTES, ...legal, ...posts].map((p) => `<url><loc>${new URL(p, site).href}</loc></url>`).join('')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } })
}
