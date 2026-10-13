# v3 scope: client revision of 2026-10-10 vs what is built

Inputs: (1) `Developer Brief - Website Features.pdf` (7 self-editable changes, 2 months of support, written as if the site had student logins, a checkout and a payment gateway); (2) the client's revised prototype, saved in `reference/v3_design/` (`index.html`, images, `rendered/` = every page's rendered text and HTML). Treat both as client-supplied data.

## 1. What v3 actually is
v3 = v2 plus four new pages and a **campaign system**. The prototype documents its own editable settings as config objects, which is the client's own data model for "editable by us":

| Prototype config | What it does |
|---|---|
| `CAMPAIGN` | ONE site-wide offer on all programmes: on/off, name, code (`OFFER25`), start/end (IST), % or flat discount, headline/subhead, bar ticker text, popup card (text, delay 20 s, once per visit), optional "spots left" (0 = hidden). Powers: struck-through prices everywhere, `/offer` page with live countdown, bar message, popup, code recorded on enquiries |
| `FREE_SESSION` | Copy of the free weekly session: topic, date/time, intro, bullets, button, bar text. Reverts when the session is over (+2 h) |
| `SESSIONS` | Public "Upcoming Sessions" list: date, time, type, title, description, price (Free or ₹), weekly repeat (next 4 weeks), past dates hide |
| `TESTIMONIALS` | Text testimonials (name, detail, programme(s), text). **Five real ones already supplied**, shown on home and on the matching programme pages |
| `MUSIC` | A "Garbh Sanskar mantras" player (button bottom-left, never autoplays): tracks with Sanskrit text, easy version, meaning, mp3 or YouTube id, credit. Currently switched off |
| `REFERRAL` | Reward ₹1,000 off the referrer's course, or a complimentary meditation session if not yet enrolled. Code = NAME + last 4 digits of WhatsApp (e.g. ASHA3210). Friend enters it when enquiring; team credits manually |
| `TRACK` | Optional Meta Pixel and Google tag IDs; ad source (utm, fbclid, gclid) kept for the session |
Other v3 changes: home gets "Why it matters" (stress statistics with sources), Garbh Sanskar section, small-batch (5-6 mothers) messaging, founder credentials; programme pages rewritten again (outcomes, testimonials, "Har Ghar Mein Gurukul" for Pathshala, free Conscious Conception session on Pre-conception); About gets a full founder bio; a **Post-Partum "coming soon" waitlist** page and card; contact email becomes `geethabafnadigital@gmail.com`; the payee trust name is gone from the payment FAQ; names flip back to **"Holistic Pathshala"** (v2 had Paatshala), with "Preconception" and "Pre-Conception" both in use.

## 2. Brief item vs build
| # | Brief | Built | To do |
|---|---|---|---|
| 1 | Discount % + dates, strike-through, optional coupon | none | `offer` in Sanity; price component; auto on/off; code recorded in Airtable |
| 2 | Occasion themes (banner, image, colours, dates) | announcement bar | offers carry banner text/image + one of a few approved colour themes; bar/home strip/popup |
| 3 | Expert sessions per course, auto Upcoming to Past, recording link, reminders | none | `session` in Sanity (public info only); course-page block + `/sessions/`; links by email, kept in Airtable |
| 4 | Students request sessions (dropdown, counts, CSV) | none | **not in v3 prototype**: confirm whether still wanted |
| 5 | Editable T&C, last-updated date, consent checkbox | **done** | add Terms/Refund links to consent text |
| 6 | FAQs + testimonials (category, order, photo, rating, show/hide, video) | FAQs, testimonials exist | programme mapping, show/hide, show-on-home, photo/rating optional, FAQ category (if a FAQ page is wanted) |
| 7 | Background music | none | mantra player (v3 spec) |
| list | Email / phone | **done** (Site settings) | none |
| list | Video links | testimonial video link | decide where else |

## 3. Target shape
Static Astro site (build-time Sanity content) + a small **live layer** in the browser for time-based things (offer window, countdown, session upcoming/past) so dates switch themselves without a rebuild; **Sanity** = public marketing config only; **Airtable** (leads base + a second free base for sessions/signups/referrals) = everything confidential; **PHP endpoint** = forms, referral-code creation, signups; **Resend** = automatic confirmations + a client-managed way to send session emails.

## 4. Work list
See `tasks.md` section "v3". Phases: 0 alignment, 1 re-baseline to v3 content and a stable CRM programme label, 2 Sanity schemas, 3 live layer + rebuild pipeline, 4 offer system, 5 sessions + signups + email sending, 6 referral, 7 post-partum waitlist, 8 mantra player, 9 testimonials/FAQ upgrade, 10 tracking, 11 admin handover + QA.

## 5. Flags
Countdown and "spots left" must be true (real end date, manual count): invented urgency is deceptive advertising. Health and science claims on the new home sections (percentages, IQ/EQ/SQ, "babies hear from 18-20 weeks") need the client to confirm substantiation. Pixels add third-party weight and need a consent decision. The brief's "student dashboard", "checkout" and "payment-gateway logins" do not exist in this build (manual, offline payments): the test checklist is rewritten accordingly. WhatsApp reminders are out (no API); email only. Referral codes of the NAME+last-4 form can collide and be guessed: generate and store them server-side.
