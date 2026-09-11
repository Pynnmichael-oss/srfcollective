import { urlFor } from '@/lib/sanity/image'
import type { Partner } from '@/lib/sanity/types'

import styles from './Activations.module.css'

interface ActivationsProps {
  heading?: string
  lede?: string
  partners: Partner[]
}

export default function Activations({ heading, lede, partners }: ActivationsProps) {
  const hasCopy = Boolean(heading || lede)
  const hasPartners = partners.length > 0

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
          {partners.map((partner) => (
            <li key={partner._id} className={styles.partner}>
              {partner.logo?.asset?._ref ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urlFor(partner.logo).height(32).fit('max').auto('format').url()}
                  alt={partner.name}
                  className={styles.logo}
                />
              ) : (
                partner.name
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
