import { ImagesIcon } from '@sanity/icons'
import { orderRankField } from '@sanity/orderable-document-list'
import { createElement } from 'react'
import { defineField, defineType } from 'sanity'

import { muxThumbnailUrl } from './lib/muxThumbnail'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImagesIcon,
  // Field order is the editing order: name the client first, then date it,
  // tag it, then upload. `slug` used to sit below the uploader, which meant
  // scrolling past every photo to type the client's name.
  fields: [
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'The name of the client or brand this project was made for.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description:
        'Used to sort your Work page, newest first. Usually when the work was made or published.',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Tick every type of work this project includes. These are fixed so the Work page can group projects consistently.',
      options: {
        list: [
          { title: 'Social', value: 'Social' },
          { title: 'Brand', value: 'Brand' },
          { title: 'Content', value: 'Content' },
          { title: 'Creative Direction', value: 'Creative Direction' },
          { title: 'Events', value: 'Events' },
          { title: 'Weddings', value: 'Weddings' },
        ],
        layout: 'grid',
      },
      validation: (rule) => rule.min(1).error('Pick at least one type of work.'),
    }),
    defineField({
      name: 'media',
      title: 'Photos & videos',
      type: 'array',
      of: [{ type: 'photoItem' }, { type: 'videoItem' }],
      description:
        'Add every photo and video for this client or campaign — they all appear on your Work page. You can drag a whole batch of photos in at once. The first item is the cover: drag your best piece to the top, since that is what shows on the homepage.',
      validation: (rule) => rule.min(1).error('Add at least one photo or video.'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description:
        'A line or two about the work, e.g. "Social content and creative direction for the summer launch."',
    }),
    // Derived from `client` and never shown: "slug" and a "Generate" button
    // are developer vocabulary, and there has never been a reason to set it
    // by hand. Still validated for uniqueness, because two clients with the
    // same name would otherwise collide silently.
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      hidden: true,
      options: {
        source: 'client',
        maxLength: 96,
        // Runs on publish for documents created before this field was
        // hidden, and for any created without it.
        isUnique: () => true,
      },
      validation: (rule) =>
        rule.custom(async (slug, context) => {
          if (!slug?.current) return true

          const client = context.getClient({ apiVersion: '2024-01-01' })
          const id = context.document?._id?.replace(/^drafts\./, '')

          const existing = await client.fetch(
            `count(*[_type == "project" && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
            { slug: slug.current, id },
          )

          return existing === 0 || 'Another project already uses this client name'
        }),
    }),
    orderRankField({ type: 'project' }),
  ],
  preview: {
    select: {
      title: 'client',
      categories: 'categories',
      coverType: 'media.0._type',
      coverPhoto: 'media.0',
      coverPlaybackId: 'media.0.video.asset.playbackId',
      coverPreviewStart: 'media.0.previewStart',
      mediaCount: 'media',
    },
    prepare({ title, categories, coverType, coverPhoto, coverPlaybackId, coverPreviewStart, mediaCount }) {
      const count = Array.isArray(mediaCount) ? mediaCount.length : 0
      const tags = Array.isArray(categories) ? categories.join(', ') : undefined
      const pieces = count === 1 ? '1 item' : `${count} items`

      return {
        title,
        subtitle: tags ? `${tags} · ${pieces}` : pieces,
        // A photoItem is an `image` member, so its value is itself an image
        // and Sanity's own preview machinery renders it as-is. A videoItem
        // needs a Mux thumbnail URL built from the dereferenced playbackId.
        media:
          coverType === 'videoItem'
            ? coverPlaybackId
              ? createElement('img', {
                  src: muxThumbnailUrl(coverPlaybackId, coverPreviewStart),
                  alt: '',
                })
              : undefined
            : coverPhoto,
      }
    },
  },
})
