import { UserIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'aboutSettings',
  title: 'About Page',
  type: 'document',
  icon: UserIcon,
  // This document is a singleton — see structure.ts, where it's the only way
  // to open it (there is no "create new" option anywhere in the Studio).
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      description:
        'Optional. A portrait of Rosie shown next to the introduction — the site turns it black and white automatically, so any photo works. Please use a photo that is at least 1200px on the long edge, under 2MB, and saved as a JPEG. Until one is added, the About page simply shows the text on its own.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'portraitAlt',
      title: 'Portrait alt text',
      type: 'string',
      description:
        'Optional. A short, plain description of what is in the portrait — helps with accessibility and search engines. Leave blank if you are not sure what to put.',
    }),
    defineField({
      name: 'statement',
      title: 'Studio statement',
      type: 'string',
      description:
        'The big line at the top of the About page — one sentence about what SRF Collective does.',
    }),
    defineField({
      name: 'founderIntro',
      title: 'Founder introduction',
      type: 'text',
      rows: 3,
      description: 'The short paragraph directly under the statement, introducing the founder.',
    }),
    defineField({
      name: 'body',
      title: 'About text',
      type: 'array',
      description:
        'The paragraphs that follow the introduction. Press Enter to start a new paragraph. You can make words bold or italic; nothing else is needed.',
      of: [
        // Only "Normal" paragraphs with bold/italic — that's everything the
        // About page is styled to show, so the editor doesn't offer options
        // (headings, lists, links) that would render unstyled.
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [],
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    },
  },
})
