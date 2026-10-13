<?php
/* Holistic Pregnancy – upcoming session admin
   Open  https://YOUR-DOMAIN/admin/  to set the topic, date and time of the next free live session.
   The details are saved to ../session.json, which the website reads on every visit. */
declare(strict_types=1);
session_start([
  'cookie_httponly' => true,
  'cookie_samesite' => 'Strict',
  'cookie_secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
]);
header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');

const AUTH_FILE    = __DIR__ . '/data/auth.php';
const SESSION_FILE = __DIR__ . '/../session.json';
const OFFER_FILE   = __DIR__ . '/../offer.json';

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function auth(): array { if (!is_file(AUTH_FILE)) return []; $a = include AUTH_FILE; return is_array($a) ? $a : []; }
function save_auth(string $hash): bool {
  return file_put_contents(AUTH_FILE, "<?php\nreturn " . var_export(['hash' => $hash], true) . ";\n", LOCK_EX) !== false;
}
function save_json(string $file, array $data): bool {
  return file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}
function clean(string $s, int $max): string {
  $s = trim(strip_tags($s));
  $s = preg_replace('/\s+/u', ' ', $s) ?? '';
  return mb_substr($s, 0, $max);
}
if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(16)); }
$csrf_ok = isset($_POST['csrf']) && hash_equals($_SESSION['csrf'], (string)$_POST['csrf']);

$msg = ''; $err = '';
$a = auth();

/* login / logout */
if (isset($_GET['logout'])) { $_SESSION = []; session_regenerate_id(true); header('Location: ./'); exit; }
if (($_POST['action'] ?? '') === 'login' && $csrf_ok) {
  if (!empty($a['hash']) && password_verify((string)($_POST['password'] ?? ''), $a['hash'])) {
    session_regenerate_id(true); $_SESSION['ok'] = true; header('Location: ./'); exit;
  }
  usleep(800000); $err = 'Incorrect password.';
}
$logged = !empty($_SESSION['ok']);

/* actions */
if ($logged && $_SERVER['REQUEST_METHOD'] === 'POST' && $csrf_ok) {
  $act = $_POST['action'] ?? '';
  if ($act === 'save') {
    $topic = clean((string)($_POST['topic'] ?? ''), 120);
    $date  = (string)($_POST['date'] ?? '');
    $time  = (string)($_POST['time'] ?? '');
    $intro = clean((string)($_POST['intro'] ?? ''), 300);
    if ($topic === '') { $err = 'Please enter the session topic.'; }
    elseif ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) { $err = 'Please pick a valid date.'; }
    elseif ($time !== '' && !preg_match('/^\d{2}:\d{2}$/', $time)) { $err = 'Please pick a valid time.'; }
    else {
      $ok = save_json(SESSION_FILE, ['topic' => $topic, 'date' => $date, 'time' => $time, 'intro' => $intro, 'updated' => date('c')]);
      $ok ? $msg = 'Saved. The website now shows this session.' : $err = 'Could not save. Please check that the website folder is writable.';
    }
  } elseif ($act === 'spots') {
    $n = filter_var($_POST['spots'] ?? '', FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 1000]]);
    if ($n === false) { $err = 'Please enter a number of spots (0 or more).'; }
    else { save_json(OFFER_FILE, ['spotsLeft' => $n, 'updated' => date('c')]) ? $msg = 'Saved. The website now shows ' . $n . ' founding spots left.' : $err = 'Could not save.'; }
  } elseif ($act === 'clear') {
    save_json(SESSION_FILE, ['topic' => '', 'updated' => date('c')]) ? $msg = 'Cleared. The website now shows the general free session wording.' : $err = 'Could not save.';
  } elseif ($act === 'password') {
    $p1 = (string)($_POST['p1'] ?? ''); $p2 = (string)($_POST['p2'] ?? '');
    if (strlen($p1) < 8) { $err = 'Use at least 8 characters for the new password.'; }
    elseif ($p1 !== $p2) { $err = 'The two passwords do not match.'; }
    else { save_auth(password_hash($p1, PASSWORD_DEFAULT)) ? $msg = 'Password changed.' : $err = 'Could not save the new password.'; }
  }
}
$off = is_file(OFFER_FILE) ? (json_decode((string)file_get_contents(OFFER_FILE), true) ?: []) : [];
$cur = is_file(SESSION_FILE) ? (json_decode((string)file_get_contents(SESSION_FILE), true) ?: []) : [];
?><!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Website admin · Holistic Pregnancy</title>
<style>
:root{--ink:#12264a;--coral:#cf5b52;--soft:#f4efe8;--line:#e7ddd3;--muted:#6b7280}
*{box-sizing:border-box}body{margin:0;background:#fffaf7;color:var(--ink);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.w{max-width:560px;margin:0 auto;padding:28px 16px 60px}h1{font:600 26px/1.2 Georgia,serif;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 22px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:18px}
label{display:block;font-weight:600;font-size:14px;margin:0 0 14px}input,textarea{display:block;width:100%;margin-top:6px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;font:inherit;background:#fff;color:var(--ink)}
textarea{min-height:80px;resize:vertical}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.btn{display:inline-block;border:0;border-radius:999px;padding:12px 22px;font-family:inherit;font-weight:600;font-size:15px;cursor:pointer;background:var(--coral);color:#fff;text-decoration:none}
.btn.o{background:#fff;color:var(--ink);border:1px solid var(--ink)}.btns{display:flex;gap:10px;flex-wrap:wrap}
.msg{background:#e6f3ea;color:#1f5c35;padding:10px 14px;border-radius:10px;margin-bottom:16px}.err{background:#fde8e6;color:#9b2c24;padding:10px 14px;border-radius:10px;margin-bottom:16px}
.cur{background:var(--soft);border-radius:12px;padding:12px 14px;margin-bottom:16px;font-size:14px}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.small{font-size:13px;color:var(--muted)}details summary{cursor:pointer;font-weight:600}
@media(max-width:480px){.row{grid-template-columns:1fr}}
</style></head><body><div class="w">
<?php if (!$logged): ?>
  <h1>Session admin</h1><p class="sub">Holistic Pregnancy · upcoming free live session</p>
  <?php if ($err): ?><div class="err"><?= h($err) ?></div><?php endif; ?>
  <?php if (empty($a['hash'])): ?><div class="err">Admin password is not set up yet. Upload the file admin/data/auth.php.</div><?php endif; ?>
  <form class="card" method="post"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><input type="hidden" name="action" value="login">
    <label>Password<input type="password" name="password" autocomplete="current-password" required autofocus></label>
    <button class="btn" type="submit">Log in</button></form>
<?php else: ?>
  <div class="top"><h1>Upcoming session</h1><a class="small" href="?logout=1">Log out</a></div>
  <p class="sub">What you save here appears on the website straight away: the homepage, Free Session page, Sessions page, top strip and the WhatsApp booking message.</p>
  <?php if ($msg): ?><div class="msg"><?= h($msg) ?></div><?php endif; ?>
  <?php if ($err): ?><div class="err"><?= h($err) ?></div><?php endif; ?>
  <div class="cur"><b>Showing now:</b> <?= !empty($cur['topic']) ? h($cur['topic']) . (!empty($cur['date']) ? ' · ' . h(date('D, j M', strtotime($cur['date']))) : '') . (!empty($cur['time']) ? ' · ' . h(date('g:i A', strtotime($cur['time']))) : '') : 'No session set (general free-session wording)' ?></div>
  <form class="card" method="post"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><input type="hidden" name="action" value="save">
    <label>Topic<input name="topic" maxlength="120" required placeholder="e.g. Managing stress in pregnancy" value="<?= h((string)($cur['topic'] ?? '')) ?>"></label>
    <div class="row"><label>Date<input type="date" name="date" value="<?= h((string)($cur['date'] ?? '')) ?>"></label>
      <label>Time<input type="time" name="time" value="<?= h((string)($cur['time'] ?? '')) ?>"></label></div>
    <label>Short description (optional)<textarea name="intro" maxlength="300" placeholder="One or two lines about the session"><?= h((string)($cur['intro'] ?? '')) ?></textarea></label>
    <p class="small" style="margin-top:-6px">Once the date and time have passed, the website goes back to the general wording on its own.</p>
    <div class="btns"><button class="btn" type="submit">Save session</button><a class="btn o" href="../sessions/" target="_blank" rel="noopener">View on website</a></div>
  </form>
  <form class="card" method="post" onsubmit="return confirm('Remove the upcoming session from the website?')"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><input type="hidden" name="action" value="clear">
    <button class="btn o" type="submit">Clear upcoming session</button></form>
  <details class="card"><summary>Change admin password</summary>
    <form method="post" style="margin-top:14px"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><input type="hidden" name="action" value="password">
      <label>New password<input type="password" name="p1" minlength="8" autocomplete="new-password" required></label>
      <label>Repeat new password<input type="password" name="p2" minlength="8" autocomplete="new-password" required></label>
      <button class="btn" type="submit">Change password</button></form></details>
<?php endif; ?>
</div></body></html>
