import type { APIRoute } from 'astro'

// Staging (PUBLIC_NOINDEX != 'false') blocks all crawlers; production allows them and links the sitemap.
export const GET: APIRoute = ({ site }) => {
  const staging = import.meta.env.PUBLIC_NOINDEX !== 'false'
  const body = staging
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', site).href}\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
