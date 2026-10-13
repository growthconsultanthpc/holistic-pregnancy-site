// V4 SEO titles + descriptions into Sanity (editable there afterwards). Re-runnable; overwrites only seo.title / seo.description.
import {getCliClient} from 'sanity/cli'
import {readFileSync} from 'node:fs'
import path from 'node:path'
const c = getCliClient({apiVersion: '2025-01-01'})
const seo = JSON.parse(readFileSync(path.resolve(process.cwd(), '../scripts/v4-seo.json'), 'utf8')) as Record<string, {title: string; description: string}>
const DOC: Record<string, string> = {home: 'homePage', about: 'aboutPage', community: 'communityPage', contact: 'contactPage', 'free-session': 'freeSessionPage'}
for (const [r, v] of Object.entries(seo)) {
  const id = DOC[r] ?? (await c.fetch(`*[_type=="program" && slug.current==$r][0]._id`, {r}))
  await c.patch(id).set({'seo.title': v.title, 'seo.description': v.description}).commit()
  console.log('seo', r)
}
await c.patch('siteSettings').set({externalBlogUrl: 'https://geethabafna.com'}).commit()
await c.patch('freeSessionPage').set({lead: 'A live, friendly online session. Reserve your spot and we will send you the date, time and joining link on WhatsApp.'}).commit()
