import { createImageUrlBuilder } from '@sanity/image-url'

import { dataset, projectId } from './client'
import type { SanityImage } from './types'

const builder = createImageUrlBuilder({
  projectId: projectId ?? '',
  dataset: dataset ?? '',
})

export function urlFor(source: SanityImage) {
  return builder.image(source)
}

// Sanity image asset refs encode their original pixel dimensions, e.g.
// "image-<assetId>-<width>x<height>-<format>". Parsing this gives an
// intrinsic width/height for layout (aspect-ratio, no CLS) without
// needing to add asset dereferencing to the existing queries.
export function getImageDimensions(source: SanityImage): { width: number; height: number } {
  const ref = source?.asset?._ref ?? ''
  const match = ref.match(/-(\d+)x(\d+)-/)

  if (!match) {
    return { width: 1600, height: 1200 }
  }

  return { width: Number(match[1]), height: Number(match[2]) }
}
