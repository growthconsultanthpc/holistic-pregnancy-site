<?php
// Resend adapter. Returns true on HTTP 200. Never throws: email failure must not lose a lead.
function send_mail(array $c, string $to, string $subject, string $text, ?string $html = null): bool {
  $body = ['from' => $c['resend_from'], 'to' => [$to], 'subject' => $subject, 'text' => $text];
  if ($html !== null) $body['html'] = $html;
  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_POST => 1, CURLOPT_TIMEOUT => 12,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer {$c['resend_api_key']}", 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($body)]);
  curl_exec($ch);
  return curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200;
}

// The one confirmation email everybody gets after any form: branded, generic, addressed by the name they typed.
// Returns [subject, plain text, html]. $siteUrl hosts the logo (img/logo-email.png).
function confirmation(string $name, string $siteUrl, string $phone = '+91 98809 05511'): array {
  $n = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
  $tel = preg_replace('/[^0-9+]/', '', $phone);
  $logo = rtrim($siteUrl, '/') . '/img/logo-email.png';
  $text = "Dear $name,\n\nThanks for submitting the form on our website.\nOur team will get back to you shortly.\nMeanwhile call or whatsapp at $phone\n\nBest Regards,\nHolistic Pregnancy Team\n";
  $html = '<!doctype html><html><body style="margin:0;padding:0;background:#f5f2ec">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec"><tr><td align="center" style="padding:24px 12px">'
    . '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e7e2d9;border-radius:16px">'
    . '<tr><td style="padding:28px 32px 8px"><img src="' . htmlspecialchars($logo, ENT_QUOTES) . '" width="143" height="56" alt="Holistic Pregnancy" style="display:block;border:0;width:143px;height:56px"></td></tr>'
    . '<tr><td style="padding:12px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#3b4455">'
    . "<p style=\"margin:0 0 16px\">Dear $n,</p>"
    . '<p style="margin:0 0 16px">Thanks for submitting the form on our website.<br>Our team will get back to you shortly.</p>'
    . '<p style="margin:0 0 16px">Meanwhile call or whatsapp at <a href="tel:' . $tel . '" style="color:#bd4a42;text-decoration:none;font-weight:bold">' . htmlspecialchars($phone) . '</a></p>'
    . '<p style="margin:24px 0 0">Best Regards,<br><strong style="color:#12264a">Holistic Pregnancy Team</strong></p>'
    . '</td></tr></table></td></tr></table></body></html>';
  return ['Thanks for contacting Holistic Pregnancy', $text, $html];
}
