# commands.md

All commands run from the repo root unless stated. **Nothing is installed yet**: these are the commands the setup tasks will create. Update this file the same session any script, deploy step or env var changes (groundrules §5).

Replace `4321` / `3333` in any example with a free port. Check one: `lsof -i :4321` (empty output = free).

## Prerequisites
```bash
node -v   # use the version pinned in .nvmrc (set at setup)
npm -v
```

## Git
Repo: `https://github.com/hariseldon84/holistic-pregnancy-site` (private). Commits use the GitHub noreply identity set locally for this repo.
```bash
git status
git add -A && git commit -m "message"
git push                      # origin/main
```

## Install
```bash
npm install
npm --prefix studio install
```

## Dev server (Astro)
```bash
npm run dev                       # default port 4321
npm run dev -- --port 5050        # any other port
npm run dev -- --host --port 5050 # also reachable from a phone on the same Wi-Fi
```

## Build and preview
```bash
npm run build                      # writes dist/ (fetches Sanity content at build time)
npm run preview -- --port 5051     # serve dist/ locally
```
PHP is not served by `preview`. To test `api/` locally:
```bash
php -S localhost:8081 -t public/api       # then POST to http://localhost:8081/submit-lead.php
```

## Check a production-like build
```bash
PUBLIC_SHOW_PLACEHOLDERS=false npm run build            # production: hides all dummy content
npx astro preview --port 4322                           # serve dist/
npx --yes lighthouse http://localhost:4322/ --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox" --output=html --output-path=./lh.html
```

Build flags: `ALLOW_DRAFT_LEGAL=true` lets a production-mode build run while legal pages are still Draft (non-live test builds only; without it the launch gate fails the build). `PREVIEW_BLOG=true` builds the blog locally without changing the Sanity toggle.

## Production build (launch day)
```bash
SITE_URL=https://holisticpregnancycourse.com PUBLIC_NOINDEX=false PUBLIC_SHOW_PLACEHOLDERS=false npm run build
# fails on purpose while any legal page is still Draft (approve them in Sanity first)
```
After deploy: submit `https://holisticpregnancycourse.com/sitemap-index.xml` in Google Search Console.

## Sanity Studio
```bash
npm --prefix studio run dev -- --port 3334   # local Studio (default 3333)
npm --prefix studio run build
npx --prefix studio sanity deploy            # publish to <name>.sanity.studio (log in as the dummy ID until handover)
npx --prefix studio sanity login
```

## Sanity content scripts (v2)
```bash
cd studio
npx sanity dataset export production ../backup.tar.gz               # always back up first
npx sanity exec scripts/migrate-v2.ts --with-user-token             # v2 migration: overwrites only the v2 fields; safe to re-run
```
`scripts/seed.ts` is the v1 seed and refuses to run (set `ALLOW_V1_SEED=true` only for an empty v1 dataset).
Programme page narrative text lives in `src/client/programs/<slug>.ts` (code), not Sanity.
Every `npm run build` first runs `scripts/check-names.mjs`: it fails if a Sanity programme name is not in the PHP accepted list (and so not in Airtable).

## Seed Sanity content (v1, superseded)
```bash
cd studio && npx sanity exec scripts/seed.ts --with-user-token   # uses your CLI login; safe to re-run (creates only what is missing)
```

## Test the lead endpoint
```bash
curl -i -X POST http://localhost:8081/submit-lead.php \
  -d 'name=Test&phone=%2B919999999999&email=test@example.com&stage=Planning%20a%20pregnancy&type=Free%20session&consent=1&utm_source=test'
# expect 200 + {"ok":true}; without consent=1 or email expect 400; same phone twice updates one Airtable record
```

Local test options: `HPC_NO_RATELIMIT=1 php -S localhost:8081 -t public/api` skips the 5-per-10-min limit; `HPC_CONFIG=/path/to/other-config.php` points at a different config (for example a deliberately broken one to test the fallback). Failed Airtable writes are kept in `public/api/leads-fallback.log` (git-ignored, denied over HTTP).

## Deploy
Production deploys are done by GitHub Actions on push to `main`, on Sanity publish, and nightly. Manual triggers:
```bash
gh workflow run deploy.yml                     # rebuild + deploy now
gh run watch                                   # follow the run
# simulate the Sanity webhook:
curl -X POST -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/<owner>/<repo>/dispatches \
  -d '{"event_type":"sanity-publish"}'
```

## Environment variables
| Var | Where | Purpose |
|---|---|---|
| `SANITY_PROJECT_ID`, `SANITY_DATASET` | CI + local `.env` | build-time fetch |
| `SANITY_READ_TOKEN` | CI secret | only if the dataset is private / for draft preview |
| `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD` (or `SSH_*`) | GitHub secret | upload `dist/` + `api/` |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE` | Hostinger server config (never in repo) | PHP writes leads (client-owned base) |
| `RESEND_API_KEY`, `RESEND_FROM` | Hostinger server config | confirmation emails; sender domain needs SPF/DKIM |
| `TEAM_ALERT_EMAIL` | Hostinger server config | alert if Airtable write fails / ~800 records |
| `CALENDLY_URL`, `WHATSAPP_NUMBER` | **Sanity**, not env | editable by client |
| `SITE_URL` | CI | canonical URLs, sitemap; staging vs prod |

Copy `.env.example` to `.env` for local work. Never commit `.env`.
