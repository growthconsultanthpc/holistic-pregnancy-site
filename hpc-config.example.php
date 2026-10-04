<?php
// Copy to hpc-config.php (git-ignored). Never commit real values.
// Local: repo root. Live: the hosting HOME folder (above the website folder), so redeploys never touch it.
return [
  'airtable_token'   => '',            // Personal Access Token (data.records:read/write, this base only)
  'airtable_base_id' => '',            // app...
  'airtable_table'   => 'Leads',
  'resend_api_key'   => '',            // re_...
  'resend_from'      => 'Holistic Pregnancy <hello@YOUR-VERIFIED-DOMAIN>',
  'team_alert_email' => '',            // gets an email if an Airtable write fails
  'allowed_origins'  => ['https://holisticpregnancycourse.com', 'http://localhost:4321'],
];
