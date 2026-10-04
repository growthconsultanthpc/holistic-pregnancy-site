<?php
// Airtable adapter: the only place that knows the CRM. Swap this file to change CRM.
function at_req(array $c, string $method, string $path, ?array $body = null): array {
  $ch = curl_init("https://api.airtable.com/v0/{$c['airtable_base_id']}/" . rawurlencode($c['airtable_table']) . $path);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_TIMEOUT => 12, CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer {$c['airtable_token']}", 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => $body === null ? null : json_encode($body)]);
  $raw = curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  return [$code, json_decode((string) $raw, true) ?: [], $raw === false ? curl_error($ch) : ''];
}

// Dedupe by phone (E.164). Returns the existing record or null. Throws on API failure.
function at_find_by_phone(array $c, string $phone): ?array {
  [$code, $j] = at_req($c, 'GET', '?maxRecords=1&filterByFormula=' . rawurlencode("{Phone}='" . $phone . "'"));
  if ($code !== 200) throw new RuntimeException("airtable lookup $code " . json_encode($j['error'] ?? $j));
  return $j['records'][0] ?? null;
}

// $f = fields for a NEW row; $label for the log line on repeat submissions.
function at_save_lead(array $c, array $f, string $logLine): array {
  $existing = at_find_by_phone($c, $f['Phone']);
  if ($existing) {
    $old = $existing['fields'];
    // First-touch attribution stays (Source, UTMs, landing page); later visits only go in the log.
    $upd = array_diff_key($f, array_flip(['Source', 'Lead type', 'UTM source', 'UTM medium', 'UTM campaign', 'Landing page', 'First submitted', 'Submissions', 'Submission log']));
    // Lead type only ever upgrades by intent: Free session < Contact < Enrol.
    $rank = ['Free session' => 1, 'Contact' => 2, 'Enrol' => 3];
    if (($rank[$f['Lead type']] ?? 0) > ($rank[$old['Lead type'] ?? ''] ?? 0)) $upd['Lead type'] = $f['Lead type'];
    $upd['Submissions'] = ((int) ($old['Submissions'] ?? 1)) + 1;
    $upd['Submission log'] = trim(($old['Submission log'] ?? '') . "\n" . $logLine);
    [$code, $j] = at_req($c, 'PATCH', '/' . $existing['id'], ['fields' => $upd]);
    if ($code !== 200) throw new RuntimeException("airtable update $code " . json_encode($j['error'] ?? $j));
    return ['id' => $existing['id'], 'repeat' => true];
  }
  $f['Submissions'] = 1;
  $f['Submission log'] = $logLine;
  [$code, $j] = at_req($c, 'POST', '', ['fields' => $f]);
  if ($code !== 200) throw new RuntimeException("airtable create $code " . json_encode($j['error'] ?? $j));
  return ['id' => $j['id'], 'repeat' => false];
}
