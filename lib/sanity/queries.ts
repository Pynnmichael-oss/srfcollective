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

// servicesPage is a singleton (may be null pre-publish); service is an
// orderable document list, same convention as project/pressLogo/partner
// above. hoverImage is dereferenced (unlike project/partner's bare image
// convention) since the future hover UI needs the asset's real dimensions
// up front for a fade-in with no layout shift.
export const servicesPageQuery = groq`
  {
    "page": *[_type == "servicesPage"][0]{ heading, intro, closingHeading, closingLinkLabel },
    "services": *[_type == "service" && defined(title)] | order(orderRank){
      _id, title, subtitle, description,
      hoverImage{ ..., asset->{ _id, url, metadata{ lqip, dimensions } } }
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
