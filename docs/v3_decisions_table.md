# v3 decisions: all 25 rows (agreed 2026-10-13) with build status

Saved from the session so it lives in the repo. Status column added afterwards.

## All decisions in one table
| # | Decision | Options | My recommendation | Status |
|---|---|---|--- | --- |
| **A. Referral** |  |
| 1 | **Code format** | (a) name + last 4 phone digits (prototype); (b) name + random characters | **(b)** e.g. `ASHA-7K2Q`: up to 5 letters of the first name plus 4 random characters (no 0/O/1/I), checked against Airtable so it's never repeated. The same WhatsApp number gets the same code back, so nobody can mass-produce codes | Built (G46) |
| 2 | **Message and link** | Your exact wording with a plain link, or with `?ref=CODE` | Your exact wording, but the link ends `?ref=CODE` so the friend's form fills in automatically. The code is still shown so it can be typed | Built |
| 3 | **Where the friend enters it** | Enrol form only, or every lead form | Optional "Referral code" field on enrol, Get in touch and free-session forms. It's remembered for the visit, checked against Airtable (catches typos) and saved on the lead | Built on enrol form only |
| 4 | **Reward handling** | Automatic or manual | Manual. A Referrals table shows each code, how many leads used it, and a "Reward status" column for your team. Same-phone self-referrals get flagged, not blocked | Built (Uses + Reward due) |
| 5 | **Can referral stack with the offer?** | Stack, or not | **Not combinable**, and the team gives the bigger benefit. Add it to the Terms (client confirms) | Not built (Terms clause is Draft) |
| **B. Offer and prices** |  |
| 6 | **What the Sanity "Offer" holds** | Your list only, or more | Show offer on website (on/off), discount % (whole number), optional start and end date, short label. Master price stays on each programme. The code `OFFER25` is dropped; we record "Offer applied: 25%" on the lead instead | Built (code kept as OFFER25 per client file) |
| 7 | **Offer past its end date but still switched on** | Keep showing, or auto-hide | **Auto-hide** and show the Geetha box, so a stale discount can't linger | Built |
| 8 | **Price rule** | Rounding | Nearest rupee, master crossed out, "Save ₹X", as in her prototype (₹9,999 → ₹7,499) | Built |
| 9 | **Where prices change** | Everywhere or some places | One shared price component used on the home cards, programme hero and price box, enrol page, sticky button and Offer page. Search-engine data keeps the master price | Built |
| 10 | **When the offer is hidden** | | The hero box becomes the Geetha text in italic, the bar offer message disappears, prices show plain, and `/offer/` says "This offer has ended" (not a 404) | Built |
| 11 | **Countdown** | Show or not | Show it in the hero box only when an end date is set, driven by that real date, never reset per visitor | Built |
| 12 | **Popup card and "spots left"** | Build, or skip | **Skip both.** You didn't ask for them, and fake scarcity is a legal risk | Skipped (V4 has spots-left: now overridden) |
| 13 | **How fast an edit shows** | (A) live refresh in the browser for offer and prices only, instant; (B) rebuild on publish, 2–5 min, needs the Hostinger webhook; (C) manual redeploy | **(A)**, plus the rebuild pipeline later for everything else. Prices aren't secret, so it's safe | Built (A, live refresh) |
| **C. Blog** |  |
| 14 | **"Designer" blog** | | Featured post, category chips, reading time, cards on the index. The post page gets a large cover, editorial typography, pull quotes, callouts, captions, share buttons, author box, related posts and a programmes call to action. Blog link goes in the header and footer when it's on | Built |
| 15 | **Showcase article** | Sample or real | One original article, e.g. "Five gentle habits for a calmer pregnancy", with no medical claims and the doctor disclaimer, using the client's own images | Built, staging only |
| 16 | **Live or staging-only?** | | **Staging only** until the client replaces it with her own. A made-up health article on a live pregnancy site is a risk | Built |
| **D. Sanity scope** |  |
| 17 | **Your two lists differ** | Keep what's built, or hardcode all | Keep what's already in Sanity (FAQs, testimonials, contact details, bar, session date) since it costs nothing. Hardcode only the new v3 items. Tell the client in writing exactly what's editable vs developer-only | Built |
| 18 | **The five real testimonials** | Hardcode, or add to Sanity | Add to Sanity with a "programmes" field, so there's one source. About 20 minutes | Built |
| 19 | **Legal pages** | | Unchanged: Draft/Approved gate and last-updated date are built. I add a short referral clause for the client to approve | Built |
| **E. Airtable** |  |
| 20 | **New data** | | Leads gets `Referral code used`, `Referred by`, `Offer applied`, `Price quoted`. Lead type gets `Waitlist`. Referrals live in a **separate base** so your leads cap isn't used up. I write short prompts and you create them (the API can't add fields) | Built (same base, not separate) |
| 21 | **Programme names** | Pathshala / Paatshala, Pre-Conception / Preconception | The client picks one list. A **locked CRM label** per programme means public renames never touch Airtable again | Built (crmLabel) |
| **F. Delivery** |  |
| 22 | **Hardcoded extras still wanted?** | All of them, or trim | Build: Post-Partum waitlist, Sessions page (free-session sign-up only), Conscious Conception section. Build but switch off: mantra player. Skip until she runs ads: tracking pixels | NOT built (parked by Anand; V4 has them) |
| 23 | **The bar** | Endless scroll, or our fade | Keep our accessible fade rotation. Offer message first when the offer is on | Built (fade); V4 uses scrolling ticker |
| 24 | **Quote and email** | | Keep ₹15,000. The hardcoded items still need building, only the admin work shrinks. Reword email bullets 2, 3, 6, 8 and 9 to say "managed by us" for what's no longer editable | Done earlier |
| 25 | **Process** | | New branch `v3-design` from `v2-design`. One merge at the end, and only after the Airtable fields exist | Done |

