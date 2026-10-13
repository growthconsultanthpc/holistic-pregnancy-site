import type {StructureResolver} from 'sanity/structure'

// Locked layout (PRD G18): single pages are fixed documents; programmes and legal pages cannot be added or deleted here.
export const SINGLETONS = ['siteSettings', 'nextSession', 'offer', 'homePage', 'aboutPage', 'communityPage', 'contactPage', 'freeSessionPage', 'thankYouPages']
export const NO_CREATE = [...SINGLETONS, 'program', 'legalPage']
export const NO_DELETE = [...NO_CREATE]

const single = (S: any, id: string, title: string) => S.listItem().title(title).id(id).child(S.document().schemaType(id).documentId(id).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Website content')
    .items([
      single(S, 'nextSession', 'Next free session'),
      single(S, 'offer', 'Offer & discount'),
      single(S, 'siteSettings', 'Site settings'),
      S.divider(),
      single(S, 'homePage', 'Home page'),
      S.documentTypeListItem('program').title('Programmes'),
      single(S, 'aboutPage', 'About (Our Story)'),
      single(S, 'communityPage', 'Community'),
      single(S, 'contactPage', 'Get in touch'),
      single(S, 'freeSessionPage', 'Free session page'),
      single(S, 'thankYouPages', 'Thank-you pages'),
      S.divider(),
      S.documentTypeListItem('faq').title('FAQs'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      S.documentTypeListItem('legalPage').title('Legal pages'),
      S.divider(),
      S.listItem().title('Blog').child(S.list().title('Blog').items([
        S.documentTypeListItem('post').title('Posts'),
        S.documentTypeListItem('author').title('Authors'),
        S.documentTypeListItem('category').title('Categories'),
      ])),
    ])
