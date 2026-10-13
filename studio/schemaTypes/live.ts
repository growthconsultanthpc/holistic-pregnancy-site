import {CalendarIcon} from '@sanity/icons/Calendar'
import {PlayIcon} from '@sanity/icons/Play'
import {defineField, defineType} from 'sanity'
import {limit} from './shared'

// Upcoming sessions list (Sessions page). Past dates hide by themselves.
export const liveSession = defineType({
  name: 'liveSession',
  title: 'Upcoming session',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required().max(90)}),
    defineField({name: 'date', type: 'date', validation: (r) => r.required()}),
    defineField({name: 'time', title: 'Time (e.g. 7:00 PM)', type: 'string', validation: limit(12)}),
    defineField({name: 'type', title: 'Type', type: 'string', description: 'Meditation, Webinar, Workshop, Q&A', validation: limit(20)}),
    defineField({name: 'desc', title: 'Description', type: 'text', rows: 2, validation: limit(200)}),
    defineField({name: 'price', title: 'Price', type: 'string', initialValue: 'Free', validation: limit(12)}),
    defineField({name: 'repeat', title: 'Repeats', type: 'string', initialValue: '', options: {layout: 'radio', list: [{title: 'One time', value: ''}, {title: 'Every week (next 4 weeks shown)', value: 'weekly'}]}}),
  ],
  orderings: [{title: 'Date', name: 'date', by: [{field: 'date', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'date'}},
})

// Mantra player tracks (shown only when "Show the mantra music button" is on in Site settings).
export const mantraTrack = defineType({
  name: 'mantraTrack',
  title: 'Mantra',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'why', title: 'One line: why this mantra', type: 'string', validation: limit(80)}),
    defineField({name: 'sanskrit', title: 'Sanskrit text', type: 'text', rows: 3}),
    defineField({name: 'roman', title: 'Easy-to-read version', type: 'text', rows: 3}),
    defineField({name: 'meaning', title: 'Meaning', type: 'text', rows: 3}),
    defineField({name: 'audioUrl', title: 'Audio file address (mp3)', type: 'string', description: 'Use only recordings you own or have permission to use.'}),
    defineField({name: 'youtubeId', title: 'YouTube video ID (instead of an mp3)', type: 'string'}),
    defineField({name: 'isShort', title: 'It is a YouTube Short', type: 'boolean', initialValue: false}),
    defineField({name: 'credit', title: 'Credit (channel or singer)', type: 'string'}),
    defineField({name: 'order', type: 'number', initialValue: 1}),
  ],
  orderings: [{title: 'Order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'credit'}},
})
