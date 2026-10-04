# Airtable base prompts

Airtable's prompt box truncates near 2,000 characters, so paste these **one at a time, in order**. Field and option names are exact: the PHP writes to them. Source: PRD §6, G23.

## Prompt 1: table and fields (1266 chars)
```
Create a base "Holistic Pregnancy CRM" with ONE table named "Leads" (no other tables, no linked records, no automations). Use these EXACT field and option names, in this order:
Name (primary, text); Phone (text); Email (email);
Stage (single select: Planning a pregnancy, Currently pregnant, Not sure yet);
Lead type (select: Free session, Enrol, Contact, Manual);
Programme (select: Preconception Program, 21 Days of Dincharya, Power of 11, Holistic Pathshala);
Source (select: Website, Instagram, WhatsApp, Referral, Event, Other);
UTM source, UTM medium, UTM campaign, Landing page (text);
Question (long text);
Preferred call time (select: Morning, Afternoon, Evening);
Consent given (checkbox); Consent time (date+time, 24h);
Confirmation email sent (checkbox);
Submissions (integer); Submission log (long text);
First submitted, Last submitted (date+time, 24h);
Status (select, default New: New, Contacted, Payment pending, Paid, Enrolled, Closed / Not interested);
Payment status (select, default Not due: Not due, Pending, Paid, Refunded);
Amount paid (currency INR, no decimals); Payment date (date); Payment note (long text);
Assigned to (collaborator); Call notes (long text); Next follow-up (date); Created (created time).
Add 3 rows with "TEST" in Name.
```

## Prompt 2: views (646 chars)
```
In the Leads table create these views: "All leads" (grid, newest Created first); "New - to call" (Status is New); "Follow up today" (Next follow-up is today or earlier, Status not Enrolled or Closed / Not interested); "Payment pending" (Payment status is Pending); "Pipeline" (kanban grouped by Status, card: Name, Programme, Phone, Payment status); "By source" (grouped by Source); "By programme" (grouped by Programme); "Paid" (Payment status is Paid); "Manual entries" (Lead type is Manual). In every view except All leads hide: UTM source, UTM medium, UTM campaign, Landing page, Submission log, Consent time, First submitted, Last submitted.
```

## Prompt 3: dashboard (374 chars)
```
Create an Interface "Overview" for the Leads table with: total leads, new leads this week, bar charts of leads by Source, by Programme and by Status, Payment status counts, sum of Amount paid, line chart of leads created per week, and a number "Records used (of 1,000)" in warning colour above 800. Add a page "Today" listing the "New - to call" and "Follow up today" views.
```

## After Airtable builds it
1. Check every field name and option against Prompt 1 (Airtable's AI sometimes renames or adds fields).
2. Create a Personal Access Token (scopes `data.records:read`, `data.records:write`, this base only), owned by the client's Airtable account. Keep it only in Hostinger server config.
3. Note the Base ID (`app...`) and table name `Leads`.
4. Delete the TEST rows before launch.
