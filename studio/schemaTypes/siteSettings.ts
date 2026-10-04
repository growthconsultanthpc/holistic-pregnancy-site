import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'
import {image, limit} from './shared'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'business', title: 'Business', default: true},
    {name: 'bar', title: 'Announcement bar'},
    {name: 'blog', title: 'Blog'},
    {name: 'emails', title: 'Emails & payment'},
    {name: 'misc', title: 'Other text'},
  ],
  fields: [
    defineField({name: 'businessName', type: 'string', group: 'business', initialValue: 'Holistic Pregnancy', validation: (r) => r.required()}),
    defineField({name: 'tagline', type: 'string', group: 'business', initialValue: 'Nurturing mothers. Healthier families. A brighter future.', validation: limit(90)}),
    image('logo', 'Logo', 'Replaces the logo in the header and footer.'),
    defineField({name: 'phone', title: 'Phone (shown to visitors)', type: 'string', group: 'business', description: 'e.g. +91 98809 05511'}),
    defineField({name: 'email', type: 'string', group: 'business', validation: (r) => r.email()}),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      group: 'business',
      description: 'Digits only, with country code and no + or spaces, e.g. 919880905511.',
      validation: (r) => r.required().regex(/^\d{10,15}$/, {name: 'digits'}).error('Digits only, e.g. 919880905511'),
    }),
    defineField({name: 'whatsappMessage', title: 'WhatsApp pre-filled message', type: 'string', group: 'business', initialValue: "Hi, I'd like to know more about Holistic Pregnancy."}),
    defineField({
      name: 'calendlyUrl',
      title: 'Calendly link (every "Book a Free Call" button opens this)',
      type: 'url',
      group: 'business',
      initialValue: 'https://calendly.com/anand-arora/meeting',
      validation: (r) => r.required().uri({scheme: ['https']}),
    }),
    defineField({name: 'instagramUrl', type: 'url', group: 'business'}),
    defineField({name: 'facebookUrl', type: 'url', group: 'business'}),
    defineField({name: 'threadsUrl', type: 'url', group: 'business'}),
    defineField({name: 'legalEntity', title: 'Name in the footer copyright', type: 'string', group: 'business', initialValue: 'Holistic Pregnancy', description: 'Confirm the legal entity with the client.'}),

    defineField({name: 'barEnabled', title: 'Show announcement bar', type: 'boolean', group: 'bar', initialValue: true}),
    defineField({name: 'barText', title: 'Text', type: 'string', group: 'bar', initialValue: 'Free online session for couples planning or expecting a baby.', validation: limit(100)}),
    defineField({name: 'barLinkLabel', title: 'Link label', type: 'string', group: 'bar', initialValue: 'Join Free Session', validation: limit(24)}),
    defineField({
      name: 'barShowDate',
      title: 'Add the next session date to the bar',
      type: 'boolean',
      group: 'bar',
      description: 'Only shows when "Next free session" is set to Show date and the date is still in the future.',
      initialValue: true,
    }),

    defineField({
      name: 'blogEnabled',
      title: 'Show blog on the website',
      type: 'boolean',
      group: 'blog',
      initialValue: false,
      description: 'OFF = the blog is completely hidden (no page, no menu link). Turn on only when you have real posts.',
    }),
    defineField({name: 'externalBlogUrl', title: 'External blog link in footer (optional)', type: 'url', group: 'blog', description: 'Shown in the footer only while the on-site blog is OFF. Leave empty to hide.'}),

    defineField({name: 'emailFreeSession', title: 'Email: free session', type: 'emailTemplate', group: 'emails'}),
    defineField({name: 'emailEnrol', title: 'Email: enrol', type: 'emailTemplate', group: 'emails'}),
    defineField({name: 'emailContact', title: 'Email: get in touch', type: 'emailTemplate', group: 'emails'}),
    defineField({
      name: 'paymentInstructions',
      title: 'Payment instructions (offline)',
      type: 'text',
      rows: 4,
      group: 'emails',
      description: 'Shown after enrolment and in the enrol email. Payment is collected offline.',
      initialValue: 'Payment is collected offline. Our team will share the details on the call.',
    }),

    defineField({name: 'notFoundHeading', title: '404 page: heading', type: 'string', group: 'misc', initialValue: "We couldn't find that page."}),
    defineField({name: 'notFoundText', title: '404 page: text', type: 'text', rows: 2, group: 'misc', initialValue: 'Let us help you find the right programme.'}),
    defineField({name: 'disclaimer', title: 'Medical disclaimer line (programme pages)', type: 'text', rows: 2, group: 'misc', initialValue: 'Holistic Pregnancy is educational support and works alongside, not instead of, care from your doctor.'}),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})

export const nextSession = defineType({
  name: 'nextSession',
  title: 'Next free session',
  type: 'document',
  fields: [
    defineField({
      name: 'mode',
      title: 'What should the website show?',
      type: 'string',
      initialValue: 'none',
      options: {
        layout: 'radio',
        list: [
          {title: 'No date (shows the fallback text below)', value: 'none'},
          {title: 'Show the session date', value: 'date'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'startsAt',
      title: 'Session date and time (India time)',
      type: 'datetime',
      hidden: ({parent}) => parent?.mode !== 'date',
      validation: (r) =>
        r.custom((v, ctx: any) => (ctx.parent?.mode === 'date' && !v ? 'Pick the date and time' : true)),
    }),
    defineField({name: 'label', title: 'Extra line (optional)', type: 'string', description: 'e.g. "Live on Zoom"', hidden: ({parent}) => parent?.mode !== 'date', validation: limit(40)}),
    defineField({
      name: 'fallbackText',
      title: 'Fallback text (when no date, or after the date has passed)',
      type: 'string',
      initialValue: 'Free · Live online · Date and joining link sent on WhatsApp',
      validation: (r) => r.required().max(90).warning(),
    }),
  ],
  preview: {
    select: {mode: 'mode', at: 'startsAt'},
    prepare: ({mode, at}) => ({title: 'Next free session', subtitle: mode === 'date' && at ? new Date(at).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'}) : 'No date'}),
  },
})
