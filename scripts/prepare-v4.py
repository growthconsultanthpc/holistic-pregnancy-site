#!/usr/bin/env python3
"""Turn the client's V4 pages (V4_HPCWebsite/*/index.html) into build templates in src/v4/.
Static changes only (no Sanity data here): swaps WhatsApp form handling for our lead endpoint, referral codes for the
server-made ones, session/spots fetches for the Sanity API, adds consent boxes, and puts @@TOKENS@@ where Sanity data goes.
Re-runnable. Every patch must match or the script stops, so a changed V4 file never silently skips a patch."""
import re, pathlib, sys
SRC = pathlib.Path('V4_HPCWebsite'); OUT = pathlib.Path('src/v4'); OUT.mkdir(parents=True, exist_ok=True)
ROUTES = ['', 'preconception', 'dincharya', 'power-of-11', 'pathshala', 'postpartum', 'sessions', 'free-session', 'about', 'offer', 'refer', 'community', 'contact']

def end_of_object(h, i):
    """index just after the } that closes the { at h[i]; skips strings and comments."""
    d = 0; n = len(h); q = None
    while i < n:
        c = h[i]
        if q:
            if c == '\\': i += 1
            elif c == q: q = None
        elif c in '\'"': q = c
        elif h.startswith('/*', i): i = h.index('*/', i) + 1
        elif h.startswith('//', i) and h[i-1] != ':': i = h.index('\n', i)
        elif c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return i + 1
        i += 1
    raise ValueError('unclosed object')

def must(h, old, new, label, count=1):
    if old not in h: sys.exit(f'PATCH FAILED ({label}): pattern not found')
    return h.replace(old, new, count)

def between(h, a, b, new, label):
    i = h.find(a); 
    if i < 0: sys.exit(f'PATCH FAILED ({label}): start not found')
    j = h.index(b, i) + len(b)
    return h[:i] + new + h[j:]

CHECKOUT = r"""$('co-s1').addEventListener('submit',function(e){e.preventDefault();var f=e.target,n=f.name.value.trim(),p=f.phone.value.replace(/[^0-9+]/g,''),em=f.email.value.trim(),err='';
if(n.length<2)err='Please enter your name.';else if(p.replace(/\D/g,'').length<10)err='Please enter a valid WhatsApp number.';else if(!/^\S+@\S+\.\S+$/.test(em))err='Please enter a valid email address.';else if(!f.consent.checked)err='Please tick the box to agree to be contacted.';
$('co-err1').textContent=err;if(err)return;st.d={name:n,phone:p,email:em,time:f.time?f.time.value:''};var pr=PROGS[st.k],btn=$('co-s1btn'),lab=btn.textContent;btn.disabled=true;btn.textContent='Sending…';
hpcSend({type:'Enrol',formName:'Enrol: '+pr.n,programme:st.k,name:n,phone:p,email:em,call_time:st.d.time,ref_code:f.ref?f.ref.value:'',price:pr.p,form:f}).then(function(r){btn.disabled=false;btn.textContent=lab;
if(!r.ok){$('co-err1').textContent=r.msg;return}
$('co-fn').textContent=n.split(' ')[0];$('co-dn').textContent=pr.n;step(4);document.querySelectorAll('.co-steps li').forEach(function(li){var k=+li.dataset.s;li.classList.toggle('done',k===1);li.classList.toggle('on',k===2)})})});"""

GENERIC = r"""document.querySelectorAll('form.form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();
var pg=(f.closest('.pg')||{}).id||'',ok=f.querySelector('.ok'),btn=f.querySelector('button[type=submit]'),lab=btn&&btn.textContent,g=function(n){var i=f.elements.namedItem(n);return i?i.value.trim():''};
if(ok&&!ok.dataset.t)ok.dataset.t=ok.textContent;var cons=f.elements.namedItem('consent');if(cons&&!cons.checked){f.reportValidity&&f.reportValidity();return}
var isCC=f.classList.contains('cc-form'),isFS=f.classList.contains('fs-form'),isPP=f.classList.contains('pp-form'),type=isCC||isFS?'Free session':'Contact';
var fname=isPP?'Post-partum waitlist':isCC?'Conscious Conception (free session)':isFS?(pg==='p-home'?'Home: free session':'Free session page'):'Contact page: call back';
if(btn){btn.disabled=true;btn.textContent='Sending…'}
hpcSend({type:type,programme:isCC?'preconception':'',name:g('name'),phone:g('phone'),email:g('email'),stage:g('stage'),question:isPP?'Post-partum waitlist. Where: '+g('where'):g('q')||(isCC?'Joining as: '+g('joining'):''),formName:fname,call_time:g('time'),form:f}).then(function(r){
if(btn){btn.disabled=false;btn.textContent=lab}
if(!r.ok){var er=f.querySelector('.cp-err')||ok;if(ok){ok.textContent=r.msg;ok.style.display='block';ok.style.color='#c0392b'}return}
if(ok){Array.prototype.forEach.call(f.children,function(c){if(c!==ok)c.style.setProperty('display','none','important')});ok.textContent=ok.dataset.t;ok.style.cssText='display:block;grid-column:1/-1;text-align:center;padding:36px 8px;font:600 22px/1.4 Playfair Display,serif;color:var(--ink)';if(f.getBoundingClientRect().top<0)f.scrollIntoView({behavior:'smooth',block:'center'})}if(window.trackLead)trackLead()})},true)});"""

CPFORM = r"""document.getElementById('cp-form').addEventListener('submit',function(e){e.preventDefault();e.stopPropagation();var f=e.target,n=f.name.value.trim(),p=f.phone.value.replace(/[^0-9+]/g,''),er=f.querySelector('.cp-err');
 var em=f.email.value.trim();if(n.length<2){er.textContent='Please enter your name.';return}if(p.replace(/\D/g,'').length<10){er.textContent='Please enter a valid WhatsApp number.';return}if(!/^\S+@\S+\.\S+$/.test(em)){er.textContent='Please enter a valid email address.';return}if(!f.consent.checked){er.textContent='Please tick the box to agree to be contacted.';return}er.textContent='';
 var b=f.querySelector('button[type=submit]');b.disabled=true;
 hpcSend({type:'Contact',formName:'Offer page: call back',name:n,phone:p,email:em,question:'Offer enquiry. Interested in: '+f.prog.value,form:f}).then(function(r){b.disabled=false;if(!r.ok){er.textContent=r.msg;return}if(window.trackLead)trackLead();
 f.innerHTML='<h3 style="margin:0 0 6px">Thank you, '+n.split(' ')[0].replace(/[<&>"]/g,'')+'!</h3><p style="margin:0;color:var(--muted)">Thanks for submitting your info. We will get back to you shortly.</p>'})});"""

REFCODE = r"""er.textContent='';var b=fm.querySelector('button[type=submit]');b.disabled=true;enr=fm.enr.value==='y';
 document.getElementById('rf-yours').innerHTML=enr?'When a friend enrolls, you get <b>'+RW+' off</b> your course.':'When a friend enrolls, you get <b>'+GIFT+'</b>.';
 var fd=new FormData();fd.append('name',n);fd.append('phone',p);fd.append('in_program',enr?'Yes':'Not yet');fd.append('consent','1');fd.append('website','');
 fetch(window.HPC_REF_ENDPOINT,{method:'POST',body:fd}).then(function(r){return r.json().catch(function(){return {}})}).then(function(j){b.disabled=false;
  if(!j.ok||!j.code){er.textContent=j&&j.error==='rate'?'Too many tries. Please wait a few minutes.':'We could not create your code just now. Please try again, or message us on WhatsApp.';return}
  code=j.code;var origin=R.siteUrl||(location.origin+location.pathname);link=origin+'?ref='+code+'#/';
  msg=(window.HPC_REF_MSG||'Hi , I would like to refer you for a program at Holistic Pregnancy. Use this referral code {code} at {site} for their programs.').replace('{code}',code).replace('{site}',origin);show()}).catch(function(){b.disabled=false;er.textContent='We could not reach the server. Please try again, or message us on WhatsApp.'})},true);"""

def patch(h, route):
    # ---- 1. config objects -> tokens
    for name in ['CAMPAIGN', 'TESTIMONIALS', 'MUSIC', 'SESSIONS', 'FREE_SESSION', 'TRACK', 'REFERRAL', 'PAY', 'PROGS']:
        i = h.index(f'var {name}=') + len(f'var {name}=')
        j = end_of_object(h, i)
        h = h[:i] + f'@@{name}@@' + h[j:]
    # ---- 2. checkout, forms, offer-page form, referral code
    h = between(h, "$('co-s1').addEventListener('submit'", "step(2)});", CHECKOUT, 'checkout')
    h = between(h, "document.querySelectorAll('form.form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();\nvar pg=", "},true)});", GENERIC, 'forms')
    h = between(h, "document.getElementById('cp-form').addEventListener('submit'", "within one working day.</p>'});", CPFORM, 'cp-form')
    h = between(h, "er.textContent='';enr=fm.enr.value==='y';", "show()},true);", REFCODE, 'referral')
    h = must(h, "replace(/[^A-Z0-9]/g,'').slice(0,14)", "replace(/[^A-Z0-9-]/g,'').slice(0,14)", 'ref clean keeps the hyphen')
    h = must(h, "var link='',code='',enr=true;", "var link='',code='',enr=true,msg='';", 'ref vars')
    # referral output: show the message box; share + copy use the message
    h = must(h, '<p class="rf-k">Your referral link</p><div class="rf-link" id="rf-link"></div>', '<p class="rf-k">Your referral link</p><div class="rf-link" id="rf-link"></div><p class="rf-k">Referral message</p><div class="rf-link" id="rf-msg" style="white-space:pre-wrap"></div>', 'rf msg box')
    h = must(h, "document.getElementById('rf-link').textContent=link}", "document.getElementById('rf-link').textContent=link;document.getElementById('rf-msg').textContent=msg}", 'rf show')
    h = between(h, "document.getElementById('rf-wa').addEventListener('click',function(){var m=", "var u='https://wa.me/?text='", "document.getElementById('rf-wa').addEventListener('click',function(){var m=msg;var u='https://wa.me/?text='", 'rf share')
    h = must(h, "navigator.clipboard.writeText(link).then(done,done)", "navigator.clipboard.writeText(msg).then(done,done)", 'rf copy')
    h = must(h, "a.value=link;", "a.value=msg;", 'rf copy2')
    h = must(h, "b.textContent='Copy link'", "b.textContent='Copy message'", 'rf label')
    h = must(h, '>Copy link</button>', '>Copy message</button>', 'rf label html')
    # ---- 3. live session + spots from Sanity instead of /admin/ json
    h = must(h, "fetch('/session.json?ts='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null})", "fetch(window.HPC_SESSION_URL).then(function(r){return r.ok?r.json():null}).then(window.hpcSession)", 'session fetch')
    h = must(h, "fetch('/offer.json?ts='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null})", "fetch(window.HPC_OFFER_URL).then(function(r){return r.ok?r.json():null}).then(function(j){return j&&j.result})", 'offer fetch')
    # ---- 4. consent boxes where V4 has none (data-protection rule: every lead form)
    box = '<label class="f cons"><input type="checkbox" name="consent" value="1" required> I agree to be contacted on WhatsApp, phone and email about my request. <a href="/privacy/">Privacy Policy</a></label>'
    h = h.replace('<label class="f cons"><input type="checkbox" required> I agree to be contacted on WhatsApp and email about this session. <a href="/">Privacy Policy</a></label>', box)
    h = h.replace('<label class="cons"><input type="checkbox" required> I agree to be contacted on WhatsApp about this session.</label>', box.replace('class="f cons"', 'class="cons"'))
    h = h.replace('<button class="btn p f" type="submit">Reserve My Free Spot</button>', box + '<button class="btn p f" type="submit">Reserve My Free Spot</button>')
    h = h.replace('<button class="btn p f" type="submit">Request a Call</button>', box + '<button class="btn p f" type="submit">Request a Call</button>')
    h = h.replace('<p class="co-err" id="co-err1"', box + '<p class="co-err" id="co-err1"')
    h = h.replace('''<button class="btn p" type="submit" style="width:100%">Request a call back</button>''', box + '''<button class="btn p" type="submit" style="width:100%">Request a call back</button>''')
    h = h.replace('<form class="form fs-form"><label>Name', '<form class="form fs-form"><label>Name')  # home form keeps its own markup
    # ---- 4b. one thank-you line for every lead form, and an email box on every form (everyone gets a confirmation email)
    THANKS = 'Thanks for submitting your info. We will get back to you shortly.'
    h = re.sub(r'(<p class="ok" role="status">)[^<]*(</p>)', r'\g<1>' + THANKS + r'\g<2>', h)
    em = '<label class="f">Email<input name="email" type="email" required autocomplete="email" placeholder="you@example.com"></label>'
    h = h.replace('<label>Phone / WhatsApp<input name="phone" type="tel" required autocomplete="tel" placeholder="+91"></label>', '<label>Phone / WhatsApp<input name="phone" type="tel" required autocomplete="tel" placeholder="+91"></label>' + em)   # home free-session form
    h = h.replace('<label>Phone / WhatsApp<input name="phone" type="tel" placeholder="+91" required></label><label class="f">Email (optional)', '<label>Phone / WhatsApp<input name="phone" type="tel" placeholder="+91" required></label><label class="f">Email (optional)')
    h = h.replace('<label class="f">Email (optional)<input name="email" type="email" placeholder="you@example.com"></label>', em)                                   # contact form
    h = h.replace('<label>Phone / WhatsApp<input name="phone" type="tel" placeholder="+91" required></label><label class="f">Stage', '<label>Phone / WhatsApp<input name="phone" type="tel" placeholder="+91" required></label>' + em + '<label class="f">Stage')  # free-session page
    h = h.replace('<label>WhatsApp number<input name="phone" type="tel" autocomplete="tel" placeholder="+91" required></label>\n  <label>Joining as', '<label>WhatsApp number<input name="phone" type="tel" autocomplete="tel" placeholder="+91" required></label>\n  ' + em + '\n  <label>Joining as')  # conscious conception form
    h = h.replace('<label>WhatsApp number<input name="phone" type="tel" required autocomplete="tel"></label><label>Interested in', '<label>WhatsApp number<input name="phone" type="tel" required autocomplete="tel"></label>' + em + '<label>Interested in')  # offer call-back
    h = h.replace('<label>Email (optional)<input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>', '<label>Email<input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label>')  # checkout
    h = must(h, "<details><summary>What is this offer?</summary><p>25% off any one program", "<details><summary>What is this offer?</summary><p>'+C.discount.value+'% off any one program", 'offer faq percent')
    h = h.replace('<label>Where are you right now?<select name="stage" required>', em + '<label>Where are you right now?<select name="where" required>')   # post-partum waitlist: email box; the answer is a note, not the Stage list
    h = h.replace('<label class="cons"><input type="checkbox" required> I agree to be contacted on WhatsApp about this program.</label>', box.replace('class="f cons"', 'class="cons"'))
    for _ in range(3): h = h.replace(box + box, box).replace(box.replace('class="f cons"', 'class="cons"') * 2, box.replace('class="f cons"', 'class="cons"'))   # never two consent boxes in one form
    # referral form: consent tick (its answer used to be sent without asking)
    h = h.replace('<button class="btn p" type="submit">Get my referral code</button>', box.replace('class="f cons"', 'class="cons"') + '<button class="btn p" type="submit">Get my referral code</button>')
    h = h.replace("if(!fm.enr.value){er.textContent='Please tell us if you are in a program.';return}", "if(!fm.enr.value){er.textContent='Please tell us if you are in a program.';return}if(!fm.consent.checked){er.textContent='Please tick the box to agree to be contacted.';return}")
    # ---- 5. footer: real legal links, blog link token
    h = must(h, 'Privacy Policy · Terms · Refund Policy · Medical Disclaimer', '<a href="/privacy/">Privacy Policy</a> · <a href="/terms/">Terms</a> · <a href="/refund/">Refund Policy</a> · <a href="/medical-disclaimer/">Medical Disclaimer</a>', 'footer legal')
    h = must(h, '<a href="https://geethabafna.com" target="_blank" rel="noopener">Blog</a>', '@@BLOGLINK@@', 'blog link')
    # ---- 6. editable FAQ blocks + FAQ schema + fonts + head switches
    m = re.search(r'<div class="faq">(?:\s*<details.*?</details>)+\s*</div>', h[:h.index('</main>')], re.S)
    if m: h = h[:m.start()] + '@@FAQ@@' + h[m.end():]
    elif route in ('', 'preconception', 'dincharya', 'power-of-11', 'pathshala', 'contact', 'free-session'): sys.exit(f'PATCH FAILED (faq): {route}')
    h = re.sub(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "FAQPage".*?</script>', '@@FAQLD@@', h, flags=re.S)
    h = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">|<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>|<link href="https://fonts\.googleapis\.com[^>]*>', '', h)
    h, nr = re.subn(r'<meta name="robots" content="([^"]*)">', r'@@ROBOTS:\1@@', h)
    if nr != 1: sys.exit('PATCH FAILED (robots)')
    h = must(h, '<meta name="color-scheme" content="light only">', '<meta name="color-scheme" content="light only">@@FONTS@@', 'fonts')
    # accessibility, no visual change: the duplicate ticker copy is hidden from keyboards too; footer headings follow the page headings
    h = h.replace('<div class="tk-t" aria-hidden="true">', '<div class="tk-t" aria-hidden="true" inert>')
    h = re.sub(r'<h4>(Programs|About|Follow)</h4>', r'<h4 role="heading" aria-level="3">\1</h4>', h)
    h = must(h, '</body>', '@@ENDBODY@@</body>', 'end body')
    if route == '':  # the LCP image as a real <img> (a CSS background is found late and loads at lower priority)
        h = re.sub(r'(<div class="arch im10"[^>]*>)</div>', r'\1<img src="/img/im10.webp" alt="" width="760" height="1140" fetchpriority="high" decoding="async"></div>', h, count=1)
    return h

for r in ROUTES:
    src = SRC / (f'{r}/index.html' if r else 'index.html')
    out = patch(src.read_text(), r)
    ids = lambda t: set(re.findall(r' id="([^"]+)"', t))
    lost = ids(src.read_text()) - ids(out)
    if lost: sys.exit(f'INTEGRITY: {r or "home"} lost element ids {sorted(lost)[:8]}')
    (OUT / ((r or 'home') + '.html')).write_text(out)
    print('ok', r or 'home', len(out))
