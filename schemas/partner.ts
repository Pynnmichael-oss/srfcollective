import { UsersIcon } from '@sanity/icons'
import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The partner or collaborator\'s name.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description:
        "Optional. Upload the partner's logo here. If you leave this blank, the site will just show the name as text instead.",
    }),
    orderRankField({ type: 'partner' }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
    },
  },
})
