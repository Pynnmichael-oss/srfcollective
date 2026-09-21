import { groq } from 'next-sanity'

// Orderable lists (project, pressLogo, partner) are sorted by orderRank,
// the field managed by @sanity/orderable-document-list's drag-to-reorder.

export const projectsQuery = groq`
  *[_type == "project"] | order(orderRank) {
    _id,
    _type,
    mediaType,
    image,
    video{
      asset->{
        playbackId,
        status
      }
    },
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

// logo is fetched bare (same convention as project.image): the returned
// object's asset._ref already carries the source dimensions, parseable via
// getImageDimensions() if ever needed — no asset-> dereference required.
export const partnersQuery = groq`
  *[_type == "partner"] | order(orderRank) {
    _id,
    _type,
    name,
    logo
  }
`

// Singleton, same shape as siteSettingsQuery. portrait is fetched bare (same
// convention as project.image) — it's optional and may be unset.
export const aboutSettingsQuery = groq`
  *[_type == "aboutSettings"][0] {
    _id,
    _type,
    portrait,
    portraitAlt,
    statement,
    founderIntro,
    body
  }
`

// Singleton, same shape as aboutSettingsQuery. Array items are projected
// with _key so the frontend can key them without falling back to an index.
export const servicesSettingsQuery = groq`
  *[_type == "servicesSettings"][0] {
    _id,
    _type,
    intro,
    services[]{
      _key,
      title,
      description
    }
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
