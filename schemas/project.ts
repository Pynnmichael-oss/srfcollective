import { ImagesIcon } from '@sanity/icons'
import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      description: 'Choose whether this project shows a photo or a video clip in the grid.',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description:
        'The main photo for this project. Please use a photo that is at least 1600px on the long edge, under 2MB, and saved as a JPEG.',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'image' && !value) {
            return 'Required when media type is Image'
          }
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
      description:
        'The video clip for this project. Keep clips under about 60 seconds for the grid — longer-form content will have a home on individual project pages in the future.',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'video' && !value) {
            return 'Required when media type is Video'
          }
          return true
        }),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'The name of the client or brand this project was made for.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'A web-friendly, unique identifier for this project, generated from the client name. Not used on the site yet — this is groundwork for future individual project pages.',
      options: { source: 'client', maxLength: 96 },
      validation: (rule) =>
        rule.required().custom(async (slug, context) => {
          if (!slug?.current) return true

          const client = context.getClient({ apiVersion: '2024-01-01' })
          const id = context.document?._id?.replace(/^drafts\./, '')

          const existing = await client.fetch(
            `count(*[_type == "project" && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
            { slug: slug.current, id },
          )

          return existing === 0 || 'This slug is already used by another project'
        }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description:
        'The type of work this project is, e.g. "Content", "Creative direction", or "Social".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'Optional. A short, plain description of what is in the photo — helps with accessibility and search engines. Leave blank if you are not sure what to put.',
    }),
    defineField({
      name: 'aspectRatioHint',
      title: 'Aspect ratio hint',
      type: 'string',
      description:
        'Optional — you can leave this blank. Only fill this in if the image looks oddly cropped in the gallery grid; a short note here (like "tall" or "wide") helps us adjust how it displays.',
    }),
    orderRankField({ type: 'project' }),
  ],
  preview: {
    select: {
      title: 'client',
      subtitle: 'category',
      media: 'image',
    },
  },
})
