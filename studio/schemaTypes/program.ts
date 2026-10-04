import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {faqRefs, image, limit, seo, strings} from './shared'

const sessionItem = defineType({
  name: 'sessionItem',
  title: 'Session',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required().max(70).warning()}),
    defineField({name: 'summary', title: 'Short description', type: 'text', rows: 3, validation: limit(220)}),
    defineField({name: 'duration', title: 'Length (optional)', type: 'string', description: 'e.g. 60 min', validation: limit(20)}),
  ],
  preview: {select: {title: 'title', subtitle: 'duration'}},
})

const titledText = (name: string, title: string, max: number) =>
  defineField({
    name,
    title,
    type: 'array',
    validation: (r) => r.max(max),
    of: [
      defineArrayMember({
        type: 'object',
        fields: [
          defineField({name: 'title', type: 'string', validation: (r) => r.required().max(60).warning()}),
          defineField({name: 'text', type: 'text', rows: 2, validation: limit(140)}),
        ],
        preview: {select: {title: 'title', subtitle: 'text'}},
      }),
    ],
  })

export const program = defineType({
  name: 'program',
  title: 'Programme',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'card', title: 'Card & hero', default: true},
    {name: 'detail', title: 'Page content'},
    {name: 'plan', title: 'Session plan'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'card', validation: (r) => r.required()}),
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
    defineField({
      name: 'layout',
      title: 'Page layout',
      type: 'string',
      group: 'card',
      readOnly: true,
      description: 'Fixed by the developer.',
      initialValue: 'standard',
      options: {list: [{title: 'Standard', value: 'standard'}, {title: 'Pathshala (trimester roadmap)', value: 'pathshala'}]},
    }),
    defineField({name: 'tag', title: 'Small tag on the card', type: 'string', group: 'card', description: 'e.g. Planning a baby', validation: limit(32)}),
    defineField({name: 'price', title: 'Price (₹)', type: 'number', group: 'card', validation: (r) => r.required().integer().min(0)}),
    defineField({name: 'meta', title: 'Sessions line', type: 'string', group: 'card', description: 'e.g. 6 sessions · 60 min', validation: limit(40)}),
    image('cardImage', 'Card image', 'Shown on the home page card.'),
    image('heroImage', 'Page hero image'),
    strings('cardBullets', 'Card bullets (2 short lines)', {max: 2, len: 40}),
    defineField({name: 'intro', title: 'Page intro', type: 'text', rows: 3, group: 'detail', validation: limit(240)}),
    defineField({name: 'ctaLabel', title: 'Enrol button text', type: 'string', group: 'detail', initialValue: 'Enroll Now', validation: limit(24)}),

    defineField({name: 'whoIntro', title: 'Who should join: text', type: 'text', rows: 3, group: 'detail', validation: limit(220)}),
    defineField({name: 'whoNote', title: 'Who should join: highlighted note (optional)', type: 'string', group: 'detail', validation: limit(70)}),
    strings('questions', 'Questions on your mind', {max: 5, len: 110}),
    titledText('covers', 'What the programme covers', 6),
    defineField({name: 'gain', title: 'What you will gain', type: 'text', rows: 4, group: 'detail', validation: limit(320)}),
    strings('howPills', 'How it works (short pills)', {max: 5, len: 32}),
    strings('priceBullets', 'Price box bullets', {max: 4, len: 50}),
    defineField({name: 'priceNote', title: 'Note under the price', type: 'string', group: 'detail', initialValue: 'Our team will call you to confirm your seat.', validation: limit(90)}),
    titledText('trimesters', 'Trimester roadmap (Pathshala only)', 3),

    defineField({name: 'planHeading', title: 'Heading', type: 'string', group: 'plan', initialValue: 'Your session plan'}),
    defineField({name: 'planIntro', title: 'Intro (optional)', type: 'text', rows: 2, group: 'plan', validation: limit(200)}),
    defineField({name: 'sessions', title: 'Sessions (drag to reorder)', type: 'array', group: 'plan', of: [defineArrayMember({type: 'sessionItem'})]}),
    defineField({
      name: 'planIsPlaceholder',
      title: 'This session plan is placeholder content',
      type: 'boolean',
      group: 'plan',
      initialValue: false,
      description: 'ON = shown on staging only and hidden on the live site. Turn OFF once the real plan is entered.',
    }),

    {...faqRefs, group: 'detail'},
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  orderings: [{title: 'Site order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'meta', media: 'cardImage'}},
})
export {sessionItem}
