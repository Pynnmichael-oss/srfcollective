import { getImageDimensions, urlFor } from '@/lib/sanity/image'
import type { PhotoItem } from '@/lib/sanity/types'

import styles from './BehindTheScenes.module.css'

const WIDTHS = [400, 800, 1200]
const SIZES = '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw'

interface BehindTheScenesProps {
  photos: PhotoItem[]
}

function Photo({ photo }: { photo: PhotoItem }) {
  const { width, height } = getImageDimensions(photo)
  // Tiny blurred stand-in behind the real image while it loads — built from
  // the same asset ref, so no extra query.
  const placeholder = urlFor(photo).width(24).quality(20).blur(50).url()

  return (
    <figure
      className={styles.item}
      style={{ aspectRatio: `${width} / ${height}`, backgroundImage: `url(${placeholder})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urlFor(photo).width(1200).fit('max').auto('format').url()}
        srcSet={WIDTHS.map(
          (w) => `${urlFor(photo).width(w).fit('max').auto('format').url()} ${w}w`,
        ).join(', ')}
        sizes={SIZES}
        alt={photo.alt || ''}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={styles.image}
      />
    </figure>
  )
}

// Candid shoot photos below the About copy. Same CSS-columns masonry as the
// Work grid, so the two read as one system, and each photo keeps its own
// shape — nothing is cropped.
//
// Renders nothing at all when she hasn't added any, rather than an empty
// heading: an unused section shouldn't leave a hole in the page.
export default function BehindTheScenes({ photos }: BehindTheScenesProps) {
  if (!photos.length) {
    return null
  }

  return (
    <section className={styles.section} aria-labelledby="behind-the-scenes">
      <div className={styles.header}>
        <h2 id="behind-the-scenes" className={styles.label}>
          Behind the scenes
        </h2>
      </div>
      <div className={styles.grid}>
        {photos.map((photo) => (
          <Photo key={photo._key} photo={photo} />
        ))}
      </div>
    </section>
  )
}
