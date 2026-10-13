import {aboutPage, communityPage, contactPage, freeSessionPage, homePage, thankYouPages} from './pages'
import {author, category, faq, legalPage, post, testimonial} from './content'
import {program} from './program'
import {barMessage, emailTemplate, seo} from './shared'
import {nextSession, offer, siteSettings} from './siteSettings'

export const schemaTypes = [
  // objects
  seo, emailTemplate, barMessage,
  // single pages (one each; see structure.ts)
  siteSettings, nextSession, offer, homePage, aboutPage, communityPage, contactPage, freeSessionPage, thankYouPages,
  // collections
  program, faq, testimonial, legalPage, post, author, category,
]
