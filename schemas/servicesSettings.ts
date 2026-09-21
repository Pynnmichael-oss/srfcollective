import { ThListIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'servicesSettings',
  title: 'Services Page',
  type: 'document',
  icon: ThListIcon,
  // This document is a singleton — see structure.ts, where it's the only way
  // to open it (there is no "create new" option anywhere in the Studio).
  fields: [
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      description:
        'Optional. A sentence or two of supporting copy shown under the "Services" heading at the top of the page. Leave blank to show no intro.',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      description:
        'The services listed on the page, in the order they appear. Drag the handle on the left of any service to reorder, or use "Add item" to add a new one.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'service',
          title: 'Service',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'The name of the service, e.g. "Brand Management".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'One or two sentences describing what the service includes.',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Services Page' }
    },
  },
})
