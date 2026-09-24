import { groq } from 'next-sanity'

// Orderable lists (project, pressLogo, partner) are sorted by orderRank,
// the field managed by @sanity/orderable-document-list's drag-to-reorder.

// Shared by every query that lists projects (homepage highlights, /work) —
// keep in sync with schemas/project.ts, and don't rename fields here
// without updating every consumer (WorkTile, page.tsx, work/page.tsx).
const projectProjection = groq`
  _id,
  _type,
  mediaType,
  image,
  video{
    asset->{
      playbackId,
      status,
      "ratio": data.aspect_ratio
    }
  },
  client,
  category,
  alt
`

// A project with neither an image nor a video asset defined is either a
// dangling weak reference (siteSettings.featuredProjects can point at a
// deleted project, which dereferences to null) or genuinely has nothing
// to render — either way, skip it. Checking both media types, not just
// image, matters: several real video projects have no fallback `image`
// set at all (mediaType: "video" is enough on its own; WorkTile only
// falls back to `image` when the Mux ratio can't be parsed).
const HAS_MEDIA = groq`defined(image.asset) || defined(video.asset)`

// Rosie's curated homepage picks, in the order she set in Studio (siteSettings
// > Homepage highlights). Array order from -> is preserved by GROQ; no sort.
//
// The outer parens around the dereference+projection are load-bearing, not
// stylistic: chaining a [filter] directly onto path[]->{...} (no parens)
// nulls out every element instead of filtering them — confirmed against
// the live dataset with a dangling reference. Wrapping in () first, then
// filtering the resulting array, is the only form that behaves correctly.
export const featuredProjectsQuery = groq`
  (*[_type == "siteSettings"][0].featuredProjects[]->{
    ${projectProjection}
  })[${HAS_MEDIA}]
`

// Full portfolio for /work, in the same Studio drag-order as the Projects list.
export const workProjectsQuery = groq`
  *[_type == "project" && (${HAS_MEDIA})] | order(orderRank) {
    ${projectProjection}
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
