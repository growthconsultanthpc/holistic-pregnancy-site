#!/usr/bin/env bash
# Build the site and put ONLY the files Hostinger needs into hostinger-upload/ (+ hostinger-upload.zip).
# Usage: scripts/package-site.sh <SITE_URL> [staging|production]
#   staging    (default): noindex, dummy content shown
#   production         : indexable, dummy content hidden (needs approved legal pages)
set -euo pipefail
cd "$(dirname "$0")/.."
URL="${1:?usage: scripts/package-site.sh https://your-address [staging|production]}"; MODE="${2:-staging}"
if [ "$MODE" = production ]; then NOINDEX=false; PH=false; else NOINDEX=true; PH=true; fi
SITE_URL="$URL" PUBLIC_NOINDEX=$NOINDEX PUBLIC_SHOW_PLACEHOLDERS=$PH PUBLIC_LEAD_ENDPOINT=/api/submit-lead.php npm run build
# start from a clean folder (generated output only)
rm -rf hostinger-upload hostinger-upload.zip
cp -R dist hostinger-upload
rm -f hostinger-upload/api/*.log
(cd hostinger-upload && zip -qr ../hostinger-upload.zip . -x '.DS_Store')
echo "Built for $URL ($MODE): hostinger-upload/ and hostinger-upload.zip"
