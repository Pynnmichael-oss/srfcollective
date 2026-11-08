import Link from 'next/link'

import type { MediaTile } from '@/lib/sanity/types'

import styles from './WorkGrid.module.css'
import WorkTile from './WorkTile'

interface WorkGridProps {
  // One cell per photo or video, not per project — built by coverTiles()
  // (homepage) or allTiles() (/work) in lib/sanity/media.ts.
  tiles: MediaTile[]
  // Renders a centered "View all work" link below the grid when set — used
  // on the homepage (linking to /work); omitted on /work itself.
  viewAllHref?: string
  // Renders a left-aligned label above the grid when set — used on the
  // homepage ("Featured Work"); omitted on /work itself.
  label?: string
  // Passed to every tile: 'link' navigates to the project page (/work),
  // 'spotlight' opens a video in place (homepage). See WorkTile.
  behavior?: 'link' | 'spotlight'
}

// Desktop is 3 CSS columns. Since this is a columns-based masonry (not a
// JS grid with real row boundaries), "first row" is approximated as the
// first 3 tiles — one per column — a reasonable stand-in noted per the
// task, not a guaranteed visual first row on every breakpoint.
const EAGER_COUNT = 3

export default function WorkGrid({ tiles, viewAllHref, label, behavior }: WorkGridProps) {
  if (!tiles.length) {
    return null
  }

  return (
    <section className={styles.section} aria-label="Work">
      {label && (
        <div className={styles.header}>
          <p className={styles.label}>{label}</p>
          {viewAllHref && (
            <Link href={viewAllHref} className={styles.headerViewAll}>
              <span className={styles.viewAllText}>View all work</span>{' '}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      )}
      <div className={styles.grid}>
        {tiles.map((tile, index) => (
          <WorkTile
            key={tile.key}
            tile={tile}
            priority={index < EAGER_COUNT}
            behavior={behavior}
          />
        ))}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className={styles.viewAll}>
          <span className={styles.viewAllText}>View all work</span>{' '}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  )
}
