import type { CSSProperties } from 'react'

import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { MediaItem } from '@/lib/sanity/types'
import { parseMuxRatio } from '@/lib/sanity/video'

import styles from './ProjectHero.module.css'
import WorkTileVideo from './WorkTileVideo'

const WIDTHS = [800, 1200, 1600, 2000]

interface ProjectHeroProps {
  // The project's cover: media[0], whatever she dragged to the top.
  item: MediaItem
  client: string
}

// The full-bleed cover at the top of a project page. Deliberately not a
// WorkTile: it spans the viewport edge to edge with no frame, no caption
// and no grid column, and its height is capped so a 9:16 portrait video
// doesn't push the project's name three screens down.
export default function ProjectHero({ item, client }: ProjectHeroProps) {
  if (item._type === 'videoItem') {
    const playbackId = item.video?.asset?.playbackId
    const status = item.video?.asset?.status
    const ratio = parseMuxRatio(item.video?.asset?.ratio)

    if (!playbackId || status !== 'ready' || !ratio) {
      return null
    }

    return (
      <div
        className={styles.hero}
        style={{ '--hero-ratio': `${ratio.width} / ${ratio.height}` } as CSSProperties}
      >
        {/* No href: a link back to the page you're already on is pointless,
            so the cover opens the spotlight in place like the homepage. */}
        <WorkTileVideo
          playbackId={playbackId}
          previewStart={item.previewStart}
          duration={item.video?.asset?.duration ?? undefined}
          alt={item.alt || client}
        />
      </div>
    )
  }

  if (!item.asset?._ref) {
    return null
  }

  const { width, height } = getImageDimensions(item)
  const src = urlFor(item).width(2000).fit('max').auto('format').url()
  const srcSet = WIDTHS.map(
    (w) => `${urlFor(item).width(w).fit('max').auto('format').url()} ${w}w`,
  ).join(', ')
  const placeholder = urlFor(item).width(24).quality(20).blur(50).url()

  return (
    <div
      className={styles.hero}
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
        sizes="100vw"
        alt={item.alt || client}
        width={width}
        height={height}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className={styles.image}
      />
    </div>
  )
}
