import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {UserIcon} from '@sanity/icons/User'
import {LockIcon} from '@sanity/icons/Lock'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {image, limit, portableText, seo} from './shared'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'question', type: 'string', validation: (r) => r.required().max(120).warning()}),
    defineField({name: 'answer', type: 'text', rows: 4, validation: (r) => r.required().max(500).warning()}),
  ],
  preview: {select: {title: 'question', subtitle: 'answer'}},
})

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'quote', type: 'text', rows: 4, validation: (r) => r.required().max(400).warning()}),
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'stage', title: 'Stage / programme (optional)', type: 'string', description: 'e.g. Mother of two, joined Pathshala', validation: limit(60)}),
    defineField({name: 'videoUrl', title: 'Video link (optional)', type: 'url', description: 'YouTube or Shorts link. Videos are never uploaded here.'}),
    defineField({
      name: 'isPlaceholder',
      title: 'Example only (not a real testimonial)',
      type: 'boolean',
      initialValue: false,
      description: 'ON = staging only. Real testimonials must have this OFF. The section appears only when 3 or more real ones are published.',
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'quote'}},
})

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: LockIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'string',
      readOnly: true,
      options: {list: ['privacy', 'terms', 'refund', 'medical-disclaimer']},
      validation: (r) => r.required(),
    }),
    portableText('body', 'Page content'),
    defineField({name: 'lastUpdated', title: 'Last updated', type: 'date', validation: (r) => r.required()}),
    defineField({
      name: 'status',
      title: 'Approval status',
      type: 'string',
      initialValue: 'draft',
      options: {layout: 'radio', list: [{title: 'Draft (website cannot go live)', value: 'draft'}, {title: 'Approved by the client', value: 'approved'}]},
      validation: (r) => r.required(),
    }),
    defineField({name: 'approvedOn', title: 'Approved on', type: 'date', hidden: ({parent}) => parent?.status !== 'approved'}),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'status'}},
})

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'role', type: 'string'}),
    image('photo', 'Photo'),
    defineField({name: 'bio', type: 'text', rows: 3, validation: limit(240)}),
  ],
})

export const category = defineType({
  name: 'category',
  title: 'Blog category',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
  ],
})

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required().max(90).warning()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title', maxLength: 80}, validation: (r) => r.required()}),
    defineField({name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString(), validation: (r) => r.required()}),
    defineField({name: 'author', type: 'reference', to: [{type: 'author'}]}),
    defineField({name: 'categories', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})]}),
    defineField({name: 'excerpt', type: 'text', rows: 3, validation: (r) => r.required().max(200).warning()}),
    image('coverImage', 'Cover image'),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        ...(portableText().of as any[]),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', type: 'string', validation: (r) => r.required()})],
        }),
      ],
    }),
    defineField({
      name: 'isPlaceholder',
      title: 'Dummy post (staging only)',
      type: 'boolean',
      initialValue: false,
      description: 'ON = never published on the live site, even if the blog is switched on.',
    }),
    defineField({name: 'seo', type: 'seo'}),
  ],
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'publishedAt', media: 'coverImage'}},
})
