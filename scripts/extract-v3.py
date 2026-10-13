#!/usr/bin/env python3
"""One-off: turn the client's v3 rendered pages (reference/v3_design/rendered/r_*.html) into build-ready HTML fragments
in src/client/pages/, plus the FAQ copy (scripts/v3-faqs.json) that migrate-v3 loads into Sanity. Re-runnable."""
import re, json, pathlib
R = pathlib.Path('reference/v3_design/rendered'); OUT = pathlib.Path('src/client/pages'); OUT.mkdir(parents=True, exist_ok=True)

def cut_section(h, pred):
    """Replace every top-level <section ...>...</section> whose opening tag satisfies pred by a marker the page component fills."""
    return re.sub(r'<section([^>]*)>.*?</section>', lambda m: ('<!--LADDER-->' if 'lad-wrap' in m.group(1) else '<!--TESTIMONIALS-->') if pred(m.group(1)) else m.group(0), h, flags=re.S)

def faqs(h):
    m = re.search(r'<div class="faq">(.*?)</section>', h, re.S)
    if not m: return []
    txt = lambda x: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', re.sub(r'</p>|<br ?/?>', '\n', x))).strip()
    return [[txt(q), re.sub(r' *\n *', ' ', re.sub(r'<[^>]+>', '', re.sub(r'</p>|<br ?/?>', '\n', a))).strip()] for q, a in re.findall(r'<summary>(.*?)</summary>(.*?)</details>', m.group(1), re.S)]

def clean(h, slug=None):
    h = re.sub(r'\sstyle="transition-delay:[^"]*"', '', h)
    h = re.sub(r'\bclass="([^"]*)"', lambda m: 'class="' + re.sub(r'\brv\b', 'reveal', m.group(1)) + '"', h)
    h = re.sub(r'class="btn p( [^"]*)?"', lambda m: f'class="btn btn-p{m.group(1) or ""}"', h)
    h = re.sub(r'class="btn o( [^"]*)?"', lambda m: f'class="btn btn-o{m.group(1) or ""}"', h)
    h = re.sub(r'href="#/checkout/([a-z0-9-]+)"', r'href="/enroll/\1/"', h)
    h = re.sub(r'href="(?:\.\./)?([a-z0-9-]+)/index\.html(#[^"]*)?"', lambda m: f'href="/{m.group(1)}/{m.group(2) or ""}"', h)
    h = h.replace('href="../"', 'href="/"')
    # offer price groups -> a [data-m] span that the live layer keeps in sync
    h = re.sub(r'<s class="cp-was">₹([\d,]+)</s>[^<]*<i class="cp-off">[^<]*</i>',
               lambda m: f'<span data-m="{m.group(1).replace(",", "")}"></span>', h)
    return h

def hero_fix(h):
    h = re.sub(r'<div class="im-hero2[^"]*"[^>]*></div>', '<!--HERO_IMG-->', h)
    h = re.sub(r'(<div class="hero2"><div class="w">)<div>', r'\1<div class="hero-copy">', h, count=1)
    return h

faq_out = {}
for slug in ['preconception', 'pathshala', 'dincharya', 'power-of-11']:
    raw = (R / f'r_{slug}.html').read_text()
    faq_out[slug] = faqs(raw)
    h = cut_section(raw, lambda a: 'lad-wrap' in a or 'tsx' in a)
    h = re.sub(r'<section class=""><div class="w"><div class="t[^"]*"[^>]*><h2>Questions.*?</section>', '<!--FAQ-->', h, flags=re.S)
    h = hero_fix(clean(h))
    (OUT / f'{slug}.html').write_text(h)
    print(slug, len(h), 'faqs', len(faq_out[slug]))

raw = (R / 'r_home.html').read_text()
faq_out['home'] = faqs(raw)
print('home faqs', len(faq_out['home']))
(pathlib.Path('scripts') / 'v3-faqs.json').write_text(json.dumps(faq_out, indent=1, ensure_ascii=False))

# about: whole page, hardcoded
a = (R / 'r_about.html').read_text()
(OUT / 'about.html').write_text(re.sub(r'<div class="fph im5"[^>]*></div>', '<!--FOUNDER_IMG-->', clean(a)))
# home extras
for name, cls in [('home-why', 'hp-why'), ('home-gs', 'hp-gs')]:
    m = re.search(r'<section class="[^"]*%s[^"]*">.*?</section>' % cls, raw, re.S)
    (OUT / f'{name}.html').write_text(clean(m.group(0)))
    print(name, len(m.group(0)))
m = re.search(r'<section id="about">.*?</section>', raw, re.S)
(OUT / 'home-founder.html').write_text(clean(m.group(0)))
print('founder', m.group(0)[:1500])
