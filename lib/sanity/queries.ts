import { groq } from 'next-sanity'

// Orderable lists (project, pressLogo, partner) are sorted by orderRank,
// the field managed by @sanity/orderable-document-list's drag-to-reorder.

// Shared by every query that lists projects (homepage highlights, /work) —
// keep in sync with schemas/project.ts, and don't rename fields here
// without updating every consumer (WorkTile, media.ts, page.tsx,
// work/page.tsx).
//
// `media` is an array of two member types (schemas/objects/photoItem.ts and
// videoItem.ts), so one projection covers both: a photoItem IS an image, so
// its asset/hotspot sit directly on the item, while a videoItem carries
// `video` and `previewStart`. The fields that don't apply come back null,
// and WorkTile branches on `_type`.
const mediaProjection = groq`
  _key,
  _type,
  asset,
  hotspot,
  video{
    asset->{
      playbackId,
      status,
      "ratio": data.aspect_ratio,
      "duration": data.duration
    }
  },
  previewStart,
  alt
`

// An item with nothing uploaded yet renders as nothing, so it's dropped at
// the query rather than guarded in every component: a half-finished media
// item is a normal state in Studio (she adds the row, then uploads), and
// the live site should simply not show it.
const RENDERABLE = groq`(_type == "photoItem" && defined(asset._ref)) || (_type == "videoItem" && defined(video.asset))`

const projectProjection = groq`
  _id,
  _type,
  client,
  categories,
  slug,
  "media": media[${RENDERABLE}]{
    ${mediaProjection}
  }
`

// Two forms of the same question, because the two queries ask it at
// different points. This one runs against the raw document, before
// projection, where `media` still holds unrenderable items.
const HAS_RAW_MEDIA = groq`count(media[${RENDERABLE}]) > 0`

// ...and this one runs against the already-projected result, where `media`
// has been filtered down by projectProjection, so being non-empty is the
// whole test.
const HAS_PROJECTED_MEDIA = groq`count(media) > 0`

// Rosie's curated homepage picks, in the order she set in Studio (siteSettings
// > Homepage highlights). Array order from -> is preserved by GROQ; no sort.
//
// The outer parens around the dereference+projection are load-bearing, not
// stylistic: chaining a [filter] directly onto path[]->{...} (no parens)
// nulls out every element instead of filtering them — confirmed against
// the live dataset with a dangling reference. Wrapping in () first, then
// filtering the resulting array, is the only form that behaves correctly.
//
// The filter also drops dangling weak references: siteSettings.featuredProjects
// can point at a deleted project, which dereferences to null.
export const featuredProjectsQuery = groq`
  (*[_type == "siteSettings"][0].featuredProjects[]->{
    ${projectProjection}
  })[${HAS_PROJECTED_MEDIA}]
`

// Full portfolio for /work, in the same Studio drag-order as the Projects list.
// One tile per project (its cover) — each links through to the project's own
// page, which is where the rest of its media lives.
export const workProjectsQuery = groq`
  *[_type == "project" && (${HAS_RAW_MEDIA})] | order(orderRank) {
    ${projectProjection}
  }
`

// Every project page to prerender. Mirrors workProjectsQuery's filter: a
// project with no renderable media has nothing to show, and one without a
// slug has no address to show it at.
export const projectSlugsQuery = groq`
  *[_type == "project" && defined(slug.current) && (${HAS_RAW_MEDIA})].slug.current
`

// One project page. `description` and `date` are projected here and nowhere
// else — the grids don't show them.
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug && (${HAS_RAW_MEDIA})][0]{
    ${projectProjection},
    coverPhoto,
    description,
    date
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
// above. The Services page no longer renders an image per service, so
// hoverImage isn't projected here even though the schema field still
// exists for editors.
export const servicesPageQuery = groq`
  {
    "page": *[_type == "servicesPage"][0]{ heading, intro, closingHeading, closingLinkLabel },
    "services": *[_type == "service" && defined(title)] | order(orderRank){
      _id, title, subtitle, description
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
    ctaHeading,
    contactEmail,
    seoTitle,
    seoDescription,
    ogImage
  }
`
