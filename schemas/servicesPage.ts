import { ThListIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  icon: ThListIcon,
  // This document is a singleton — see structure.ts, where it's the only way
  // to open it (there is no "create new" option anywhere in the Studio).
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Large title at the top of the page.',
      initialValue: 'Services',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 2,
      description: 'Short line under the title introducing what the studio does.',
    }),
    defineField({
      name: 'closingHeading',
      title: 'Closing heading',
      type: 'string',
      description:
        'Optional. Line near the bottom inviting people to get in touch, e.g. "Not sure what you need yet?".',
    }),
    defineField({
      name: 'closingLinkLabel',
      title: 'Closing link label',
      type: 'string',
      description: 'Text of the link to the Contact page.',
      initialValue: 'Start a conversation',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: 'Services Page', subtitle: title }
    },
  },
})
