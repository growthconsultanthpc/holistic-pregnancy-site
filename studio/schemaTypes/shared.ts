import {defineArrayMember, defineField, defineType} from 'sanity'

// Layout is locked: these limits keep pasted text from breaking the design.
export const limit = (n: number) => (rule: any) =>
  rule.max(n).warning(`Keep under ${n} characters so the layout holds.`)

export const image = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text (describe the image, for screen readers and Google)',
        type: 'string',
        validation: (r) => r.required(),
      }),
    ],
  })

export const strings = (name: string, title: string, opts: {max?: number; len?: number; description?: string} = {}) =>
  defineField({
    name,
    title,
    type: 'array',
    description: opts.description,
    of: [defineArrayMember({type: 'string', validation: limit(opts.len ?? 90)})],
    validation: (r) => (opts.max ? r.max(opts.max) : r),
  })

export const faqRefs = defineField({
  name: 'faqs',
  title: 'FAQs shown on this page (drag to reorder)',
  type: 'array',
  of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})],
})

export const seo = defineType({
  name: 'seo',
  title: 'SEO (Google and social sharing)',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Page title', type: 'string', description: 'About 50-60 characters.', validation: limit(60)}),
    defineField({name: 'description', title: 'Short description', type: 'text', rows: 3, description: 'About 150 characters.', validation: limit(160)}),
    image('image', 'Sharing image', 'Shown when the link is shared on WhatsApp or social media (1200×630 works best).'),
  ],
})

export const emailTemplate = defineType({
  name: 'emailTemplate',
  title: 'Confirmation email',
  type: 'object',
  fields: [
    defineField({name: 'subject', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'body',
      type: 'text',
      rows: 8,
      description: 'Plain text. You can use {{firstName}} and {{programme}}.',
      validation: (r) => r.required(),
    }),
  ],
})

export const portableText = (name = 'body', title = 'Content') =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [{title: 'Normal', value: 'normal'}, {title: 'Heading', value: 'h2'}, {title: 'Sub-heading', value: 'h3'}],
        lists: [{title: 'Bullets', value: 'bullet'}, {title: 'Numbers', value: 'number'}],
        marks: {
          decorators: [{title: 'Bold', value: 'strong'}, {title: 'Italic', value: 'em'}],
          annotations: [
            {name: 'link', type: 'object', title: 'Link', fields: [defineField({name: 'href', type: 'url', validation: (r) => r.uri({scheme: ['http', 'https', 'mailto', 'tel']})})]},
          ],
        },
      }),
    ],
  })

export const barMessage = defineType({
  name: 'barMessage',
  title: 'Bar message',
  type: 'object',
  fields: [
    defineField({name: 'text', type: 'string', validation: (r) => r.required().max(90).warning('Keep under 90 characters so it fits on one line on a phone.')}),
    defineField({name: 'linkLabel', title: 'Link text (optional)', type: 'string', validation: limit(36)}),
    defineField({name: 'linkUrl', title: 'Link address (optional)', type: 'string', description: 'A page on the site such as /preconception/ or a full https:// address.'}),
  ],
  preview: {select: {title: 'text', subtitle: 'linkLabel'}},
})
