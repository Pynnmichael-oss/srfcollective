import type { ServiceItem, ServicesSettings } from '@/lib/sanity/types'

import styles from './Services.module.css'

interface ServicesProps {
  services: ServicesSettings | null
}

// Trim first so whitespace-only text counts as missing — otherwise it would
// render an empty heading or paragraph with spacing around it.
function clean(item: ServiceItem) {
  return {
    _key: item._key,
    title: item.title?.trim(),
    description: item.description?.trim(),
  }
}

export default function Services({ services }: ServicesProps) {
  const intro = services?.intro?.trim()
  // An item with neither a title nor a description has nothing to show.
  const items = (services?.services ?? [])
    .map(clean)
    .filter((item) => item.title || item.description)

  // No services to list — hide the whole page body rather than render a
  // lone heading over an empty list.
  if (!items.length) {
    return null
  }

  return (
    <section className={styles.services}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Services</h1>
        {intro && <p className={styles.intro}>{intro}</p>}
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item._key} className={styles.item}>
            {item.title && <h2 className={styles.title}>{item.title}</h2>}
            {item.description && <p className={styles.description}>{item.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
