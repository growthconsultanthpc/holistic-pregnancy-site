import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {faqRefs, image, limit, seo, strings} from './shared'

// v2 (G37): the long-form narrative of each programme page lives in code (src/client/programs/<slug>.ts).
// This document holds what changes often or must stay consistent: names, prices, card + hero copy, button labels, FAQs, SEO.
export const program = defineType({
  name: 'program',
  title: 'Programme',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'card', title: 'Card & price', default: true},
    {name: 'hero', title: 'Page top'},
    {name: 'buttons', title: 'Buttons'},
    {name: 'faq', title: 'FAQs'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Programme name',
      type: 'string',
      group: 'card',
      description: 'Also used in emails and the lead table. Changing it also needs a developer change (the lead table must accept the new name).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'card',
      description: 'The web address. Locked once set; ask the developer to change it.',
      options: {source: 'title', maxLength: 40},
      readOnly: ({value}: any) => !!value?.current,
      validation: (r) => r.required(),
    }),
    defineField({name: 'order', title: 'Order on the site (1 = first)', type: 'number', group: 'card', validation: (r) => r.required().integer().min(1)}),
    defineField({name: 'signature', title: 'Show the "★ Our signature program" badge', type: 'boolean', group: 'card', initialValue: false}),
    defineField({name: 'tag', title: 'Small tag on the card', type: 'string', group: 'card', validation: limit(32)}),
    defineField({name: 'price', title: 'Full price (₹, before any offer)', type: 'number', group: 'card', validation: (r) => r.required().integer().min(0)}),
    defineField({name: 'cardMeta', title: 'Line under the price on the card', type: 'string', group: 'card', description: 'e.g. 21 weekly sessions', validation: limit(40)}),
    {...strings('cardBullets', 'Card bullets (2 short lines)', {max: 2, len: 44}), group: 'card'},
    {...image('cardImage', 'Card image', 'Shown on the home page card.'), group: 'card'},
    {...strings('priceBullets', 'Price box bullets (up to 4)', {max: 4, len: 50}), group: 'card'},
    defineField({
      name: 'inLadder',
      title: 'Show in the "Our pregnancy programs" strip',
      type: 'boolean',
      group: 'card',
      initialValue: false,
      description: 'ON for pregnancy programmes. The strip appears on those pages.',
    }),
    defineField({name: 'ladderNote', title: 'Line in that strip', type: 'string', group: 'card', description: 'e.g. Habit-forming · any trimester', validation: limit(44)}),

    defineField({name: 'eyebrow', title: 'Small line above the headline', type: 'string', group: 'hero', validation: limit(40)}),
    defineField({name: 'heroBefore', title: 'Headline: start', type: 'string', group: 'hero', validation: limit(80)}),
    defineField({name: 'heroHighlight', title: 'Headline: highlighted words (italic, coloured)', type: 'string', group: 'hero', validation: limit(60)}),
    defineField({name: 'heroAfter', title: 'Headline: end (optional)', type: 'string', group: 'hero', validation: limit(60)}),
    defineField({name: 'heroLead', title: 'Intro under the headline', type: 'text', rows: 3, group: 'hero', validation: limit(240)}),
    defineField({name: 'heroMeta', title: 'Details line before the price', type: 'string', group: 'hero', description: 'e.g. 6 live sessions · 60 min each · Online', validation: limit(70)}),
    {...image('heroImage', 'Page hero image'), group: 'hero'},

    defineField({name: 'primaryLabel', title: 'Main button text (goes to the enrol form)', type: 'string', group: 'buttons', initialValue: 'Enroll Now', validation: limit(40)}),
    defineField({name: 'secondaryLabel', title: 'Second button text', type: 'string', group: 'buttons', validation: limit(40)}),
    defineField({
      name: 'secondaryType',
      title: 'Where does the second button go?',
      type: 'string',
      group: 'buttons',
      initialValue: 'contact',
      options: {layout: 'radio', list: [{title: 'Calendly (book a time)', value: 'calendly'}, {title: 'Get in touch page (call-back form)', value: 'contact'}]},
    }),
    defineField({name: 'closePrimaryLabel', title: 'Main button text at the bottom of the page', type: 'string', group: 'buttons', validation: limit(48)}),

    {...faqRefs, group: 'faq'},
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  orderings: [{title: 'Site order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'cardMeta', media: 'cardImage'}},
})
