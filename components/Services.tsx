import type { Service, ServicesPage } from '@/lib/sanity/types'

import styles from './Services.module.css'

interface ServicesProps {
  page: ServicesPage | null
  services: Service[]
}

// Trim first so whitespace-only text counts as missing — otherwise it would
// render an empty heading or paragraph with spacing around it.
function clean(item: Service) {
  return {
    _id: item._id,
    title: item.title?.trim(),
    description: item.description?.trim(),
  }
}

// Minimal remap onto the new service/servicesPage content model (see
// schemas/service.ts, schemas/servicesPage.ts) — subtitle and hoverImage
// are fetched but intentionally unused here; the editorial hover layout is
// a separate, later UI task.
export default function Services({ page, services }: ServicesProps) {
  const heading = page?.heading?.trim() || 'Services'
  const intro = page?.intro?.trim()
  // An item with neither a title nor a description has nothing to show.
  const items = services.map(clean).filter((item) => item.title || item.description)

  // No services to list — hide the whole page body rather than render a
  // lone heading over an empty list.
  if (!items.length) {
    return null
  }

  return (
    <section className={styles.services}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{heading}</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item._id} className={styles.item}>
            {item.title && <h2 className={styles.title}>{item.title}</h2>}
            {item.description && <p className={styles.description}>{item.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
