import { groq } from 'next-sanity'

// Orderable lists (project, pressLogo, partner) are sorted by orderRank,
// the field managed by @sanity/orderable-document-list's drag-to-reorder.

export const projectsQuery = groq`
  *[_type == "project"] | order(orderRank) {
    _id,
    _type,
    image,
    client,
    category,
    alt,
    aspectRatioHint
  }
`

export const pressLogosQuery = groq`
  *[_type == "pressLogo"] | order(orderRank) {
    _id,
    _type,
    name,
    logo
  }
`

export const partnersQuery = groq`
  *[_type == "partner"] | order(orderRank) {
    _id,
    _type,
    name,
    logo
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    _id,
    _type,
    heroHeadline,
    heroSubline,
    activationsHeading,
    activationsLede,
    footerLocation,
    instagramUrl,
    seoTitle,
    seoDescription,
    ogImage
  }
`
