import type { CSSProperties } from 'react'

import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { MediaItem, SanityImage } from '@/lib/sanity/types'
import { parseMuxRatio } from '@/lib/sanity/video'

import styles from './ProjectHero.module.css'
import WorkTileVideo from './WorkTileVideo'

const BANNER_WIDTHS = [800, 1200, 1600, 2000, 2400]
const CONTAINED_WIDTHS = [400, 800, 1200, 1600]

interface ProjectHeroProps {
  // The project's cover: media[0], whatever she dragged to the top. Used
  // only when there's no cover photo.
  item: MediaItem
  client: string
  coverPhoto?: SanityImage | null
}

// Sanity's hotspot, expressed as CSS object-position, so the browser does
// the responsive cropping while still keeping her chosen focal point in
// frame. Beats requesting a pre-cropped URL: one image serves the wide
// desktop banner and the taller mobile one without a second fetch.
function hotspotPosition(image: SanityImage): string {
  const hotspot = image.hotspot
  if (!hotspot) return '50% 50%'
  return `${(hotspot.x * 100).toFixed(2)}% ${(hotspot.y * 100).toFixed(2)}%`
}

// The wide banner across the top of a project page.
function Banner({ image, client }: { image: SanityImage; client: string }) {
  const src = urlFor(image).width(2400).fit('max').auto('format').url()
  const srcSet = BANNER_WIDTHS.map(
    (w) => `${urlFor(image).width(w).fit('max').auto('format').url()} ${w}w`,
  ).join(', ')
  const placeholder = urlFor(image).width(24).quality(20).blur(50).url()

  return (
    <div
      className={styles.banner}
      style={{ backgroundImage: `url(${placeholder})` } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        sizes="100vw"
        alt={client}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={styles.bannerImage}
        style={{ objectPosition: hotspotPosition(image) }}
      />
    </div>
  )
}

export default function ProjectHero({ item, client, coverPhoto }: ProjectHeroProps) {
  // A cover photo is a deliberate choice for this slot, so it gets the
  // full-bleed treatment.
  if (coverPhoto?.asset?._ref) {
    return <Banner image={coverPhoto} client={client} />
  }

  // No cover photo: show media[0] at its own shape, centred and sized by
  // height. Deliberately NOT full-bleed — cropping a 9:16 portrait into a
  // viewport-wide banner throws away most of the frame and upscales what's
  // left, which looks soft on 720p source footage. Height-driven sizing
  // (aspect-ratio + a height cap) means the width follows the content and
  // the asset is only ever scaled down, never up.
  if (item._type === 'videoItem') {
    const playbackId = item.video?.asset?.playbackId
    const status = item.video?.asset?.status
    const ratio = parseMuxRatio(item.video?.asset?.ratio)

    if (!playbackId || status !== 'ready' || !ratio) {
      return null
    }

    return (
      <div className={styles.containedOuter}>
        <div
          className={styles.contained}
          style={{ '--hero-ratio': `${ratio.width} / ${ratio.height}` } as CSSProperties}
        >
          {/* No href: linking to the page you're already on is pointless,
              so the cover opens the spotlight in place. */}
          <WorkTileVideo
            playbackId={playbackId}
            previewStart={item.previewStart}
            duration={item.video?.asset?.duration ?? undefined}
            alt={item.alt || client}
          />
        </div>
      </div>
    )
  }

  if (!item.asset?._ref) {
    return null
  }

  const { width, height } = getImageDimensions(item)
  const src = urlFor(item).width(1600).fit('max').auto('format').url()
  const srcSet = CONTAINED_WIDTHS.map(
    (w) => `${urlFor(item).width(w).fit('max').auto('format').url()} ${w}w`,
  ).join(', ')
  const placeholder = urlFor(item).width(24).quality(20).blur(50).url()

  return (
    <div className={styles.containedOuter}>
      <div
        className={styles.contained}
        style={
          {
            '--hero-ratio': `${width} / ${height}`,
            backgroundImage: `url(${placeholder})`,
          } as CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes="(max-width: 720px) 100vw, 60vh"
          alt={item.alt || client}
          width={width}
          height={height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={styles.containedImage}
        />
      </div>
    </div>
  )
}
