# Tasks

Legend: `[ ]` todo · `[~]` in progress · `[!]` blocked (needs input, see PRD §11). `G#` = `docs/decision_log.md`. Detail lives in `docs/PRD.md`.

## v3 client revision (G43-G44, `docs/v3_scope.md`) — analysis done, nothing built yet
- [!] **Decisions pending** (see v3_scope.md §5 and the table in chat): email tool for session emails; programme naming (Pathshala/Paatshala, Preconception/Pre-Conception); is "session requests" (brief change 4) still wanted; popup/countdown/spots policy; tracking pixels + consent; referral code scheme; where videos appear
- [ ] P1 Re-baseline content to v3 (regenerate programme narratives from `reference/v3_design/rendered/`, new home sections, About founder bio, contact email, nav/footer, FAQs); add a locked `crmLabel` per programme so public renames never break the lead table
- [ ] P2 Sanity schemas: `offer`, `session`, testimonial upgrade (programmes, detail, show/hide, show on home, optional photo/rating), `mantraTrack`, referral + tracking settings, FAQ category (if wanted); retire obsolete fields
- [ ] P3 Live layer (offer window, countdown, session Upcoming/Past without a rebuild; Sanity CORS origin) + rebuild pipeline (Sanity webhook, nightly) — critical path for "editable without a developer"
- [ ] P4 Offer system: struck-through prices (cards, hero, price box, enrol, JSON-LD), `/offer/` page + countdown, bar message, popup card, spots badge (manual, true), offer code recorded in Airtable
- [ ] P5 Sessions: `/sessions/` + per-course block, free-session copy, sign-up form to the second Airtable base, Resend confirmation, client-managed sending of Zoom links
- [ ] P6 Referral: `/refer/`, server-generated unique codes in Airtable, referral-code field on enrol/enquiry forms
- [ ] P7 Post-Partum waitlist page + card (lead type Waitlist)
- [ ] P8 Mantra player (off by default, never autoplays, per-page setting, licence/credit field)
- [ ] P9 Ad tracking (Meta/Google IDs in Sanity) with a consent decision
- [ ] P10 Second Airtable base: build prompts, token, fields, interfaces for the team
- [ ] P11 Admin handover: Studio deployed, 2 admin logins, how-to recordings, the brief's test checklist (rewritten for no checkout), perf budget re-check (popup, countdown, player, pixels)
- [ ] Merge/deploy of `v2-design` is now superseded by v3: decide whether to merge v2 first (it is verified) or fold into v3

## v2 design update (G37-G42) — built on branch `v2-design`, NOT merged or deployed
- [x] Programme pages rebuilt: generic components + `src/client/programs/*.ts` narrative (generated from the client's HTML; text verified identical)
- [x] `program` schema rebuilt; Sanity migrated by `studio/scripts/migrate-v2.ts` (dataset backup taken first; re-run is a no-op)
- [x] Home: stats strip, ★ signature card, new chooser labels/order, rewritten FAQs
- [x] About "Our larger purpose"; Contact FAQ copy
- [x] Enrol: best-time-to-call, next steps, personalised thank-you; `{callback}` setting
- [x] Rotating announcement bar (up to 5 messages, live date first); dark in both themes (G39, G42)
- [x] Programme names + prices in Sanity and PHP map; `scripts/check-names.mjs` build guard (G38)
- [x] Session plan retired (G40)
- [x] Perf fix: box-shadow glow → opacity/transform ring; content-visibility; image quality 72 (G42)
- [!] **Anand: rename 3 Airtable `Programme` options in the UI** (Pre-Conception Program, 21 Days of Dinacharya, Holistic Paatshala), then test one real enrol lead per programme
- [ ] Merge `v2-design` → `main` (Hostinger auto-deploys main) after the Airtable rename
- [ ] Decide: home LCP 2.55 s vs 2.5 s budget (replace Caveat signature font with italic Playfair ≈ -0.2 s, or accept)
- [ ] Ask client to confirm: stats figures are real; payee entity name for footer/legal; "within one working day" is achievable
- [ ] Update `docs/design_specification.md` motion section for v2 (done in decision log; spec text pending)
- [ ] 768/1024 widths and phone check of the new programme pages on real devices

## Setup
- [~] Resend + Sanity accounts exist; private repo created on `hariseldon84/holistic-pregnancy-site` and first push done (move to the client's GitHub later, G22); dummy Gmail still pending. Create dedicated dummy Gmail (own recovery+2FA); private GitHub repo; Sanity + Resend accounts (G22)
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
- [x] ~~Session plan section~~ retired in v2 (G40)
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
- [x] Session plans: no longer needed, the v2 pages replace them (G40)
- [x] "21 Days of Dinacharya" = 21-day guided journey; prices and copy final in v2
- [ ] [!] Legal entity name; WhatsApp/phone/email; Calendly final URL
- [ ] [!] Reconfirm slide timeline vs scope

## Done
- [x] Private GitHub repo `hariseldon84/holistic-pregnancy-site` created; initial commit pushed (86 files, secrets scan clean, commit identity = GitHub noreply)
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
