import { ImagesIcon } from '@sanity/icons'
import { orderRankField } from '@sanity/orderable-document-list'
import { createElement } from 'react'
import { defineField, defineType } from 'sanity'

import DerivedSlugInput from './components/DerivedSlugInput'
import HeroPickerInput from './components/HeroPickerInput'
import { muxThumbnailUrl } from './lib/muxThumbnail'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImagesIcon,
  // Three tabs rather than one long scroll. Every field carries a group:
  // one left out would show up under every tab instead of just its own.
  groups: [
    { name: 'basics', title: 'Basics', default: true },
    { name: 'media', title: 'Photos & videos' },
    { name: 'story', title: 'Story' },
  ],
  // Field order is the editing order: name the client first, then date it,
  // tag it, then upload. `slug` used to sit below the uploader, which meant
  // scrolling past every photo to type the client's name.
  fields: [
    defineField({
      name: 'client',
      group: 'basics',
      title: 'Client',
      type: 'string',
      description: 'The name of the client or brand this project was made for.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      group: 'basics',
      title: 'Date',
      type: 'date',
      description:
        'When the work was made or published — shown on the project’s own page, e.g. “September 2026”. This does not change the order your work appears in: drag projects up and down the Projects list to do that.',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      group: 'basics',
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
      group: 'media',
      title: 'Photos & videos',
      type: 'array',
      of: [{ type: 'photoItem' }, { type: 'videoItem' }],
      description:
        'Add every photo and video for this client or campaign — they all appear on your Work page. You can drag a whole batch of photos in at once. The first item is the cover: drag your best piece to the top, since that is what shows on the homepage.',
      validation: (rule) => rule.min(1).error('Add at least one photo or video.'),
    }),
    // Replaces an earlier dedicated "Cover photo" upload field. Choosing from
    // what she has already added avoids uploading the same frame twice, and
    // keeps the banner guaranteed to be work that is actually in the project.
    defineField({
      name: 'heroPhotoKey',
      group: 'media',
      title: 'Hero image',
      type: 'string',
      components: { input: HeroPickerInput },
      description:
        'Which photo runs large across the top of this project’s page, with the client name over it. Only photos are offered: a portrait video stretched that wide gets cropped to a thin strip and looks soft. Leave it on “First item” and the first thing in the list is used, at its own natural shape.',
    }),
    defineField({
      name: 'description',
      group: 'story',
      title: 'Description',
      type: 'text',
      rows: 3,
      description:
        'A line or two about the work, e.g. "Social content and creative direction for the summer launch." This is also the sentence Google shows under the link to this project.',
    }),
    defineField({
      name: 'details',
      group: 'story',
      title: 'Project details',
      type: 'array',
      of: [{ type: 'detailRow' }],
      description:
        'Optional. Add a row for anything worth listing — Location, Team, Deliverables, Partner. They appear as a neat labelled list on the project page, in the order you put them here. Add as many or as few as you like.',
    }),
    // Shown read-only and filled in automatically from the client name —
    // see components/DerivedSlugInput.tsx. It stays visible because it is
    // the address of the project's own page (/work/<slug>), which is worth
    // being able to see; it is not editable because there is no reason to
    // type one by hand, and changing it would break shared links.
    defineField({
      name: 'slug',
      group: 'basics',
      title: 'Web address',
      type: 'slug',
      components: { input: DerivedSlugInput },
      options: { source: 'client', maxLength: 96 },
      // Required: without a slug the project has no page to link to.
      validation: (rule) =>
        rule.required().custom(async (slug, context) => {
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
