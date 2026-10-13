// Build guard (G38): every programme name in Sanity must be one the PHP endpoint accepts (and so one the Airtable
// `Programme` options contain). A mismatch would silently send leads to the fallback log, so fail the build instead.
import { readFileSync } from 'node:fs'
import { createClient } from '@sanity/client'
try { process.loadEnvFile('.env') } catch {}
const projectId = process.env.SANITY_PROJECT_ID
if (!projectId) { console.log('check-names: SANITY_PROJECT_ID not set, skipping'); process.exit(0) }
const php = readFileSync('public/api/submit-lead.php', 'utf8')
const map = php.match(/const PROGRAMMES = \[(.*?)\];/s)?.[1] ?? ''
const accepted = [...map.matchAll(/'[^']+'\s*=>\s*'([^']+)'/g)].map((m) => m[1])
const client = createClient({ projectId, dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2025-01-01', useCdn: false, token: process.env.SANITY_READ_TOKEN || undefined })
const titles = await client.fetch('*[_type=="program"].crmLabel')
const bad = titles.filter((t) => !t || !accepted.includes(t))
if (bad.length) {
  console.error(`\ncheck-names FAILED: Sanity programme crmLabel(s) not accepted by public/api/submit-lead.php: ${bad.map((b) => `"${b}"`).join(', ')}\nAccepted: ${accepted.join(' | ')}\nUpdate the PHP map and the Airtable "Programme" options together, then rebuild.\n`)
  process.exit(1)
}
console.log(`check-names: OK (${titles.length} programmes match the PHP list)`)
