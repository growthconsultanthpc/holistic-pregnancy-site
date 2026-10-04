import {HomeIcon} from '@sanity/icons/Home'
import {DocumentIcon} from '@sanity/icons/Document'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {faqRefs, image, limit, seo, strings} from './shared'

const text = (name: string, title: string, max: number, extra: Record<string, unknown> = {}) =>
  defineField({name, title, type: 'text', rows: 3, validation: limit(max), ...extra})
const str = (name: string, title: string, max: number, extra: Record<string, unknown> = {}) =>
  defineField({name, title, type: 'string', validation: limit(max), ...extra})

const titledList = (name: string, title: string, max: number, withText = true) =>
  defineField({
    name,
    title,
    type: 'array',
    validation: (r) => r.max(max),
    of: [
      defineArrayMember({
        type: 'object',
        fields: [
          defineField({name: 'title', type: 'string', validation: (r) => r.required().max(50).warning()}),
          ...(withText ? [defineField({name: 'text', type: 'text', rows: 2, validation: limit(140)})] : []),
        ],
        preview: {select: {title: 'title', subtitle: 'text'}},
      }),
    ],
  })

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'programmes', title: 'Programmes'},
    {name: 'founder', title: 'Founder'},
    {name: 'free', title: 'Free session'},
    {name: 'faq', title: 'FAQ'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    str('heroBefore', 'Headline: start', 40, {group: 'hero', initialValue: 'A'}),
    str('heroHighlight', 'Headline: highlighted words (italic)', 40, {group: 'hero', initialValue: 'calmer, healthier'}),
    str('heroAfter', 'Headline: end', 60, {group: 'hero', initialValue: 'journey into parenthood.'}),
    text('heroLead', 'Intro under the headline', 180, {group: 'hero'}),
    str('heroPrimaryLabel', 'First button text (goes to programmes)', 24, {group: 'hero', initialValue: 'Explore Programs'}),
    str('heroSecondaryLabel', 'Second button text (opens Calendly)', 24, {group: 'hero', initialValue: 'Book a Free Call'}),
    image('heroImage', 'Hero image'),
    strings('heroBadges', 'Three small badges', {max: 3, len: 24}),
    strings('trustItems', 'Trust bar items (4)', {max: 4, len: 36}),

    str('programmesHeading', 'Heading', 60, {group: 'programmes', initialValue: 'Support designed for your stage'}),
    text('programmesIntro', 'Intro', 120, {group: 'programmes'}),
    str('chooserQuestion', 'Chooser question', 50, {group: 'programmes', initialValue: 'Where are you right now?'}),
    defineField({
      name: 'chooser',
      title: 'Chooser buttons (what each button recommends)',
      type: 'array',
      group: 'programmes',
      validation: (r) => r.max(4),
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', validation: (r) => r.required().max(34).warning()}),
            defineField({name: 'programmes', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'program'}]})]}),
          ],
          preview: {select: {title: 'label'}},
        }),
      ],
    }),
    str('notSureLabel', '"Not sure" button text', 34, {group: 'programmes', initialValue: 'Not sure? Talk to us'}),
    strings('steps', 'How it works: exactly 4 steps', {max: 4, len: 28, description: 'Four short steps, shown as a numbered strip.'}),

    str('founderHeading', 'Heading', 60, {group: 'founder', initialValue: 'Guided with care and experience'}),
    text('founderBody', 'Text', 320, {group: 'founder'}),
    image('founderImage', 'Founder photo'),
    strings('founderPoints', 'Four small points (desktop)', {max: 4, len: 28}),
    str('founderButton', 'Button text', 24, {group: 'founder', initialValue: 'Know Our Story'}),
    str('founderSignature', 'Signature line', 50, {group: 'founder'}),

    str('freeHeading', 'Heading', 60, {group: 'free', initialValue: 'Begin with a free online session'}),
    strings('freeBullets', 'Three bullets', {max: 3, len: 40}),
    str('freeButton', 'Form button text', 28, {group: 'free', initialValue: 'Reserve My Free Spot'}),
    str('freeNote', 'Note under the button', 100, {group: 'free', initialValue: 'Takes 30 seconds. No payment needed. We never share your information.'}),

    str('faqHeading', 'Heading', 60, {group: 'faq', initialValue: 'Questions, answered simply'}),
    {...faqRefs, group: 'faq'},
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Home page'})},
})

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About (Our Story)',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    str('headline', 'Headline', 90),
    text('lead', 'Intro', 200),
    str('signature', 'Signature line', 50),
    image('image', 'Founder photo'),
    str('storyHeading', 'Story heading', 40, {initialValue: 'Our story'}),
    text('story', 'Our story', 900, {rows: 8}),
    str('approachHeading', 'Approach heading', 40, {initialValue: 'Our approach'}),
    titledList('approach', 'Approach cards (3)', 3),
    str('promiseHeading', 'Promise heading', 40, {initialValue: 'Our promise'}),
    titledList('promise', 'Promise cards (4)', 4, false),
    str('closingHeading', 'Closing line', 70),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'About (Our Story)'})},
})

export const communityPage = defineType({
  name: 'communityPage',
  title: 'Community',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    str('eyebrow', 'Small line above headline', 50),
    str('headline', 'Headline', 60),
    strings('stages', 'Stage pills (3)', {max: 3, len: 24}),
    text('intro', 'Intro', 240),
    str('joinLabel', 'Join button text', 24, {initialValue: 'Join the Community'}),
    str('joinMessage', 'WhatsApp pre-filled message', 120, {initialValue: "Hi, I'd like to join the Holistic Pregnancy community"}),
    str('whoHeading', 'Who it is for: heading', 40),
    text('who', 'Who it is for: text', 300),
    str('shareHeading', 'What we share: heading', 40),
    text('shareIntro', 'What we share: intro', 240),
    strings('shareItems', 'What we share: cards (4)', {max: 4, len: 30}),
    str('careHeading', 'House rules: heading', 50),
    strings('careRules', 'House rules (3)', {max: 3, len: 140}),
    str('closingHeading', 'Closing line', 50, {initialValue: 'You are welcome here.'}),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Community'})},
})

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Get in touch',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    str('headline', 'Headline', 80, {initialValue: 'Not sure which program is right for you?'}),
    text('lead', 'Intro', 160, {initialValue: 'Tell us where you are, and we will help you choose.'}),
    str('formButton', 'Form button text', 28, {initialValue: 'Send my message'}),
    str('formNote', 'Note under the button', 100, {initialValue: 'Takes 30 seconds. No payment needed. We never share your information.'}),
    str('directHeading', 'Direct links heading', 40, {initialValue: 'Reach us directly'}),
    str('faqHeading', 'FAQ heading', 40, {initialValue: 'Quick answers'}),
    faqRefs,
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Get in touch'})},
})

export const freeSessionPage = defineType({
  name: 'freeSessionPage',
  title: 'Free session page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    str('headline', 'Headline', 70, {initialValue: 'Begin with a free online session'}),
    text('lead', 'Intro', 220),
    strings('bullets', 'Three bullets', {max: 3, len: 40}),
    str('formButton', 'Form button text', 28, {initialValue: 'Reserve My Free Spot'}),
    str('whoHeading', 'Who should join: heading', 40, {initialValue: 'Who should join'}),
    strings('whoItems', 'Who should join (3)', {max: 3, len: 50}),
    str('founderHeading', 'Founder blurb heading', 40, {initialValue: 'Meet the founder'}),
    text('founderBody', 'Founder blurb', 320),
    image('founderImage', 'Founder photo'),
    str('closingHeading', 'Closing line', 50, {initialValue: 'Reserve your free spot'}),
    str('faqHeading', 'FAQ heading', 40, {initialValue: 'Questions, answered simply'}),
    faqRefs,
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Free session page'})},
})

const done = (name: string, title: string, headline: string) =>
  defineField({
    name,
    title,
    type: 'object',
    options: {collapsible: true, collapsed: false},
    fields: [
      str('heading', 'Heading', 60, {initialValue: headline}),
      text('body', 'Message', 300),
      str('whatsappLabel', 'WhatsApp button text (optional)', 30, {initialValue: 'Message us on WhatsApp'}),
    ],
  })

export const thankYouPages = defineType({
  name: 'thankYouPages',
  title: 'Thank-you pages',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    done('freeSession', 'After free-session sign-up', "You're in. We've saved your spot."),
    done('enrol', 'After enrol', 'Thank you. We have your enrolment request.'),
    done('contact', 'After get-in-touch', "Thank you. We'll call you back soon."),
  ],
  preview: {prepare: () => ({title: 'Thank-you pages'})},
})
