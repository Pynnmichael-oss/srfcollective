import Link from 'next/link'

import type { Service, ServicesPage } from '@/lib/sanity/types'

import styles from './Services.module.css'

interface ServicesProps {
  page: ServicesPage | null
  services: Service[]
}

// Trim first so whitespace-only text counts as missing — otherwise it would
// render an empty element or spacing around nothing.
function clean(item: Service) {
  return {
    _id: item._id,
    title: item.title?.trim(),
    subtitle: item.subtitle?.trim() || undefined,
    description: item.description?.trim(),
  }
}

export default function Services({ page, services }: ServicesProps) {
  const heading = page?.heading?.trim() || 'Services'
  const intro = page?.intro?.trim()
  const closingHeading = page?.closingHeading?.trim()
  const closingLinkLabel = page?.closingLinkLabel?.trim() || 'Start a conversation'

  // An item with neither a title nor a description has nothing to show.
  const items = services.map(clean).filter((item) => item.title || item.description)

  return (
    <>
      <section className={styles.intro}>
        <h1 className={styles.heading}>{heading}</h1>
        {intro && <p className={styles.lede}>{intro}</p>}
      </section>

      {items.length > 0 && (
        <section aria-label="Services" className={styles.listSection}>
          <ol className={styles.list}>
            {items.map((item, index) => (
              <li key={item._id} className={styles.row}>
                <span className={styles.num} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className={styles.titleGroup}>
                  {item.title && <h2 className={styles.title}>{item.title}</h2>}
                  {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
                </div>
                {item.description && <p className={styles.description}>{item.description}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {closingHeading && (
        <section className={styles.closing}>
          <h2 className={styles.closingHeading}>{closingHeading}</h2>
          <Link href="/contact" className={styles.closingLink}>
            {closingLinkLabel} →
          </Link>
        </section>
      )}
    </>
  )
}
