import type { CSSProperties, ReactNode } from 'react'

import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { MediaItem, PhotoItem } from '@/lib/sanity/types'
import { parseMuxRatio } from '@/lib/sanity/video'

import styles from './ProjectHero.module.css'
import WorkTileVideo from './WorkTileVideo'

const BANNER_WIDTHS = [800, 1200, 1600, 2000, 2400]
const CONTAINED_WIDTHS = [400, 800, 1200, 1600]

interface ProjectHeroProps {
  item: MediaItem
  mode: 'banner' | 'contained'
  client: string
  // The title block. In banner mode it's overlaid on the image; in
  // contained mode the page renders it below instead, since text over a
  // tall video is both hard to read and in the way of the play control.
  overlay?: ReactNode
}

// Sanity's hotspot as a CSS object-position, so the browser does the
// responsive cropping while keeping her chosen focal point in frame. One
// image then serves the wide desktop banner and the taller mobile one with
// no second fetch.
function hotspotPosition(image: PhotoItem): string {
  if (!image.hotspot) return '50% 50%'
  return `${(image.hotspot.x * 100).toFixed(2)}% ${(image.hotspot.y * 100).toFixed(2)}%`
}

function Banner({
  item,
  client,
  overlay,
}: {
  item: PhotoItem
  client: string
  overlay?: ReactNode
}) {
  const src = urlFor(item).width(2400).fit('max').auto('format').url()
  const srcSet = BANNER_WIDTHS.map(
    (w) => `${urlFor(item).width(w).fit('max').auto('format').url()} ${w}w`,
  ).join(', ')
  const placeholder = urlFor(item).width(24).quality(20).blur(50).url()

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
        alt={item.alt || client}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={styles.bannerImage}
        style={{ objectPosition: hotspotPosition(item) }}
      />
      {overlay && (
        <>
          {/* Gradient, not a flat tint: keeps the top of the photo untouched
              while guaranteeing contrast behind the text at the bottom,
              whatever the photo happens to be. */}
          <div className={styles.scrim} aria-hidden="true" />
          <div className={styles.overlay}>{overlay}</div>
        </>
      )}
    </div>
  )
}

export default function ProjectHero({ item, mode, client, overlay }: ProjectHeroProps) {
  if (mode === 'banner' && item._type === 'photoItem' && item.asset?._ref) {
    return <Banner item={item} client={client} overlay={overlay} />
  }

  // Contained: the item at its own shape, sized by height so width follows
  // the content and the asset is only ever scaled down, never up.
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
