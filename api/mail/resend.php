<?php
// Resend adapter. Returns true on HTTP 200. Never throws: email failure must not lose a lead.
function send_mail(array $c, string $to, string $subject, string $text): bool {
  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_POST => 1, CURLOPT_TIMEOUT => 12,
    CURLOPT_HTTPHEADER => ["Authorization: Bearer {$c['resend_api_key']}", 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode(['from' => $c['resend_from'], 'to' => [$to], 'subject' => $subject, 'text' => $text])]);
  curl_exec($ch);
  return curl_getinfo($ch, CURLINFO_HTTP_CODE) === 200;
}

// Default confirmation copy per lead type. ponytail: hard-coded defaults; move to Sanity-generated
// api/templates.json (written at build time) when the client edits email text (PRD G14/G18).
function confirmation(string $type, string $name, string $programme): array {
  $first = explode(' ', trim($name))[0];
  $what = ['Free session' => 'your spot in our free online session', 'Enrol' => 'your enrolment request' . ($programme ? " for $programme" : ''),
           'Contact' => 'your message'][$type] ?? 'your request';
  return ["We've received your request, $first",
    "Hi $first,\n\nThank you. We have received $what and our team will call you back soon.\n\n"
    . ($type === 'Enrol' ? "Payment is collected offline. We will share the details on the call.\n\n" : '')
    . "With care,\nHolistic Pregnancy\n\nThis is educational support and works alongside, not instead of, care from your doctor."];
}
