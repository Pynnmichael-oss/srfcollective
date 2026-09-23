// Hand-written types for the frontend's data-fetching layer.
// These mirror the fields defined in schemas/ — kept in sync manually,
// since schema type generation isn't set up.

export interface SanityImage {
  _type: 'image'
  asset: {
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

export interface MuxVideo {
  asset?: {
    playbackId?: string
    // "ready" once Mux finishes processing; also "preparing", "errored", etc.
    status?: string
  } | null
}

export interface Slug {
  _type: 'slug'
  current: string
}

export interface Project {
  _id: string
  _type: 'project'
  mediaType?: 'image' | 'video'
  image?: SanityImage
  video?: MuxVideo | null
  slug?: Slug
  client: string
  category: string
  alt?: string
  aspectRatioHint?: string
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

// A dereferenced image asset (unlike SanityImage's bare _ref) — used where
// the frontend needs the asset's real dimensions/LQIP up front, e.g. for a
// fade-in with no layout shift.
export interface SanityImageAsset {
  _id: string
  url: string
  metadata?: {
    lqip?: string
    dimensions?: {
      width: number
      height: number
      aspectRatio: number
    }
  }
}

export interface SanityImageWithAsset {
  _type: 'image'
  asset: SanityImageAsset
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface Service {
  _id: string
  title: string
  subtitle?: string | null
  description: string
  hoverImage?: SanityImageWithAsset | null
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
  seoTitle?: string
  seoDescription?: string
  ogImage?: SanityImage
}
