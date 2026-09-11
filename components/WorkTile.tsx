import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'

import styles from './WorkTile.module.css'

const WIDTHS = [400, 800, 1200, 1600]
const SIZES = '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw'

interface WorkTileProps {
  project: Project
  priority?: boolean
}

export default function WorkTile({ project, priority = false }: WorkTileProps) {
  // Missing-image guard — never render a broken image or empty frame.
  if (!project.image?.asset?._ref) {
    return null
  }

  const { width, height } = getImageDimensions(project.image)
  const src = urlFor(project.image).width(1200).fit('max').auto('format').url()
  const srcSet = WIDTHS.map(
    (w) => `${urlFor(project.image).width(w).fit('max').auto('format').url()} ${w}w`,
  ).join(', ')
  // Tiny, heavily blurred stand-in shown behind the real image while it
  // loads — a manual LQIP built from the same asset ref, no extra query.
  const placeholder = urlFor(project.image).width(24).quality(20).blur(50).url()
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
