import type { Project } from '@/lib/sanity/types'

import styles from './WorkGrid.module.css'
import WorkTile from './WorkTile'

interface WorkGridProps {
  projects: Project[]
}

// Desktop is 3 CSS columns. Since this is a columns-based masonry (not a
// JS grid with real row boundaries), "first row" is approximated as the
// first 3 tiles — one per column — a reasonable stand-in noted per the
// task, not a guaranteed visual first row on every breakpoint.
const EAGER_COUNT = 3

export default function WorkGrid({ projects }: WorkGridProps) {
  if (!projects.length) {
    return null
  }

  return (
    <section className={styles.section} aria-label="Work">
      <div className={styles.grid}>
        {projects.map((project, index) => (
          <WorkTile key={project._id} project={project} priority={index < EAGER_COUNT} />
        ))}
      </div>
    </section>
  )
}
