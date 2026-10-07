import { ImagesIcon } from '@sanity/icons'
import { orderRankField } from '@sanity/orderable-document-list'
import { createElement } from 'react'
import { defineField, defineType } from 'sanity'

import PreviewStartInput from './components/PreviewStartInput'
import { muxThumbnailUrl } from './lib/muxThumbnail'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImagesIcon,
  fields: [
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
      title: 'Media',
      type: 'array',
      of: [{ type: 'mediaItem' }],
      description:
        'Add every photo and video for this client or campaign. You can drag several photos in at once. The first item is the cover: drag your best piece to the top.',
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
    // Superseded by `media` (an array of mediaItem) — kept hidden, with
    // their data in place, so the live site (which still reads these) keeps
    // working until a later task switches the front end over to `media`.
    defineField({
      name: 'mediaType',
      title: 'Media type (old, superseded by Media)',
      type: 'string',
      hidden: true,
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Image (old, superseded by Media)',
      type: 'image',
      options: { hotspot: true },
      hidden: true,
    }),
    defineField({
      name: 'video',
      title: 'Video (old, superseded by Media)',
      type: 'mux.video',
      hidden: true,
    }),
    defineField({
      name: 'previewStart',
      title: 'Preview start (old, superseded by Media)',
      type: 'number',
      hidden: true,
      components: { input: PreviewStartInput },
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
        'The web address for this client\'s page. Click Generate after entering the client name; you shouldn\'t need to change it.',
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
      title: 'Category (old, superseded by Categories)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'alt',
      title: 'Alt text (old, superseded by Media)',
      type: 'string',
      hidden: true,
    }),
    // Superseded — every tile now renders at its asset's real aspect ratio
    // automatically (see components/WorkTile.tsx), so this hint is no
    // longer read anywhere. Hidden rather than deleted/patched: 5 existing
    // documents have a value set, left in place for a separate cleanup.
    defineField({
      name: 'aspectRatioHint',
      title: 'Aspect ratio hint',
      type: 'string',
      hidden: true,
    }),
    orderRankField({ type: 'project' }),
  ],
  preview: {
    select: {
      title: 'client',
      categories: 'categories',
      coverMediaType: 'media.0.mediaType',
      coverImage: 'media.0.image',
      coverVideoPlaybackId: 'media.0.video.asset.playbackId',
      coverPreviewStart: 'media.0.previewStart',
      // Fallback for any project that predates the `media` array (none
      // today, post-migration, but expand/contract leaves the old fields
      // live) — same dereference approach, no async lookup either way.
      oldImage: 'image',
      oldVideoPlaybackId: 'video.asset.playbackId',
      oldPreviewStart: 'previewStart',
    },
    prepare({
      title,
      categories,
      coverMediaType,
      coverImage,
      coverVideoPlaybackId,
      coverPreviewStart,
      oldImage,
      oldVideoPlaybackId,
      oldPreviewStart,
    }) {
      const videoPlaybackId = coverMediaType ? coverVideoPlaybackId : oldVideoPlaybackId
      const previewStart = coverMediaType ? coverPreviewStart : oldPreviewStart
      const image = coverMediaType ? coverImage : oldImage
      const isVideo = coverMediaType ? coverMediaType === 'video' : Boolean(videoPlaybackId)

      return {
        title,
        subtitle: Array.isArray(categories) ? categories.join(', ') : undefined,
        media:
          isVideo && videoPlaybackId
            ? createElement('img', {
                src: muxThumbnailUrl(videoPlaybackId, previewStart),
                alt: '',
              })
            : image,
      }
    },
  },
})
