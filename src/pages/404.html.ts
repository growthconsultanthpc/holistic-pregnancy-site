import { renderShell } from '../lib/v4'
import { notFoundHtml } from '../lib/v4pages'
import { getSite } from '../lib/sanity'
export const GET = async () => renderShell({ id: 'home', path: '/404/', title: 'Page not found | Holistic Pregnancy', html: notFoundHtml((await getSite()).settings), noindex: true })
