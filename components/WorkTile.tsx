import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'

import styles from './WorkTile.module.css'
import WorkTileVideo from './WorkTileVideo'

const WIDTHS = [400, 800, 1200, 1600]
const SIZES = '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw'

// Same fallback dimensions getImageDimensions() uses when an image ref's
// pixel size can't be parsed — reused here since the video{} projection
// (see lib/sanity/queries.ts) doesn't fetch Mux asset dimensions.
const FALLBACK_ASPECT = { width: 1600, height: 1200 }

interface WorkTileProps {
  project: Project
  priority?: boolean
}

export default function WorkTile({ project, priority = false }: WorkTileProps) {
  if (project.mediaType === 'video') {
    const playbackId = project.video?.asset?.playbackId
    const status = project.video?.asset?.status

    // Mux still processing, or the asset/playbackId is missing — skip the
    // tile rather than render a broken player, mirroring the missing-image
    // guard below.
    if (!playbackId || status !== 'ready') {
      return null
    }

    const poster = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1200&fit_mode=smartcrop`
    const alt = project.alt || project.client || 'Project video'
    const hasCaption = Boolean(project.client || project.category)

    return (
      <figure className={styles.tile}>
        <div
          className={styles.frame}
          style={{ aspectRatio: `${FALLBACK_ASPECT.width} / ${FALLBACK_ASPECT.height}` }}
        >
          <WorkTileVideo playbackId={playbackId} poster={poster} alt={alt} />
        </div>
        {hasCaption && (
          <figcaption className={styles.caption}>
            {project.client && <span className={styles.client}>{project.client}</span>}
            {project.category && <span className={styles.category}>{project.category}</span>}
          </figcaption>
        )}
      </figure>
    )
  }

  // Missing-image guard — never render a broken image or empty frame.
  const image = project.image
  if (!image?.asset?._ref) {
    return null
  }

  const { width, height } = getImageDimensions(image)
  const src = urlFor(image).width(1200).fit('max').auto('format').url()
  const srcSet = WIDTHS.map(
    (w) => `${urlFor(image).width(w).fit('max').auto('format').url()} ${w}w`,
  ).join(', ')
  // Tiny, heavily blurred stand-in shown behind the real image while it
  // loads — a manual LQIP built from the same asset ref, no extra query.
  const placeholder = urlFor(image).width(24).quality(20).blur(50).url()
  // client is schema-required so this should always resolve to a real
  // name; the final fallback only guards a document written outside
  // Studio's validation (e.g. directly via the write API).
  const alt = project.alt || project.client || 'Project image'

  const hasCaption = Boolean(project.client || project.category)

  return (
    <figure className={styles.tile}>
      <div
        className={styles.frame}
        style={{
          aspectRatio: `${width} / ${height}`,
          backgroundImage: `url(${placeholder})`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
      </div>
      {hasCaption && (
        <figcaption className={styles.caption}>
          {project.client && <span className={styles.client}>{project.client}</span>}
          {project.category && <span className={styles.category}>{project.category}</span>}
        </figcaption>
      )}
    </figure>
  )
}
