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
    { name: 'homepage', title: 'Homepage', default: true },
    { name: 'contact', title: 'Contact & footer' },
    { name: 'seo', title: 'SEO & sharing' },
  ],
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      description: 'The big headline text at the top of the homepage.',
      group: 'homepage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubline',
      title: 'Hero subline',
      type: 'text',
      description: 'The supporting line under the headline — a sentence or two.',
      group: 'homepage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'activationsHeading',
      title: 'Activations heading',
      type: 'string',
      description: 'The heading for the "Activations" section of the homepage.',
      group: 'homepage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'activationsLede',
      title: 'Activations lede',
      type: 'text',
      description: 'The short intro paragraph that goes under the Activations heading.',
      group: 'homepage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'footerLocation',
      title: 'Footer location',
      type: 'string',
      description:
        'The location and founder credit shown in the footer, e.g. "New York — Est. by Rosie Ferrell".',
      group: 'contact',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      description: 'The link to the Instagram profile, shown in the footer.',
      group: 'contact',
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
        'Optional. What shows as the page title in a Google search result and in the browser tab. Leave blank to just use your site name.',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      description:
        'Optional. The sentence or two that shows under your title in Google search results.',
      group: 'seo',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description:
        'Optional. The picture shown when someone shares your site link on Facebook, X, etc. Landscape, at least 1200px wide. Leave blank to use a default image.',
      options: { hotspot: true },
      group: 'seo',
    }),
    defineField({
      name: 'ctaHeading',
      title: 'Closing heading',
      type: 'string',
      description:
        "The large line near the bottom of your homepage, above your email. Example: Let's create something",
      group: 'homepage',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      description:
        'Shown near the bottom of your homepage as a clickable email link. This does not change where contact form messages are sent.',
      group: 'contact',
      validation: (rule) => rule.email(),
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
