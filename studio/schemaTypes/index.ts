import {aboutPage, communityPage, contactPage, freeSessionPage, homePage, thankYouPages} from './pages'
import {author, category, faq, legalPage, post, testimonial} from './content'
import {program, sessionItem} from './program'
import {emailTemplate, seo} from './shared'
import {nextSession, siteSettings} from './siteSettings'

export const schemaTypes = [
  // objects
  seo, emailTemplate, sessionItem,
  // single pages (one each; see structure.ts)
  siteSettings, nextSession, homePage, aboutPage, communityPage, contactPage, freeSessionPage, thankYouPages,
  // collections
  program, faq, testimonial, legalPage, post, author, category,
]
