# Design specification

Extracted from `reference/index.html` (86 KB, one file, hash-routed). The file was built in layers: three `:root` token blocks, many `!important` overrides and a "compact" pass. **Values below are the final cascaded result**, i.e. what actually renders. Source of truth = the design; do not "improve" it.

## 1. Colour tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#fdfcfa` | `#14142e` | page |
| `blush` | `#f5f2ec` | `#1b1b3b` | alternate band, footer |
| `card` | `#ffffff` | `#20203f` | cards, forms |
| `ink` | `#12264a` | `#f3efff` | headings, nav, outline buttons |
| `text` | `#3b4455` | `#e3e1ef` | body |
| `muted` | `#636d7d` (design: `#667080`, 4.48:1 on blush, darkened for AA, G34) | `#aaa8c2` | secondary text |
| `line` | `#e7e2d9` | `#37375c` | borders |
| `coral` | `#cf5b52` | same | accent: markers, eyebrows, prices |
| `cta` / `ctaD` | `#bd4a42` / `#a83d36` | same | primary button / hover |
| `soft` | `#eaf0e7` | `#1f2a3a` | hero glow, date pill, hover fill |
| `blue` | `#2b5c9e` | `#8db4ee` | hero `<em>`, quote marks, founder sub-line |
| `sage` / `sageInk` | `#e1e9dd` / `#587561` | `#2b3a33` / `#a9c9b0` | icon tiles, tags, trust-bar ticks |
| `pink` / `pinkInk` | `#f8e4e4` / `#c25d66` | `#3d2b3a` / `#f0a3aa` | icon tiles, signature |
| WhatsApp green | `#1f7a4a` | same | mobile WhatsApp button, checkout tick |
| Error | `#c0392b` | same | checkout error text |

Dead tokens: `--red`, `--coralD` (`#c9524a`), the old coral `#e0685f`, old `--ink #1a1a5e`. Not used in the final cascade; do not carry over.

**Contrast flags:** white on `cta` ≈ 5.0:1 (AA pass). `coral` `#cf5b52` as *text* on `bg` ≈ 3.9:1, which **fails AA for small text**. It is used for 12–13px eyebrows, step numbers and price meta. In the build, use `cta` (`#bd4a42`) for coral text under ~18px. This is an accessibility fix, not a redesign; confirm with client. `muted` on `bg` ≈ 4.9:1 (pass).

Theme switch: `prefers-color-scheme: dark` plus `data-theme="dark|light"` override. Logo gets a white rounded backing in dark mode.

## 2. Typography
Fonts (Google Fonts today; self-host in build): **Playfair Display** 500, 600, italic 500 (headings, prices); **Montserrat** 400, 500, 600 (body/UI); **Caveat** 500 (signature).

| Role | Spec |
|---|---|
| Body | Montserrat 400, 16px / 1.6 |
| H1 hero (home) | Playfair 600, `clamp(36px, 4.5vw, 58px)`, lh 1.08, ls −.01em; mobile 34px; `<em>` italic 500 in `blue` |
| H1 inner hero (`hero2`) | Playfair 600, `clamp(32px, 4.6vw, 52px)`; mobile `clamp(28px, 8vw, 34px)` |
| H2 section | Playfair 600, `clamp(28px, 3.8vw, 38px)`, ls −.01em; mobile 25px |
| H2 founder/free | `clamp(30px, 3.8vw, 42px)` |
| H3 card | Playfair 600, 20–24px (programme 22px, pillars 22px, `cd` 20px) |
| Lead | 18.5px, `muted`; mobile 16px |
| Nav | Montserrat 500, 13.5px, ls .02em |
| Button | 500, 15px, lh 1.2 |
| Eyebrow | 12px / 600 / ls .12em / uppercase / coral (`cm-eye` is 13px, ls .6px) |
| Chip/trio label | 11px / 600–500 / ls .08em / uppercase |
| Price | Playfair 600: card 28px, price card 44px, hero line 30px, checkout 30px |
| Signature | Caveat 500, 26px (20px mobile), `pinkInk` |
| Small/note | 12–14.5px, `muted` |
| Headings | `text-wrap: balance`, h1/h2 |
| Form inputs | forced 16px (stops iOS zoom) |

## 3. Layout, spacing, radii, shadows
- Container: max 1120px, 22px side padding (16px on mobile).
- Section padding: 56px desktop / 36px ≤860px (home: 46 / 28). Title block margin-bottom 30px (22 mobile).
- Grid gaps seen: 10, 12, 14, 18, 20, 22, 24, 26, 40, 44px. Proposed scale: 4 / 8 / 12 / 16 / 24 / 32 / 44 / 56.
- Radii: button/pill/chip `999px`; large card & form `24px`; `sx-box`/checkout `18px`; `cd`/quote `16px`; FAQ `12px`; inputs `8–10px`; **arch** `999px 999px 28px 28px`; inner hero image `28px`.
- Shadows: arch `0 30px 60px -30px rgba(18,38,74,.35)`; inner hero image `0 30px 60px -34px` same colour; video reel `0 6px 18px rgba(0,0,0,.12)`; dropdown `0 10px 30px rgba(0,0,0,.12)`; mobile CTA/toast `0 6px 20px rgba(0,0,0,.2)`.
- Borders: 1px `line` on cards; selected programme card gets 1px + 2px `cta` ring.

## 4. Components
- **Buttons:** `.btn` pill, min-height 44px, padding 14×30. Primary = `cta` fill, white text; hover `ctaD`. Outline = 1.5px `ink` border, ink text; hover `soft` fill. Mobile hero: two buttons side by side, equal width.
- **Programme card:** 24px radius, image (16:9, 21:9 ≤600px) over body: tag pill (sage), H3, price (Playfair 28 `ink`) + meta, check list (coral circle ✓; hidden ≤600px), full-width primary button. "Recommended" state: `cta` ring and filled tag. Mobile: horizontal scroll-snap carousel, cards 80% wide.
- **Stage chooser:** pill chips ("Planning a baby", "I am pregnant", "I want emotional support", "Not sure? Talk to us"); `aria-pressed` toggles; selected = `ink` fill. Marks matching cards "Recommended for you".
- **Trust bar:** four ticks (Live online sessions · Partners welcome · Works alongside your doctor · Free first session); 2×2 on mobile.
- **Icon tiles:** circle (44–72px) in sage or pink with 1.5px outline icon.
- **Programme detail template (`sx`):** hero2 (text + image) → "Is this for you?" split (copy + question box) → "What the program covers" numbered cards (4 or 5) → "What you will gain" (large serif text + strip of pills) → price card (2px coral border, 20px radius, max 440px) → FAQ + disclaimer. **Pathshala differs:** covers as 6 titled cards, "How it works" strip, trimester roadmap, price card, FAQ.
- **Forms:** 2-col grid on desktop (single column ≤820px except short fields), label 12.5px/600 `ink`, inputs 8px radius on `bg`, consent row 12.5px. Success is an inline `.ok` message.
- **FAQ:** `<details>` cards, 12px radius, "+" / "–" marker in coral, 14–16px vertical padding.
- **Sticky mobile CTA (≤860px):** full-width bottom bar, "Book a Free Call" (becomes "Enroll Now · ₹X" on programme pages) + 56px WhatsApp square. Appears after 420px scroll; hidden while a form or footer is on screen; hidden on contact/free-session.
- **Header:** announcement bar (ink bg, white 13px, "Join Free Session"), logo (143×56), nav with Programs dropdown, "Book a Free Call" button (hidden ≤860px). Free-session page hides bar and nav (landing mode); checkout hides them too.
- **Footer:** blush bg; logo + tagline "Nurturing mothers. Healthier families. A brighter future."; columns Programs / About / Follow (Instagram, Facebook, Threads, WhatsApp); legal line (needs real links) and © line.
- **Checkout:** 2-col (summary sticky | steps). Steps: Details → Pay (UPI tab with QR on desktop / "Pay with any UPI app" deep link on mobile, Bank tab with copy buttons) → Confirm (UTR) → thank-you. Hands off to WhatsApp with a prefilled message.

## 5. Icons, imagery
- Icons: 5 inline SVG symbols (`heart`, `leaf`, `lotus`, `mind`, `two`; `two` unused), 24px viewBox, stroke 1.5–1.7, round caps/joins, `currentColor`.
- Imagery is AI-generated, supplied by the client, applied as **CSS backgrounds with `role="img"`**. In the build use real `<img>` with `alt` for SEO, `srcset`, width/height (no layout shift) and `fetchpriority="high"` on the hero.
- Hero and founder use the **arch** crop. Programme and inner-hero images are 16:9/4:3 cover crops. Hero focus `50% 22%` on mobile; founder `50% 30%`.
- Files: `im0` 520×830 (hero), `im1–im4` 480×360 (programmes), `im5` 720×900 (founder), `logo-img` 286×112. **Resolution is low** for retina screens at the displayed sizes; ask for larger masters.

## 6. Breakpoints
Design uses 1020, 860, 820, 600, 520, 360, 340px. Effective behaviour: ≥1021 full layout; ≤1020 programme grid 2-up; ≤860 mobile nav + sticky CTA; ≤820 single-column; ≤600 compact cards. Proposal: consolidate to **600 / 860 / 1020** and map the 820/520/360 rules into them with a visual check.

## 7. Section inventory (what exists in the HTML)
**Home:** announcement bar → header → hero (H1, lead, 2 CTAs, 3-badge trio [hidden on mobile], arch image) → trust bar → programmes (chooser, 4 cards, "How it works" 4-step strip) → founder (arch image, 4 icon points [hidden on mobile], "Know Our Story", signature) → free session (3 bullets, date pill, 3-field form) → FAQ (4 items) → footer.
**Absent from HTML but styled/briefed:** pillars (`.h-pill`), 4-step band (`.h-steps`), quote cards (`.h-q`), video reels (`.reels` + YouTube Shorts JS). See PRD C7.
**Inner pages:** Preconception, Dincharya, Power of 11, Pathshala, Free Session, About, Community, Contact, Checkout. Not designed: thank-you, legal ×4, 404, Stories.

## 8. `qrcode.min.js`
`qrcode-generator` 1.4.4 (MIT, ~20 KB). In the original it drew a UPI payment QR on the checkout page only. **Dropped:** checkout is replaced by an on-site enrol form (PRD G2/G3); no payment is taken online. Keep the file in `reference/` only.

## 9. Motion and loaders (decided: G28, G29)
Tokens: `--ease: cubic-bezier(.22,.61,.36,1)`, `--dur: 500ms`. **No splash/preloader.**
- **Loaders:** form button loading state (disabled, no double submit); inline success/error; image placeholders (solid or blurred block, no layout shift); optional short native page fade.
- **Baseline:** scroll reveal (fade + rise 12px, once, 70ms stagger); card/button hover (3px lift, 1px press, pointer devices only); FAQ height transition; sticky mobile CTA fade; stage-chooser ring + mobile scroll to recommended card.
- **Signature A:** hero arch scales 1.04 → 1 and fades in; italic headline words get a thin underline that draws in. Image never delayed.
- **Signature B:** lotus icon draws itself (SVG stroke, ~700ms) on thank-you pages.
- **Skipped:** parallax, scroll-jacking, Lottie/video backgrounds, counters, confetti, cursor effects, line-art dividers.
- **Rules:** CSS + ~1 KB IntersectionObserver; transform/opacity only; content visible without JS; everything off under `prefers-reduced-motion` (lotus shows final state); no animation before LCP; **cut any effect that drops mobile Lighthouse below 90, LCP above 2.5s, or adds layout shift.**

## 10. Changes to the client's design
See `PRD.md` §9 (enrol form replaces checkout; email + consent on all forms; Get in touch page; session date in bar; new blog/thank-you/legal/404 templates; real footer links; darker CTA colour for small coral text; pillars/testimonials gated).
