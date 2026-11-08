import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { MediaTile, PhotoItem, VideoItem } from '@/lib/sanity/types'
import { parseMuxRatio } from '@/lib/sanity/video'

import styles from './WorkTile.module.css'
import WorkTileVideo from './WorkTileVideo'

const WIDTHS = [400, 800, 1200, 1600]
const SIZES = '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw'

interface WorkTileProps {
  tile: MediaTile
  priority?: boolean
  // 'link'      -> the whole tile navigates to the project's page. Used on
  //                /work, where each tile stands for a whole project.
  // 'spotlight' -> a video opens full-screen in place and a photo is inert.
  //                Used on the homepage (a quick look) and on a project
  //                page (where navigating to itself would be pointless).
  behavior?: 'link' | 'spotlight'
  // Project pages suppress the caption: every tile there belongs to the
  // same project, so repeating the client name under each one is noise.
  caption?: boolean
}

// One grid cell renders one photo or video. The caption comes from the
// project the item belongs to, so several tiles from the same project all
// carry the same client name — see lib/sanity/media.ts.
function Caption({
  client,
  categories,
  show,
}: {
  client: string
  categories?: string[]
  show: boolean
}) {
  const tags = categories?.length ? categories.join(', ') : undefined
  if (!show || (!client && !tags)) return null

  return (
    <figcaption className={styles.caption}>
      {client && <span className={styles.client}>{client}</span>}
      {tags && <span className={styles.category}>{tags}</span>}
    </figcaption>
  )
}

function VideoTile({
  tile,
  item,
  behavior,
  caption,
}: {
  tile: MediaTile
  item: VideoItem
  behavior: 'link' | 'spotlight'
  caption: boolean
}) {
  const playbackId = item.video?.asset?.playbackId
  const status = item.video?.asset?.status

  // Mux still processing, or the asset/playbackId is missing — skip the
  // tile rather than render a broken player, mirroring the photo guard.
  if (!playbackId || status !== 'ready') {
    return null
  }

  // The asset's own ratio is the only source now. The old code fell back to
  // the project's single `image` field when Mux's ratio was unparseable; a
  // video item has no companion image, so an unparseable ratio means skip
  // rather than guess a shape (never 16:9). Verified against the live
  // dataset: every ready asset reports one.
  const ratio = parseMuxRatio(item.video?.asset?.ratio)
  if (!ratio) {
    return null
  }

  const alt = item.alt || tile.client || 'Project video'
  // Link mode falls back to spotlight when the project has no slug, rather
  // than rendering a dead tile.
  const href = behavior === 'link' ? tile.projectHref : undefined

  return (
    <figure className={styles.tile}>
      <div
        className={styles.frame}
        style={{ '--tile-ratio': `${ratio.width} / ${ratio.height}` } as CSSProperties}
      >
        <WorkTileVideo
          playbackId={playbackId}
          previewStart={item.previewStart}
          duration={item.video?.asset?.duration ?? undefined}
          alt={alt}
          href={href}
          projectHref={href ? undefined : tile.projectHref}
        />
      </div>
      <Caption client={tile.client} categories={tile.categories} show={caption} />
    </figure>
  )
}

function PhotoTile({
  tile,
  item,
  priority,
  behavior,
  caption,
}: {
  tile: MediaTile
  item: PhotoItem
  priority: boolean
  behavior: 'link' | 'spotlight'
  caption: boolean
}) {
  // Missing-image guard — never render a broken image or empty frame.
  if (!item.asset?._ref) {
    return null
  }

  const { width, height } = getImageDimensions(item)
  const src = urlFor(item).width(1200).fit('max').auto('format').url()
  const srcSet = WIDTHS.map(
    (w) => `${urlFor(item).width(w).fit('max').auto('format').url()} ${w}w`,
  ).join(', ')
  // Tiny, heavily blurred stand-in shown behind the real image while it
  // loads — a manual LQIP built from the same asset ref, no extra query.
  const placeholder = urlFor(item).width(24).quality(20).blur(50).url()
  // client is schema-required so this should always resolve to a real
  // name; the final fallback only guards a document written outside
  // Studio's validation (e.g. directly via the write API).
  const alt = item.alt || tile.client || 'Project image'

  const href = behavior === 'link' ? tile.projectHref : undefined

  const picture: ReactNode = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      srcSet={srcSet}
      sizes={SIZES}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={styles.image}
    />
  )

  return (
    <figure className={styles.tile}>
      <div
        className={styles.frame}
        style={
          {
            '--tile-ratio': `${width} / ${height}`,
            backgroundImage: `url(${placeholder})`,
          } as CSSProperties
        }
      >
        {href ? (
          <Link href={href} className={styles.photoLink} aria-label={`View the ${tile.client} project`}>
            {picture}
          </Link>
        ) : (
          picture
        )}
      </div>
      <Caption client={tile.client} categories={tile.categories} show={caption} />
    </figure>
  )
}

export default function WorkTile({
  tile,
  priority = false,
  behavior = 'spotlight',
  caption = true,
}: WorkTileProps) {
  if (tile.item._type === 'videoItem') {
    return <VideoTile tile={tile} item={tile.item} behavior={behavior} caption={caption} />
  }

  return (
    <PhotoTile
      tile={tile}
      item={tile.item}
      priority={priority}
      behavior={behavior}
      caption={caption}
    />
  )
}
