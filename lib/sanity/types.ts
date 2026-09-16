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
