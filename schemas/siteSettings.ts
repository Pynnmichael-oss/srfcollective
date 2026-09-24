import { CogIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  // This document is a singleton — see structure.ts, where it's the only way
  // to open it (there is no "create new" option anywhere in the Studio).
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'homepage', title: 'Homepage' },
  ],
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      description: 'The big headline text at the top of the homepage.',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubline',
      title: 'Hero subline',
      type: 'text',
      description: 'The supporting line under the headline — a sentence or two.',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'activationsHeading',
      title: 'Activations heading',
      type: 'string',
      description: 'The heading for the "Activations" section of the homepage.',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'activationsLede',
      title: 'Activations lede',
      type: 'text',
      description: 'The short intro paragraph that goes under the Activations heading.',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'footerLocation',
      title: 'Footer location',
      type: 'string',
      description:
        'The location and founder credit shown in the footer, e.g. "New York — Est. by Rosie Ferrell".',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      description: 'The link to the Instagram profile, shown in the footer.',
      group: 'general',
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ['http', 'https'] })
          .error('Must be a full link starting with https://'),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description:
        'Optional. The title shown in search engines and browser tabs. If left blank, the site name is used instead.',
      group: 'general',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      description:
        'Optional. A one or two sentence summary shown under the title in search engine results.',
      group: 'general',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description:
        'Optional. The image shown when the site is shared on social media (Facebook, X, etc). If left blank, a default image is used.',
      options: { hotspot: true },
      group: 'general',
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Homepage highlights',
      type: 'array',
      description:
        'Choose the projects that appear on your homepage, up to 9. Drag to change the order. Everything else still appears on your Work page. To add a new project, create it under Projects first, then come back and add it here.',
      group: 'homepage',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'project' }],
          weak: true,
          options: { disableNew: true },
        }),
      ],
      validation: (rule) =>
        rule
          .unique()
          .max(9)
          .error('The homepage shows up to 9 highlights. Remove one before adding another.'),
    }),
  ],
  preview: {
    select: { title: 'heroHeadline' },
    prepare({ title }) {
      return { title: 'Site Settings', subtitle: title }
    },
  },
})
