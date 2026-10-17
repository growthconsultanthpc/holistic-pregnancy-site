#!/usr/bin/env python3
"""Client's four policy PDFs -> scripts/legal-v1.json (headings, paragraphs, bullets, bold runs) for studio/scripts/migrate-legal.ts.
Layout facts used: bullets are indented (x~20), paragraph gap >= 32pt vs 22.5pt line spacing, bullet gap ~28pt, headings are bold 16.7pt."""
import pypdf, json, sys, pathlib, re
DL = pathlib.Path.home() / 'Downloads'
FILES = {'privacy': '01_Privacy_Policy_Holistic_Pregnancy.pdf', 'terms': '02_Terms_and_Conditions_Holistic_Pregnancy.pdf',
         'refund': '03_Refund_and_Cancellation_Policy_Holistic_Pregnancy.pdf', 'medical-disclaimer': '04_Medical_Disclaimer_Holistic_Pregnancy.pdf'}
TITLES = {'privacy': 'Privacy Policy', 'terms': 'Terms & Conditions', 'refund': 'Refund and Cancellation Policy', 'medical-disclaimer': 'Medical Disclaimer'}

def page_lines(page):
    spans = []
    def v(text, cm, tm, fd, fs):
        if text.strip() == '': 
            if spans and text.strip() == '' and '\n' not in text and text: spans.append((round(tm[5], 1), round(tm[4], 1), spans[-1][2], round(fs, 1), text))
            return
        spans.append((round(tm[5], 1), round(tm[4], 1), 'Bold' in str((fd or {}).get('/BaseFont', '')), round(fs, 1), text))
    page.extract_text(visitor_text=v)
    rows = {}
    for y, x, b, fs, t in spans: rows.setdefault(y, []).append((x, b, fs, t))
    out = []
    for y in sorted(rows):
        sp = sorted(rows[y], key=lambda s: s[0]); runs = []
        for x, b, fs, t in sp:
            if runs and runs[-1][1] == b: runs[-1][0] += t
            else: runs.append([t, b])
        text = ''.join(r[0] for r in runs).strip()
        if text and not any(sp_[2] <= 11.5 for sp_ in sp) and not re.fullmatch(r'Page( \d+ of \d+)?|\d+ of \d+|of|\d+', text): out.append({'y': y, 'x': sp[0][0], 'fs': sp[0][2], 'runs': runs, 'text': text})
    return out

def parse(slug):
    blocks = []
    for pi, page in enumerate(pypdf.PdfReader(str(DL / FILES[slug])).pages):
        prev_y = None; first = True
        for ln in page_lines(page):
            t = ln['text']
            if ln['fs'] <= 11.5 or t.startswith('Page ') or t.startswith('Holistic Pregnancy Course |') or ln['fs'] >= 30: continue   # header strip, title, footer
            if ln['fs'] > 15 and ln['runs'][0][1]:                       # heading
                blocks.append({'t': 'h2', 'runs': [[t, False]]}); prev_y = ln['y']; first = False; continue
            gap = (ln['y'] - prev_y) if prev_y is not None else 99
            indent = ln['x'] > 10
            cont = gap < 25.5 and blocks and blocks[-1]['t'] != 'h2' and (blocks[-1]['t'] == 'li') == indent
            if first and pi > 0 and blocks and blocks[-1]['t'] != 'h2' and not blocks[-1]['runs'][-1][0].rstrip().endswith(('.', ':', ';', '?', '!', ')', '”', '"')) and (blocks[-1]['t'] == 'li') == indent:
                cont = True                                              # sentence continues across the page break
            if cont: blocks[-1]['runs'] += [[' ', False]] + [list(r) for r in ln['runs']]
            else: blocks.append({'t': 'li' if indent else 'p', 'runs': [list(r) for r in ln['runs']]})
            prev_y = ln['y']; first = False
    # tidy runs: merge same-style neighbours, trim spaces
    for b in blocks:
        merged = []
        for t, bold in b['runs']:
            if merged and merged[-1][1] == bold: merged[-1][0] += t
            else: merged.append([t, bold])
        s = ''.join(m[0] for m in merged)
        # a space between two bold words belongs to the bold run
        for i in range(1, len(merged) - 1):
            if merged[i][0].strip() == '' and merged[i - 1][1] and merged[i + 1][1]: merged[i][1] = True
        m2 = []
        for t, bold in merged:
            if m2 and m2[-1][1] == bold: m2[-1][0] += t
            else: m2.append([t, bold])
        b['runs'] = m2
        b['runs'][0][0] = b['runs'][0][0].lstrip(); b['runs'][-1][0] = b['runs'][-1][0].rstrip()
    return blocks

out = {s: {'title': TITLES[s], 'blocks': parse(s)} for s in FILES}
pathlib.Path('scripts/legal-v1.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
for s, d in out.items():
    print(s, len(d['blocks']), 'blocks:', {k: sum(1 for b in d['blocks'] if b['t'] == k) for k in ('h2', 'p', 'li')})
