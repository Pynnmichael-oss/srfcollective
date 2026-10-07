import { createElement } from 'react'
import { defineField, defineType } from 'sanity'

import PreviewStartInput from '../components/PreviewStartInput'
import { muxThumbnailUrl } from '../lib/muxThumbnail'

// One photo or video inside a project's `media` array. Mirrors the shape of
// the old single-media fields on `project` (mediaType/image/video/
// previewStart/alt) so the group-projects migration can copy values across
// field-for-field — see scripts/migrations/group-projects.ts.
export default defineType({
  name: 'mediaItem',
  title: 'Media',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      description: 'Choose Photo or Video, then upload.',
      options: {
        list: [
          { title: 'Photo', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description:
        'Please use a photo that is at least 1600px on the long edge, under 2MB, and saved as a JPEG. Upload it in whatever shape it naturally is — portrait or landscape both work, and the site shows it in its original shape, so there’s no need to crop it.',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType === 'image' && !value) {
            return 'Required when media type is Photo'
          }
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
      description:
        'Upload your video exactly as exported. Portrait or landscape both work — the site shows it in its original shape, so there’s no need to crop it. In the grid, it plays automatically as a silent, looping preview — there’s no expanded or full-sound playback on the site yet. If an upload fails with “Something went wrong,” message Michael — it’s usually an account limit, not your file.',
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
      name: 'previewStart',
      title: 'Preview start',
      type: 'number',
      description:
        'Where this video’s 10-second preview begins in the grid. Use the player below to pick the moment. Leave empty to use the first 10 seconds. Visitors who click still see the full video.',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (rule) => rule.min(0).error('Must be 0 seconds or later.'),
      components: { input: PreviewStartInput },
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'Optional. A short, plain description of what is in the photo or video — helps with accessibility and search engines. Leave blank if you are not sure what to put.',
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
      videoPlaybackId: 'video.asset.playbackId',
      previewStart: 'previewStart',
      alt: 'alt',
    },
    prepare({ mediaType, image, videoPlaybackId, previewStart, alt }) {
      return {
        title: alt || (mediaType === 'video' ? 'Video' : 'Photo'),
        subtitle: mediaType === 'video' ? 'Video' : 'Photo',
        // Image: pass the asset value straight through — Sanity's own
        // preview machinery renders it, same as pressLogo/partner's `logo`.
        // Video: Mux has no Sanity-native preview, so build the thumbnail
        // URL from the dereferenced playbackId (resolved by `select` above,
        // synchronously available here — no fetch, no loading state).
        media:
          mediaType === 'video' && videoPlaybackId
            ? createElement('img', {
                src: muxThumbnailUrl(videoPlaybackId, previewStart),
                alt: '',
              })
            : image,
      }
    },
  },
})
