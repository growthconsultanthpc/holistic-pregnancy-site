# CLAUDE.md

Read `groundrules.md` first, every session, then `docs/status_quo.md`. Docs live in `docs/`; `tasks.md` and `bugs.md` stay at root. `reference/` is the client's untouched originals: never edit.

## What this is
Static marketing + lead-gen site for Holistic Pregnancy (`holisticpregnancycourse.com`). First instance of a reusable wellness/course template. See `docs/idea.md`, `docs/PRD.md`. Design source of truth: `reference/index.html` → `docs/design_specification.md`. Design is final; no redesign.

## Stack
Astro (static output) · Tailwind driven by tokens · Sanity (free plan, dummy ID until handover) · build-time fetch · PHP lead endpoint on Hostinger → Airtable + Resend · GitHub Actions deploy.

## Locked decisions (brief §3, amended by the grill session: `docs/decision_log.md`)
| Decision | Choice |
|---|---|
| Framework | Astro, static |
| Styling | Tailwind from design tokens |
| CMS | Sanity free plan; Studio on `*.sanity.studio`; build-time fetch; dummy ID → handed to client |
| Hosting | Hostinger shared, **client's account** (static + PHP) |
| Deploy | GitHub (dummy ID → transferred) → Actions → Hostinger FTP/SSH |
| Content updates | Sanity webhook → `repository_dispatch` → rebuild; nightly rebuild |
| Lead forms | Own on-site forms → PHP → **Airtable** (client-owned) + **Resend** confirmation |
| Free call | **Calendly** URL from Sanity (placeholder `https://calendly.com/anand-arora/meeting`) |
| WhatsApp | `wa.me` link only; number from Sanity |
| Payments | **None.** Offline; team marks payment status in Airtable |
| Programmes | Four (Preconception, 21 Days of Dincharya, Power of 11, Holistic Pathshala) |
| Blog | Built, Sanity toggle **OFF by default**; invisible everywhere when off |
| Legal | Draft text in Sanity; production build fails while any page is Draft |
| Testimonials | Hidden under 3 published; no fake ones on production |
| Motion | No preloader; CSS + ~1 KB observer; kill any effect that breaks Lighthouse 90 / LCP 2.5s |

**Do not quietly deviate.** If one proves wrong, say so and ask.

## Planned structure (nothing built yet)
```
reference/              client originals, read-only
docs/                   idea, PRD, design spec, status_quo
src/
  tokens/               tokens.css (+ Tailwind theme): ALL brand values
  components/ui/        Button, Chip, Card, IconTile… (generic)
  components/sections/  Hero, ProgramCards, Pillars, Steps, Founder,
                        Testimonials, LeadForm, FAQ, Footer (generic, prop-driven)
  layouts/  pages/      routes mirror PRD §4
  lib/                  sanity client + queries, seo helpers, utm capture
  client/               CLIENT-ONLY: brand config, copy defaults, fixtures
studio/                 Sanity Studio + generic schemas
api/                    PHP: submit-lead.php, adapters/airtable.php, mail/resend.php
public/                 images, robots.txt, .htaccess (from reference/.htaccess)
.github/workflows/      deploy.yml (build+upload), rebuild on repository_dispatch + nightly cron
```

## Rules of the template
- No client strings/colours/fonts in components: tokens file + Sanity only.
- Sanity schemas are generic; client copy lives in content, never in schema.
- Layout is locked: editors change fields, not structure. New blocks = code change.
- CRM behind one adapter (Airtable now); secrets only in server env (outside `public_html` or denied by `.htaccess`), never in the repo or browser.
- Content visible without JS; motion off under reduced-motion.
- Consent checkbox on every lead form; collect minimum (pregnancy stage is sensitive).
- `noindex` on staging; remove only at production cutover.

## Workflow
Decisions → PRD + tasks same turn. No work unless in `tasks.md`. Verify by running before claiming. Ship report on every ship (what/how to test/expect). See `groundrules.md`.

## Placeholder rule
Anything marked `isPlaceholder` (dummy blog posts, example testimonials) renders on staging only and is excluded from production builds.
