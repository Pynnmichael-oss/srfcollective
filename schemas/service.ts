import { ThListIcon } from '@sanity/icons'
import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: ThListIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The service name as it should appear on the page, e.g. Content Creation.',
      validation: (rule) =>
        rule
          .required()
          .max(40)
          .warning('Long names wrap onto two lines on phones — consider a subtitle instead'),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description:
        "Optional small line under the name, e.g. \"Through iPhone content\". Leave blank for most services.",
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'One or two sentences describing the service.',
      validation: (rule) =>
        rule
          .required()
          .max(220)
          .warning('This is getting long — consider trimming it to one or two sentences'),
    }),
    defineField({
      name: 'hoverImage',
      title: 'Hover image',
      type: 'image',
      description:
        'Optional. Shows beside this service when someone hovers over it on a computer (not on phones). Portrait photos work best. At least 1600px on the long edge, under 2MB, JPEG.',
      options: { hotspot: true },
    }),
    orderRankField({ type: 'service' }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      media: 'hoverImage',
    },
  },
})
