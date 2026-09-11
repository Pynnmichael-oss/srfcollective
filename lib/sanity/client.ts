import { createClient } from 'next-sanity'

// Dated API version, per https://www.sanity.io/docs/api-versioning
export const apiVersion = '2024-01-01'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Only ever read published content from the frontend — no drafts.
  perspective: 'published',
  useCdn: true,
})
