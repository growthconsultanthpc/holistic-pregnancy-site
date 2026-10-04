import {toHTML} from '@portabletext/to-html'
import {pic} from './sanity'

// Portable Text -> safe HTML (the library escapes text). Used by legal pages and blog posts.
export const renderPT = (blocks: any[] = []) =>
  toHTML(blocks, {
    components: {
      types: {
        image: ({value}: any) => {
          const i = pic(value, [480, 800, 1200], '(max-width: 800px) 100vw, 760px')
          return i ? `<img src="${i.src}" srcset="${i.srcset}" sizes="${i.sizes}" alt="${i.alt.replace(/"/g, '&quot;')}" width="${i.width}" height="${i.height}" loading="lazy" />` : ''
        },
      },
    },
  })
