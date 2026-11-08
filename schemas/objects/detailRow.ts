import { defineField, defineType } from 'sanity'

// One labelled fact on a project page — "Location / The Hamptons".
// Free-form on both sides so a new kind of detail never needs a code
// change: she adds the row, it appears; she removes it, it doesn't.
export default defineType({
  name: 'detailRow',
  title: 'Detail',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The short heading, e.g. “Location”, “Team”, “Deliverables”.',
      validation: (rule) => rule.required().error('Give this row a label.'),
    }),
    defineField({
      name: 'value',
      title: 'Detail',
      type: 'string',
      description: 'What it says, e.g. “The Hamptons”.',
      validation: (rule) => rule.required().error('Fill in this row, or remove it.'),
    }),
  ],
  preview: {
    select: { label: 'label', value: 'value' },
    prepare({ label, value }) {
      return { title: value || 'Empty', subtitle: label || 'No label' }
    },
  },
})
