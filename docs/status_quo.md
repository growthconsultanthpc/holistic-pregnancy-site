# Status quo — 2026-10-13

**Phase:** planning complete and consolidated. No application code yet. Waiting on Anand's go to start Setup.

## What exists
- `reference/`: client originals (untouched). Docs: `idea.md`, `PRD.md` (consolidated), `decision_log.md` (G1–G29, reasoning), `design_specification.md`, `sanity_inventory.md` (client-shareable), `CLAUDE.md`, `commands.md`, `tasks.md`, `bugs.md`.

## Decided (see PRD)
4 programmes · own forms → PHP → Airtable (client-owned) + Resend confirmation · no payments, offline, manual status · Calendly from Sanity · session date in Sanity (auto-revert) · How it works strip · blog built but OFF · dummy-draft legal pages with launch gate · testimonials gated · no preloader, calm motion with Lighthouse kill rule · client's Hostinger; GitHub/Sanity/Resend under Anand's dummy Gmail, handed over on payment.

**V4 (2026-10-13):** the site is now the client's V4 design, exact, with Sanity-editable content and our lead pipeline (G49-G51). **v3 (2026-10-13):** built on branch `v3-design` (A-E of the agreed table; F parked): offer system with live refresh, refer-a-friend, blog redesign, the client's v3 page copy, Sanity + Airtable updated (Referrals table, 4 new Leads fields). See `decision_log.md` G45-G48. **Waiting on Anand: add 3 keys to the live `hpc-config.php`, merge, rotate exposed keys.**

**v2 revision (2026-10-06):** built on branch `v2-design` (not merged, not deployed). See `decision_log.md` G37-G42. **Waiting on Anand: rename the 3 Airtable `Programme` options, then merge.**

## Works / half-built / broken
Built and verified: Astro skeleton + tokens + fonts; lead endpoint (Airtable dedupe, Resend, fallback); Sanity schemas (validated) + **seeded content (64 docs, idempotent)**. Homepage and **all inner pages built from Sanity** (programmes, About, Community, Get in touch, free-session, enrol, thank-you, legal, 404, blog). SEO basics done (sitemap, robots, Organization/Course/FAQ/Article schema). Code is on GitHub (private, `hariseldon84/holistic-pregnancy-site`). Not built: Studio deploy, Sanity webhook/CI.

## Open (PRD §11)
**Session plans for all four programmes (awaited from client; dummy staging-only meanwhile, G30)** · Hostinger FTP/SSH + domain/DNS access (D8) · confirm "21 Days" = 6 sessions + final copy/prices · legal entity name, WhatsApp/phone/email · reconfirm slide timeline · agreement/deposit/suspension **parked** · larger image masters later.

## Single next action
Deploy pipeline (needs Hostinger FTP/SSH + domain/DNS + the dummy GitHub account), then Search Console after launch.
