<?php
// Lead endpoint: validate -> Resend confirmation -> Airtable (dedupe by phone) -> fallback log + team alert.
declare(strict_types=1);
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
require __DIR__ . '/adapters/airtable.php';
require __DIR__ . '/mail/resend.php';

function out(int $code, array $body): never { http_response_code($code); echo json_encode($body); exit; }

$c = require (getenv('HPC_CONFIG') ?: __DIR__ . '/config.php');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

// Origin check. A missing Origin (curl, tests) is only allowed from the local machine.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
if ($origin ? !in_array($origin, $c['allowed_origins'], true) : !$local) out(403, ['ok' => false, 'error' => 'origin']);
if ($origin) header("Access-Control-Allow-Origin: $origin");

// Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
if (trim((string) ($_POST['website'] ?? '')) !== '') out(200, ['ok' => true]);

// Rate limit: 5 submissions / 10 min / IP (file based; ponytail: resets if temp dir is cleared).
$rl = sys_get_temp_dir() . '/hpc_rl_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
$hits = array_filter(is_file($rl) ? (array) json_decode((string) file_get_contents($rl)) : [], fn($t) => $t > time() - 600);
if (count($hits) >= 5 && !getenv('HPC_NO_RATELIMIT')) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = time(); file_put_contents($rl, json_encode(array_values($hits)));

// Allowed values mirror Airtable options and the Sanity-locked lists (PRD G18/G23).
const STAGES = ['Planning a pregnancy', 'Currently pregnant', 'Not sure yet'];
const TYPES = ['Free session', 'Enrol', 'Contact'];
const PROGRAMMES = ['preconception' => 'Preconception Program', 'dincharya' => '21 Days of Dincharya', 'power-of-11' => 'Power of 11', 'pathshala' => 'Holistic Pathshala'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];

$p = fn(string $k, int $max = 200): string => mb_substr(trim((string) ($_POST[$k] ?? '')), 0, $max);
$err = [];

$name = $p('name', 100); if (mb_strlen($name) < 2) $err[] = 'name';
$email = $p('email', 254); if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $err[] = 'email';
$digits = preg_replace('/\D/', '', $p('phone', 20));
if (strlen($digits) === 10) $digits = '91' . $digits;                       // Indian mobile without country code
if (strlen($digits) < 11 || strlen($digits) > 15) $err[] = 'phone';
$phone = '+' . $digits;
$stage = $p('stage'); if (!in_array($stage, STAGES, true)) $err[] = 'stage';
$type = $p('type'); if (!in_array($type, TYPES, true)) $err[] = 'type';
$prog = $p('programme'); $prog = PROGRAMMES[$prog] ?? (in_array($prog, PROGRAMMES, true) ? $prog : '');
if ($type === 'Enrol' && $prog === '') $err[] = 'programme';
$time = $p('call_time'); if ($time !== '' && !in_array($time, TIMES, true)) $err[] = 'call_time';
if (($_POST['consent'] ?? '') !== '1') $err[] = 'consent';
if ($err) out(400, ['ok' => false, 'error' => 'invalid', 'fields' => $err]);

$now = gmdate('c');
[$subject, $text] = confirmation($type, $name, $prog);
$emailed = send_mail($c, $email, $subject, $text);

$fields = array_filter([
  'Name' => $name, 'Phone' => $phone, 'Email' => $email, 'Stage' => $stage, 'Lead type' => $type,
  'Programme' => $prog, 'Source' => 'Website',
  'UTM source' => $p('utm_source', 100), 'UTM medium' => $p('utm_medium', 100), 'UTM campaign' => $p('utm_campaign', 100),
  'Landing page' => $p('landing_page', 300), 'Question' => $p('question', 1000), 'Preferred call time' => $time,
  'Consent given' => true, 'Consent time' => $now, 'Confirmation email sent' => $emailed,
  'First submitted' => $now, 'Last submitted' => $now,
], fn($v) => $v !== '' && $v !== null);
$fields['Confirmation email sent'] = $emailed;
$log = gmdate('Y-m-d H:i') . " UTC · $type" . ($prog ? " · $prog" : '') . ' · ' . ($p('utm_source', 100) ?: 'direct');

try {
  at_save_lead($c, $fields, $log);
  out(200, ['ok' => true]);
} catch (Throwable $e) {
  // Never lose a lead: local log + alert the team. Success only if captured somewhere.
  $line = json_encode(['at' => $now, 'error' => $e->getMessage(), 'lead' => $fields]);
  $logged = @file_put_contents(__DIR__ . '/leads-fallback.log', $line . "\n", FILE_APPEND | LOCK_EX) !== false;
  $alerted = send_mail($c, $c['team_alert_email'], 'ALERT: lead not saved to Airtable', "A lead could not be saved to Airtable.\nReason: {$e->getMessage()}\n\nLead:\n" . json_encode($fields, JSON_PRETTY_PRINT));
  out($logged || $alerted ? 200 : 500, ['ok' => $logged || $alerted]);
}
