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
                  // Fetched height follows the .logo CSS height (48px) —
                  // keep in sync with Activations.module.css, or the
                  // <img> upscales a lower-res source and looks soft.
                  // Deliberately height-only: @sanity/image-url auto-crops
                  // to a center rect whenever both width() and height() are
                  // given (to force that exact box), which silently
                  // mangled square/vertical logos like LDV Properties'
                  // (its mark+wordmark+icon lockup got center-cropped to a
                  // thin illegible sliver). height() alone preserves each
                  // logo's real aspect ratio with no cropping.
                  src={urlFor(partner.logo).height(48).fit('max').auto('format').url()}
                  alt={partner.name}
                  tabIndex={0}
                  className={styles.logo}
                />
              ) : (
                // Text fallback — used today for any partner without a logo,
                // and kept here (not deleted) as the reversion path: to go
                // back to all-text partner names, replace the ternary above
                // with just `partner.name`.
                partner.name
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
