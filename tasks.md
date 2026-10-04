# Tasks

Legend: `[ ]` todo · `[~]` in progress · `[!]` blocked (needs input, see PRD §11). `G#` = `docs/decision_log.md`. Detail lives in `docs/PRD.md`.

## Setup
- [~] Resend + Sanity accounts exist; dummy Gmail + private GitHub repo + first push pending. Create dedicated dummy Gmail (own recovery+2FA); private GitHub repo; Sanity + Resend accounts (G22)
- [~] Airtable base built; verify field/option names against `docs/airtable_prompt.md`; create scoped token (G13, G23)
- [~] Prettier/ESLint; pin Node (`.nvmrc`)
- [ ] Image pipeline: `<img>` + srcset from `reference/` assets (G10)

## Design system
- [x] Contrast fixes: CTA colour for small coral text (G27) + muted grey (G34)
- [x] UI: Button (with loading state), Chip, IconTile, Card, Tag, Container, Section
- [x] Layout: announcement bar, header + dropdown + mobile nav, footer, sticky mobile CTA
- [x] Motion layer per G28/G29: reveal, hover, FAQ height, image placeholders, reduced-motion
- [x] Icon set (5 SVG symbols)

## Homepage
- [x] Hero (arch scale-in + headline underline), trust bar
- [x] ProgramCards + stage chooser + mobile carousel (4 programmes)
- [x] **How it works** strip (G7)
- [x] Founder section
- [x] Free-session section: pill + LeadForm + session-date logic (G15)
- [x] FAQ accordion
- [x] Testimonials section, hidden under 3 published (G25)
- [~] Visual QA vs `reference/index.html`: 1280 and 390 checked; 768 and 1024, FAQ animation, image placeholders, page fade still to do

## Inner pages
- [x] Programme template + Preconception, Dincharya, Power of 11
- [x] Pathshala variant
- [x] Session plan section in programme template + Sanity `sessionPlan` + dummy plans (staging only, hidden on prod) (G30)
- [x] About, Community, Get in touch (G27)
- [x] Free-session landing page
- [x] Enrol form page `/enroll/<programme>/` (G2/G3); tested end to end
- [x] Three thank-you pages, one template, lotus draw-in, optional WhatsApp button
- [x] Legal template ×4 with draft text + `[CLIENT TO CONFIRM]` markers (G24) + production launch gate
- [x] 404
- [x] Blog index + post, `Article` schema, toggle OFF by default, placeholders staging-only, never empty (G17). Categories shown on cards/posts; no category pages
- [ ] Stories page (Phase 2)

## Sanity
- [x] Locked-layout Studio structure (singletons, no create/delete of fixed pages) built and bundles
- [ ] Deploy Studio to `*.sanity.studio` (`npx sanity deploy` from `studio/`, needs hostname; run by Anand)
- [x] Schemas written and validated (0 errors/warnings): seo, siteSettings, nextSession, program (+sessionPlan), faq, testimonial, legalPage, post/author/category, 6 page singletons (G32)
- [x] Character limits (warnings), required alt text, placeholder flags (post, testimonial, session plan)
- [x] Frontend honours placeholders: staging shows them, production hides them (testimonials, session plan, blog); verified by production-mode builds
- [ ] Build-time fetch layer + typed queries; staging includes placeholders, production excludes
- [x] Seed content from `reference/index.html` copy; dummy blog posts, session plans, example testimonials, draft legal pages (G33)
- [x] Legal Draft/Approved field + production build gate
- [ ] Verify `docs/sanity_inventory.md` matches the Studio before sharing

## Forms / CRM / Email
- [x] `api/submit-lead.php`: origin check, honeypot, rate limit, consent + email required, select validation (verified locally against the live base: validation, dedupe, fallback)
- [x] Airtable adapter (`api/adapters/airtable.php`): dedupe by phone, first-touch attribution, Lead type upgrade (G31). Verified live against the base; field/option names all match
- [~] Resend send verified with test sender. Pending: templates hard-coded, move to Sanity-generated `templates.json`; real sender once client domain is verified
- [~] Failure path: local log + team alert email verified; 800-record alert pending
- [x] UTM / referrer / landing-page capture into hidden fields
- [x] Form UI: loading state, inline success/error, double-submit guard
- [ ] Calendly URL from Sanity on every Book-a-Free-Call and sticky CTA
- [ ] Tests: happy path, duplicate phone, bad select, Airtable-down fallback, missing consent

## SEO
- [x] Per-page title/meta/OG/canonical from Sanity; sitemap (`/sitemap-index.xml`); robots per environment (G36)
- [x] Staging noindex; indexable on launch day only (env flags `PUBLIC_NOINDEX`, `SITE_URL`)
- [x] Schema: Organization (all pages), Course + FAQPage (programmes), FAQPage (contact, free session), Article (posts)
- [ ] Search Console + sitemap submission

## Deploy
- [ ] [!] Hostinger FTP/SSH, domain/DNS access, staging subdomain (D8)
- [ ] GH Actions: build → upload `dist/` + `api/`; concurrency group; nightly rebuild
- [ ] Sanity webhook → `repository_dispatch`
- [ ] `.htaccess` (gzip, cache, security headers) from `reference/.htaccess` into `public/`
- [ ] Resend sender domain DNS records (SPF/DKIM)
- [ ] Production cutover + rollback plan

## QA
- [ ] Delete the ~15 sample rows Airtable's AI created in the base, before launch (not touched by my tests)
- [ ] Lighthouse mobile ≥90 on home, a programme page, free-session; report per phase (G29)
- [ ] Reduced-motion and no-JS check
- [ ] Accessibility pass (axe + keyboard + screen reader)
- [ ] iOS Safari, Android Chrome, Instagram in-app browser
- [ ] Form end-to-end into Airtable + Resend email from staging
- [ ] Content-edit-to-live test via Sanity webhook; session date auto-revert test

## Handover
- [ ] Runbook: repo transfer, Sanity + Resend handover, credentials list (G22)
- [ ] Share `docs/sanity_inventory.md` with client
- [ ] Airtable month-4 upgrade note; larger image masters request
- [ ] 3-month support terms
- [ ] [!] Agreement / deposit / suspension terms (parked by Anand)

## Open input (PRD §11)
- [ ] [!] **AWAITED FROM CLIENT: session plans for all 4 programmes** (dummy meanwhile, staging only, G30)
- [ ] [!] Confirm "21 Days of Dincharya" = 6 sessions + final prices/copy
- [ ] [!] Legal entity name; WhatsApp/phone/email; Calendly final URL
- [ ] [!] Reconfirm slide timeline vs scope

## Done
- [x] SEO basics: sitemap, robots, Organization schema, noindex on utility pages (G36); verified on a production-mode build
- [x] All inner pages built (G35): programmes ×4, About, Community, Get in touch, free-session, enrol ×4, thank-you ×3, legal ×4, 404, blog. Lighthouse mobile (prod): perf 98-100, a11y 100, bp 100 on every page checked
- [x] Homepage built from Sanity: hero, trust bar, programmes + chooser, How it works, founder, testimonials (gated), free-session form, FAQ, footer, sticky mobile CTA; thank-you pages. Lighthouse mobile (prod build): perf 98, a11y 100, best-practices 100, LCP 2.3s, CLS 0 (G34). Form tested end to end (page → Airtable → thank-you)
- [x] Lead endpoint end-to-end test passed (create, dedupe, contact fields, fallback); test rows removed
- [x] Sanity Studio installed in `studio/` (project `ef4m6d01`, dataset `production`); `.env` created
- [x] Astro 7 + Tailwind 4 init, folder skeleton, `.env.example`, `api/config.example.php`, git init (build verified)
- [x] `tokens.css` (light+dark) + Tailwind theme; fonts self-hosted via Fontsource (verified in `dist/`)
- [x] Originals moved to `reference/` (+ unlisted `.htaccess`)
- [x] `groundrules.md` updated for this repo's bug-log numbering
- [x] Session 1 docs + grill session; PRD consolidated; decision log G1–G29
