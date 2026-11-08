import { createElement } from 'react'
import { defineField, defineType } from 'sanity'

import PreviewStartInput from '../components/PreviewStartInput'
import { muxThumbnailUrl } from '../lib/muxThumbnail'

// One video inside a project's `media` array. Split out of the old
// `mediaItem` object (which held both photo and video behind a required
// `mediaType` radio) so that "+ Add item" offers "Photo" or "Video"
// directly and the right upload box is there immediately — see photoItem.
export default defineType({
  name: 'videoItem',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
      description:
        'Upload your video exactly as exported. Portrait or landscape both work — the site shows it in its original shape, so there is no need to crop it. In the grid it plays automatically as a silent, looping preview; visitors who click see the full video.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'previewStart',
      title: 'Which moment shows in the grid',
      type: 'number',
      description:
        'Where this video’s 10-second grid preview begins. Use the player below to pick the moment. Leave empty to use the first 10 seconds. Visitors who click still see the full video.',
      validation: (rule) => rule.min(0).error('Must be 0 seconds or later.'),
      components: { input: PreviewStartInput },
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'Optional. A short, plain description of what is in the video — helps with accessibility and search engines. Leave blank if you are not sure what to put.',
    }),
  ],
  preview: {
    select: {
      playbackId: 'video.asset.playbackId',
      previewStart: 'previewStart',
      alt: 'alt',
    },
    prepare({ playbackId, previewStart, alt }) {
      return {
        title: alt || 'Video',
        subtitle: 'Video',
        // Mux has no Sanity-native preview, so the thumbnail URL is built
        // from the dereferenced playbackId that `select` resolved above —
        // synchronously available here, no fetch and no loading state.
        media: playbackId
          ? createElement('img', { src: muxThumbnailUrl(playbackId, previewStart), alt: '' })
          : undefined,
      }
    },
  },
})
