// Legal pages: Sanity text inside V4's page frame.
import { renderShell } from '../../lib/v4'
import { legalHtml } from '../../lib/v4pages'
import { q, showPlaceholders } from '../../lib/sanity'

export async function getStaticPaths() {
  const legal = await q(`*[_type=="legalPage"]{title, slug, body, lastUpdated, status, seo}`)
  // Launch gate (G24): a production build (placeholders off) refuses to run while any legal page is still a draft.
  const drafts = legal.filter((l: any) => l.status !== 'approved')
  if (!showPlaceholders && drafts.length && process.env.ALLOW_DRAFT_LEGAL !== 'true')
    throw new Error(`LAUNCH GATE: legal page(s) still Draft: ${drafts.map((d: any) => d.slug).join(', ')}. Approve them in Sanity, or set ALLOW_DRAFT_LEGAL=true for a non-live test build.`)
  return legal.map((l: any) => ({ params: { slug: l.slug }, props: { data: l } }))
}
export const GET = ({ props }: any) =>
  renderShell({ id: props.data.slug, path: `/${props.data.slug}/`, title: props.data.seo?.title ?? `${props.data.title} | Holistic Pregnancy`, description: props.data.seo?.description, html: legalHtml(props.data) })
