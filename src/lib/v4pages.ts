// Inner HTML for the pages V4 does not have (legal, blog, 404), written in V4's own classes.
import { renderPT, readMins } from './pt'
import { pic, showPlaceholders } from './sanity'

const esc = (t = '') => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const when = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
const img = (i: any, widths: number[], sizes: string, cls = '', lazy = true) => {
  const p = pic(i, widths, sizes)
  return p ? `<img ${cls ? `class="${cls}" ` : ''}src="${p.src}" srcset="${p.srcset}" sizes="${p.sizes}" alt="${esc(p.alt)}" width="${p.width}" height="${p.height}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">` : ''
}

export const legalHtml = (page: any) => `<section class="sx"><div class="w legal">
<h1>${esc(page.title)}</h1><p class="lg-meta">Last updated ${when(page.lastUpdated)}</p>
${page.status !== 'approved' && showPlaceholders ? '<p class="draftflag"><b>Draft.</b> Not yet approved by the client. The live site cannot be published while this is a draft.</p>' : ''}
<div class="richtext">${renderPT(page.body)}</div></div></section>`

export const notFoundHtml = (s: any) => `<section class="sx"><div class="w" style="text-align:center;padding:60px 0">
<h1>${esc(s.notFoundHeading ?? "We couldn't find that page.")}</h1><p class="lead">${esc(s.notFoundText ?? 'Let us help you find the right program.')}</p>
<a class="btn p" href="/#programs">See our programs</a> <a class="btn o" href="/contact/">Book a Free Call</a></div></section>`

export function blogIndexHtml(posts: any[]) {
  const show = (() => { const pool = posts.filter((p) => p.featured); return pool.length ? pool[Math.floor(Math.random() * pool.length)] : posts[0] })()
  const rest = posts.filter((p) => p !== show)
  const cats = [...new Set(posts.flatMap((p) => p.categories ?? []))] as string[]
  return `<div class="hero2 c"><div class="w"><div><p class="sx-k">The Holistic Pregnancy journal</p><h1>Gentle reading for <em>every stage</em> of the journey</h1><p>Articles on preconception, pregnancy and early motherhood, from our team.</p></div></div></div>
<section class="sx"><div class="w">
${show ? `<a class="bl-show" href="/blog/${show.slug}/">${img(show.coverImage, [480, 800, 1200], '(max-width: 860px) 100vw, 560px', '', false)}<div class="bd"><span class="tag">Featured article</span><small>${esc((show.categories ?? []).join(' · '))}</small><h2>${esc(show.title)}</h2><p>${esc(show.excerpt)}</p><span class="bl-more">Read article →</span></div></a>` : ''}
${cats.length > 1 ? `<div class="chooser" role="group" aria-label="Filter articles"><button type="button" class="chip2" aria-pressed="true" data-cat="">All</button>${cats.map((c) => `<button type="button" class="chip2" aria-pressed="false" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
${rest.length ? `<div class="posts">${rest.map((p) => `<a class="post" href="/blog/${p.slug}/" data-cats="${esc((p.categories ?? []).join('|'))}">${img(p.coverImage, [320, 480, 640], '(max-width: 600px) 100vw, 33vw', 'im')}<div class="bd"><small>${esc((p.categories ?? []).join(' · '))} · ${readMins(p.body)} min read</small><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p></div></a>`).join('')}</div>` : ''}
</div></section>
<script>document.querySelectorAll('[data-cat]').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('[data-cat]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});document.querySelectorAll('.posts .post[data-cats]').forEach(function(p){p.hidden=!!b.dataset.cat&&p.dataset.cats.split('|').indexOf(b.dataset.cat)<0})})})</script>`
}

export function blogPostHtml(post: any, more: any[]) {
  return `<div class="hero2 c"><div class="w"><div><p class="sx-k">${esc((post.categories ?? []).join(' · ') || 'Journal')}</p><h1>${esc(post.title)}</h1>
<p class="bl-meta">${when(post.publishedAt)} · ${readMins(post.body)} min read${post.author ? ` · ${esc(post.author.name)}` : ''}</p>
${post.isPlaceholder ? '<p class="draftflag"><b>Dummy post.</b> Shown on staging only.</p>' : ''}</div></div></div>
<section class="sx"><div class="w bl-art">${img(post.coverImage, [480, 800, 1200], '(max-width: 800px) 100vw, 760px', 'bl-cover', false)}
<div class="richtext bl-body">${renderPT(post.body)}</div>
<div class="bl-cta"><h3>Begin with a free online session</h3><p>A live, friendly session to understand your stage and learn simple daily practices.</p><a class="btn p" href="/free-session/">Join the free session</a></div></div></section>
${more.length ? `<section class="sx blush"><div class="w"><div class="t"><h2>Keep reading</h2></div><div class="posts two">${more.map((p) => `<a class="post" href="/blog/${p.slug}/"><div class="bd"><small>${esc((p.categories ?? []).join(' · '))}</small><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p></div></a>`).join('')}</div></div></section>` : ''}`
}
