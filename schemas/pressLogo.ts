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
    // Unused — all press logos currently render as text, and no one has
    // uploaded one through this field. Hidden rather than removed: it still
    // works if that changes later, and no data is lost by hiding it.
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      hidden: true,
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
