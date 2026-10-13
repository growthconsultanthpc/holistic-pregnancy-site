<?php
// Refer-a-friend: returns a unique code for this person (same phone => same code). Stored in the Referrals base.
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
require __DIR__ . '/adapters/airtable.php';

function out(int $code, array $body): never { http_response_code($code); echo json_encode($body); exit; }
function find_config(): string {
  if ($p = getenv('HPC_CONFIG')) return $p;
  for ($d = __DIR__, $i = 0; $i < 8; $i++, $d = dirname($d)) if (is_file("$d/hpc-config.php")) return "$d/hpc-config.php";
  out(500, ['ok' => false, 'error' => 'config']);
}
$c = require find_config();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'method']);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
if ($origin ? !in_array($origin, $c['allowed_origins'], true) : !$local) out(403, ['ok' => false, 'error' => 'origin']);
if ($origin) header("Access-Control-Allow-Origin: $origin");
if (trim((string) ($_POST['website'] ?? '')) !== '') out(200, ['ok' => true, 'code' => 'FRIEND-2222']); // honeypot

$rl = sys_get_temp_dir() . '/hpc_rr_' . md5($_SERVER['REMOTE_ADDR'] ?? '');
$hits = array_filter(is_file($rl) ? (array) json_decode((string) file_get_contents($rl)) : [], fn($t) => $t > time() - 600);
if (count($hits) >= 5 && !getenv('HPC_NO_RATELIMIT')) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = time(); file_put_contents($rl, json_encode(array_values($hits)));

if (!ref_ready($c)) out(503, ['ok' => false, 'error' => 'not_ready']);

$p = fn(string $k, int $max = 100): string => mb_substr(trim((string) ($_POST[$k] ?? '')), 0, $max);
$err = [];
$name = $p('name'); if (mb_strlen($name) < 2) $err[] = 'name';
$digits = preg_replace('/\D/', '', $p('phone', 20));
if (strlen($digits) === 10) $digits = '91' . $digits;
if (strlen($digits) < 11 || strlen($digits) > 15) $err[] = 'phone';
$phone = '+' . $digits;
$in = $p('in_program'); if (!in_array($in, ['Yes', 'Not yet'], true)) $err[] = 'in_program';
if (($_POST['consent'] ?? '') !== '1') $err[] = 'consent';
if ($err) out(400, ['ok' => false, 'error' => 'invalid', 'fields' => $err]);

try {
  $existing = ref_find($c, 'Phone', $phone);
  if ($existing) out(200, ['ok' => true, 'code' => $existing['fields']['Code'], 'name' => $existing['fields']['Name'] ?? $name]);
  $code = ref_make_code($c, $name);
  [$st, $j] = ref_req($c, 'POST', '', ['fields' => ['Code' => $code, 'Name' => $name, 'Phone' => $phone, 'In program' => $in, 'Uses' => 0, 'Reward status' => 'None yet']]);
  if ($st !== 200) throw new RuntimeException("referral create $st " . json_encode($j['error'] ?? $j));
  out(200, ['ok' => true, 'code' => $code, 'name' => $name]);
} catch (Throwable $e) {
  @file_put_contents(__DIR__ . '/leads-fallback.log', json_encode(['at' => gmdate('c'), 'referral_error' => $e->getMessage()]) . "\n", FILE_APPEND | LOCK_EX);
  out(502, ['ok' => false, 'error' => 'upstream']);
}
