// Hand-written types for the frontend's data-fetching layer.
// These mirror the fields defined in schemas/ — kept in sync manually,
// since schema type generation isn't set up.

// Anything urlFor()/getImageDimensions() can take: both a plain `image`
// field (SanityImage, below) and a `photoItem` array member, which is an
// image whose `_type` carries the member name instead of 'image'.
export interface ImageSource {
  asset?: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface SanityImage extends ImageSource {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

export interface MuxVideo {
  asset?: {
    playbackId?: string
    // "ready" once Mux finishes processing; also "preparing", "errored", etc.
    status?: string
    // Mux's own "W:H" string, e.g. "9:16" — parsed via parseMuxRatio().
    ratio?: string | null
    // Seconds — used with previewStart to compute the grid's clip window
    // (see lib/video.ts).
    duration?: number | null
  } | null
}

export interface Slug {
  _type: 'slug'
  current: string
}

// One photo in a project's `media` array. Declared in the schema as an
// `image` array member (see schemas/objects/photoItem.ts), so the item IS
// the image — asset and hotspot sit directly on it, not under `.image`.
export interface PhotoItem extends ImageSource {
  _key: string
  _type: 'photoItem'
  alt?: string
}

// One video in a project's `media` array.
export interface VideoItem {
  _key: string
  _type: 'videoItem'
  video?: MuxVideo | null
  // Seconds into the video where the grid's 10-second preview starts.
  // Missing/undefined means "from 0:00" (see lib/video.ts's clipWindow()).
  previewStart?: number
  alt?: string
}

export type MediaItem = PhotoItem | VideoItem

export interface Project {
  _id: string
  _type: 'project'
  client: string
  slug?: Slug
  categories?: string[]
  // Every photo and video for this client, in the order she arranged them.
  // media[0] is the cover (what the homepage shows). Queries already drop
  // items with nothing uploaded yet, so every item here is renderable.
  media?: MediaItem[]
}

// A single grid cell: one photo or video, plus the project captioning it.
// The grids render tiles, not projects, because one project can hold many
// items — see lib/sanity/media.ts for how projects become tiles.
export interface MediaTile {
  key: string
  client: string
  categories?: string[]
  item: MediaItem
}

// Minimal shape of a Portable Text block as returned by the API — only what
// the About page reads. (Not the full @portabletext/types definition.)
export interface PortableTextSpan {
  _type: 'span'
  _key: string
  text?: string
  marks?: string[]
}

export interface PortableTextBlock {
  _type: 'block'
  _key: string
  style?: string
  markDefs?: { _key: string; _type: string }[]
  children?: PortableTextSpan[]
}

// Every field is optional/nullable — the portrait in particular is unset
// until Rosie delivers a photo, and the page must render without it.
export interface AboutSettings {
  _id: string
  _type: 'aboutSettings'
  portrait?: SanityImage | null
  portraitAlt?: string | null
  statement?: string | null
  founderIntro?: string | null
  body?: PortableTextBlock[] | null
}

export interface Service {
  _id: string
  title: string
  subtitle?: string | null
  description: string
}

// heading/intro etc. describe the singleton document itself — the whole
// thing is null (see ServicesPageData) until it's been published at all.
export interface ServicesPage {
  heading: string
  intro?: string | null
  closingHeading?: string | null
  closingLinkLabel?: string | null
}

export interface ServicesPageData {
  page: ServicesPage | null
  services: Service[]
}

export interface PressLogo {
  _id: string
  _type: 'pressLogo'
  name: string
  logo?: SanityImage
}

export interface Partner {
  _id: string
  _type: 'partner'
  name: string
  logo?: SanityImage
}

export interface SiteSettings {
  _id: string
  _type: 'siteSettings'
  heroHeadline: string
  heroSubline: string
  activationsHeading: string
  activationsLede: string
  footerLocation: string
  instagramUrl: string
  ctaHeading?: string
  contactEmail?: string
  seoTitle?: string
  seoDescription?: string
  ogImage?: SanityImage
}
