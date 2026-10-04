# Bug log

Current log for this repo (fresh numbering, started 2026-10-03). Never delete or overwrite an entry; update status in place (open → investigating → fixed, note the fix). Number continues across files; roll to `bugs2.md` past ~3000 words (groundrules §6).

Entry format: `B-001 · status · title — repro / expected / actual / fix`

## Setup & CI
B-001 · wontfix (not applicable) · `npm audit`: 2 high in `http-cache-semantics` via Astro — only affects remote-image fetching at build time on a static site; the suggested `--force` fix downgrades Astro to v2 and would break the project. Revisit when Astro bumps the dependency.

## Design system & UI
_none_

## Homepage
_none_

## Inner pages
_none_

## Sanity & content
_none_

## Forms & CRM
_none_

## SEO
_none_

## Deploy & hosting
_none_

## Performance & accessibility
_none_
