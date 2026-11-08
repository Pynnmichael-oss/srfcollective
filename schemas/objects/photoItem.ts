import { defineField, defineType } from 'sanity'

// One photo inside a project's `media` array.
//
// Declared as `type: 'image'` with an extra field rather than an object
// wrapping an image, which is what makes Studio's multi-file upload work:
// dropping twenty photos onto the array creates twenty items. An object
// wrapper (the old `mediaItem`) could only ever be added one at a time,
// and forced the editor to pick Photo-or-Video from a radio *before* the
// upload box appeared. The array member name is what lands in `_type`, so
// these documents read as `_type: 'photoItem'`, not 'image'.
export default defineType({
  name: 'photoItem',
  title: 'Photo',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'Optional. A short, plain description of what is in the photo — helps with accessibility and search engines. Leave blank if you are not sure what to put.',
    }),
  ],
  description:
    'Please use a photo that is at least 1600px on the long edge, under 2MB, and saved as a JPEG. Upload it in whatever shape it naturally is — portrait or landscape both work, and the site shows it in its original shape, so there is no need to crop it.',
})
