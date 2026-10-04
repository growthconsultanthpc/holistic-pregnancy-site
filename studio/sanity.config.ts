import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {NO_CREATE, NO_DELETE, structure} from './src/structure'

export default defineConfig({
  name: 'default',
  title: 'Holistic Website',

  projectId: 'ef4m6d01',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter((t) => !NO_CREATE.includes(t.schemaType)),
  },
  document: {
    actions: (prev, {schemaType}) =>
      NO_DELETE.includes(schemaType)
        ? prev.filter((a) => !['delete', 'duplicate', 'unpublish'].includes(a.action ?? ''))
        : prev,
  },
})
