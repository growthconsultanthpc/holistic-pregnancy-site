# PRD — Holistic Pregnancy Course website

Status: **consolidated 2026-10-03 after the grill session.** Reasoning for every decision: `docs/decision_log.md` (`G#`). Source: kickoff brief + `reference/index.html` + grill session. Where the brief and the grill session differ, **the grill session wins**. The client's design is final except for the changes listed in §9, which need the client's sign-off.

> **v2 revision (2026-10-06):** the client sent a revised design (`reference/v2_design/`). Programmes are renamed (Pre-Conception Program, Holistic Paatshala, 21 Days of Dinacharya, Power of 11), repriced, and the programme pages are long-form sales pages. Session plans are retired. See `decision_log.md` G37-G42 for everything that changed and why.

## 1. Product and audience
See `idea.md`. Couples and women planning, expecting or early postpartum; mostly India, mostly mobile, arriving from Instagram and WhatsApp. Mobile-first. Goal: build trust, explain **four programmes**, capture leads (free session, enrol, contact, free call via Calendly). **No online payment.**

## 2. Stack and ownership (G19–G22)
| Piece | Choice | Owner now → on payment |
|---|---|---|
| Framework | Astro, static output | repo: Anand's dummy ID → **transfer to client** |
| Styling | Tailwind driven by design tokens | — |
| CMS | Sanity free plan, Studio on `*.sanity.studio`, build-time fetch | dummy ID → handed to client |
| Hosting | Hostinger shared, **client's account** (static + PHP) | client |
| Deploy | GitHub → Actions → Hostinger FTP/SSH | retarget secrets only if hosting moves |
| Content updates | Sanity publish webhook → `repository_dispatch` → rebuild; nightly rebuild too | — |
| Lead endpoint | PHP on Hostinger: validate → Airtable (adapter) → Resend confirmation | — |
| CRM | **Airtable**, free to start, built for the client, **client-owned from day one** (G13) | client |
| Email | **Resend** free (3,000/mo, 100/day), sender on client domain once DNS access (G14) | dummy ID → handed to client |
| Free call | Calendly URL from Sanity; placeholder `https://calendly.com/anand-arora/meeting` | client |
| WhatsApp | `wa.me` link only; number from Sanity; no API | — |
| Payments | **None.** Collected offline; team marks status in Airtable (G3) | — |
| Blog | Sanity-driven, **off by default** (G17) | — |
| Legal | Draft text in Sanity + launch gate (G24) | client approves |

Dummy ID = one dedicated Gmail with its own recovery + 2FA, so handover is a password/recovery change. Agreement/deposit/suspension terms are **parked** (G22). No hidden kill switch; leads are never held hostage.

## 3. Scope
**In:** site from the design; pages in §4; Sanity schemas + Studio with locked layouts; four lead flows; Airtable base; Resend confirmations; UTM capture; SEO basics (titles/meta in Sanity, headings, alt text, clean URLs, sitemap, robots, OG, Organization/FAQPage/Course/Article schema, Search Console); performance (WebP, responsive sizes, lazy loading, Lighthouse 90+ mobile); motion (§8); CI/CD, staging, cutover; handover doc + Sanity inventory for the client.
**Out (chargeable):** new design/sections/layout after sign-off; payment gateways, WhatsApp API, webinar automation; ongoing SEO/content/backlinks; writing legal content; blog writing. **Support:** 3 months post-launch, minor Sanity help and breakage fixes only.

## 4. Pages
| Route | Notes | Priority |
|---|---|---|
| `/` | hero, trust bar, programmes + stage chooser + **How it works strip**, founder, free session (+date pill), FAQ | MVP |
| `/preconception/`, `/dincharya/`, `/power-of-11/` | shared programme template | MVP |
| `/pathshala/` | variant layout kept (G27) | MVP |
| `/about/` | story, approach, promise | MVP |
| `/community/` | WhatsApp join link from Sanity | MVP |
| `/contact/` ("Get in touch") | lead form + WhatsApp/phone/email + Calendly | MVP |
| `/free-session/` | landing mode: nav and top bar hidden | MVP |
| `/enroll/<programme>/` | on-site enrol form, programme pre-filled (replaces checkout, G2/G3) | MVP |
| `/free-session/thank-you/`, `/enroll/thank-you/`, `/contact/thank-you/` | one template; on-screen confirmation, optional WhatsApp button, lotus draw-in | MVP |
| `/privacy/`, `/terms/`, `/refund/`, `/medical-disclaimer/` | one template, Sanity rich text, Draft/Approved gate | MVP |
| `/404` | on-brand | MVP |
| `/blog/`, `/blog/<slug>/` | **not built into the site while toggle is OFF** (no routes, nav, footer, sitemap) | MVP, off |
| Stories page | Phase 2 | later |

## 5. Functional requirements
**Forms (all four):** Name, Phone/WhatsApp, **Email (required)**, Stage, consent checkbox linking Privacy Policy (G16). Contact adds optional question + preferred call time. Enrol adds hidden programme. Hidden: UTM source/medium/campaign, referrer, landing page, honeypot. No auto-redirect to WhatsApp.
**Submit flow:** client validates → button shows loading state, disabled → PHP validates (origin check, honeypot, rate limit, select values against allowed lists) → **dedupe by phone** (update existing record, log repeat in notes) → write Airtable → send Resend email (template per form type, text in Sanity) → set "confirmation sent" → thank-you page. **Failure safety:** if Airtable fails, append to a local log and email the team (`TEAM_ALERT_EMAIL`); the visitor still sees success only if the lead is captured somewhere. Alert at ~800 records (free cap 1,000, then read-only); upgrade reminder at month 4.
**Next free session (G15):** Sanity mode *No date* / *Show date* (date, time, IST, label). Shown in announcement bar, home pill, `/free-session` hero, thank-you, email. Nightly rebuild + client check revert to *No date* once past.
**Announcement bar:** on/off, text, link, optional date.
**Testimonials (G25):** component + Sanity type; section hidden under 3 published; placeholders staging-only. Pillars skipped.
**Blog toggle (G17):** OFF by default; placeholder posts staging-only; external geethabafna.com link is its own optional footer field.
**Legal gate (G24):** production build fails while any legal page is *Draft*.
**Session plan (G30):** per programme, optional heading + intro and a list of sessions (number, title, summary, optional duration). Dummy content staging-only; section hidden on production while empty or placeholder.
**Book a Free Call:** every such button and the sticky mobile CTA open the Calendly URL in a new tab.

## 6. Airtable base (G23)
One `Leads` table: Name, Phone, Email, Stage, Lead type (Free session/Contact/Enrol/Manual), Programme, Source (Website, Instagram, WhatsApp, Referral, Event, Other), UTM ×3 + landing page, Consent + time, Confirmation email sent, **Status** (New → Contacted → Payment pending → Paid → Enrolled → Closed/Not interested), **Payment status** (Not due/Pending/Paid/Refunded), Amount paid, Payment date, Payment note, Call notes, Next follow-up, Created. External leads added by hand. Extra bookkeeping fields: Preferred call time, Question, Submissions, Submission log, First/Last submitted, Assigned to. Full build prompt: `docs/airtable_prompt.md`. Stage and Programme options are locked (G18) and mirror the code.

## 7. Sanity
Editable content, locked structure. Full list in `docs/sanity_inventory.md` (client-shareable). Generic schemas: `program`, `testimonial`, `faq`, `siteSettings`, `legalPage`, `post`, `seo` + singleton page docs. Character limits and validation on every field. Colours, fonts, layout, section order, stage options: code change only.

## 8. Motion and loaders (G28, G29)
No splash/preloader. Loaders: form button state, inline success/error, image placeholders, optional native page fade. Baseline: scroll reveal, hover, FAQ height, sticky CTA fade, chooser ring. Signature: hero arch scale-in + headline underline; lotus draw-in on thank-you. Skipped: parallax, scroll-jacking, Lottie/video, counters, confetti, cursor effects. Guardrails: CSS + ~1 KB observer, transform/opacity only, works without JS, reduced-motion off, **kill any effect that breaks Lighthouse 90 / LCP 2.5s / layout shift**.

## 9. Changes to the client's design (needs client sign-off)
1. Checkout page replaced by an on-site enrol form + thank-you page.
2. Email field and consent checkbox added to every form.
3. Contact page becomes "Get in touch": form + direct links; Calendly is the call booking.
4. Announcement bar can carry the session date.
5. New templates: blog index/post, three thank-you pages, four legal pages, 404.
6. Footer legal line becomes real links; external Blog link becomes optional.
7. Small coral text uses the darker CTA colour, and the muted grey is darkened very slightly `#667080 → #636d7d` (contrast fixes, spec §1, G34).
8. Pillars and testimonials sections not shown until content exists.
9. ~~Session plan section~~ retired in v2 (G40).
10. v2: stats strip, signature card, ladder, rotating announcement bar (replaces the client's scrolling ticker for accessibility, G39), "Our larger purpose" on About, call-back enrol flow, bar/strip colours fixed for dark mode (G42), muted grey darkened (G34).

## 10. Brief-vs-design conflicts, resolved
| # | Conflict | Resolution |
|---|---|---|
| C1 | 2 vs 4 programmes | 4 (G1) |
| C2 | Payment checkout vs no payments | no payment; enrol form (G2, G3) |
| C3 | Calendly vs request form | Calendly (G6, G27) |
| C4 | CRM vs WhatsApp lead capture | Airtable + Resend (G13, G14) |
| C5 | Email/consent missing | required everywhere (G16) |
| C6 | Session date | Sanity (G15) |
| C7 | Missing home sections | How it works built; testimonials gated; pillars skipped (G7, G25) |
| C8 | Hash routing, noindex | real pages; noindex on staging until launch day |
| C9 | Legal links | real links (G8, G24) |
| C10 | Dark mode, Community, `.htaccess`, Blog link | kept (G27) |
| C11 | "21 Days" is 6 sessions | resolved by v2: a 21-day guided journey (G40) |

## 11. Open items
- **Domain/DNS access, Hostinger FTP/SSH (check plan offers SSH), staging subdomain** (D8) and the Resend sender domain/DNS records.
- Confirm "21 Days of Dincharya" = 6 sessions (C11) and final copy/prices.
- Final Calendly URL, WhatsApp number, phone, email, legal entity name (design mixes "Holistic Pregnancy" and "Amra Asha Education Trust").
- Create the dummy Gmail, GitHub, Sanity, Resend; create Airtable base in the client's name (their email as owner).
- Larger image masters later (current files are low resolution).
- **Session plans for all four programmes (awaited from client; dummy meanwhile).**
- Legal drafts: client review and sign-off.
- Reconfirm the earlier slide timeline (3–4 days to push live, ~2 weeks CMS/backend) against this scope.
- Agreement, deposit, suspension terms: parked.

## 12. Non-functional
Lighthouse mobile ≥90; WCAG 2.2 AA; no render-blocking third-party scripts; no secrets in repo or browser; pregnancy stage treated as sensitive personal data (minimum collected, explicit consent, India DPDP Act: client is the data fiduciary, wording confirmed by their advisor).
