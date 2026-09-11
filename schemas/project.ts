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
      name: 'image',
      title: 'Image',
      type: 'image',
      description:
        'The main photo for this project. Please use a photo that is at least 1600px on the long edge, under 2MB, and saved as a JPEG.',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'The name of the client or brand this project was made for.',
      validation: (rule) => rule.required(),
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
