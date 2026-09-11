import { EarthGlobeIcon } from '@sanity/icons'
import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pressLogo',
  title: 'Press Logo',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The name of the press outlet or publication, e.g. "Vogue" or "The New York Times".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description:
        "Optional. Upload the outlet's logo here. If you leave this blank, the site will just show the name as text instead.",
    }),
    orderRankField({ type: 'pressLogo' }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
    },
  },
})
