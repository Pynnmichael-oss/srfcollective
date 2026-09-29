import type { Partner } from '@/lib/sanity/types'

import styles from './Activations.module.css'

interface ActivationsProps {
  heading?: string
  lede?: string
  partners: Partner[]
}

export default function Activations({ heading, lede, partners }: ActivationsProps) {
  // Logos stay in Sanity for possible future use — just not rendered, and a
  // partner without a name (defensive; the schema requires one) has nothing
  // to typeset, so it's skipped rather than left as an empty <li>.
  const namedPartners = partners.filter((partner) => partner.name)

  const hasCopy = Boolean(heading || lede)
  const hasPartners = namedPartners.length > 0

  // heading/lede and partners are independent data sources — only hide
  // what's actually missing, never collapse the whole section for one.
  if (!hasCopy && !hasPartners) {
    return null
  }

  return (
    <section className={styles.section}>
      {hasCopy && (
        <div className={styles.copy}>
          {heading && <h2 className={styles.heading}>{heading}</h2>}
          {lede && <p className={styles.lede}>{lede}</p>}
        </div>
      )}
      {hasPartners && (
        <ul className={styles.partners}>
          {namedPartners.map((partner) => (
            <li key={partner._id} className={styles.partner}>
              {partner.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
