import {toHTML} from '@portabletext/to-html'
import {pic} from './sanity'

const esc = (t = '') => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Portable Text -> safe HTML (the library escapes text). Used by legal pages and blog posts.
export const renderPT = (blocks: any[] = []) =>
  toHTML(blocks, {
    components: {
      types: {
        pullQuote: ({value}: any) => `<blockquote class="pull"><p>${esc(value.text)}</p>${value.by ? `<cite>${esc(value.by)}</cite>` : ''}</blockquote>`,
        callout: ({value}: any) => `<aside class="callout">${value.title ? `<h3>${esc(value.title)}</h3>` : ''}<p>${esc(value.text)}</p></aside>`,
        image: ({value}: any) => {
          const i = pic(value, [480, 800, 1200], '(max-width: 800px) 100vw, 760px')
          return i ? `<img src="${i.src}" srcset="${i.srcset}" sizes="${i.sizes}" alt="${i.alt.replace(/"/g, '&quot;')}" width="${i.width}" height="${i.height}" loading="lazy" />` : ''
        },
      },
    },
  })

// Minutes to read, 200 words a minute
export const readMins = (blocks: any[] = []) => Math.max(1, Math.round(blocks.flatMap((b) => (b.children ?? []).map((c: any) => c.text ?? '')).join(' ').split(/\s+/).filter(Boolean).length / 200))
