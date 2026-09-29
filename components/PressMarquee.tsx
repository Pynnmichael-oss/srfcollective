import { urlFor } from '@/lib/sanity/image'
import type { PressLogo } from '@/lib/sanity/types'

import styles from './PressMarquee.module.css'

interface PressMarqueeProps {
  pressLogos: PressLogo[]
}

export default function PressMarquee({ pressLogos }: PressMarqueeProps) {
  // No press logos yet — the whole section collapses, not just its content.
  if (!pressLogos.length) {
    return null
  }

  return (
    <section className={styles.band} aria-label="As seen in">
      <p className={styles.label}>As seen in</p>
      <ul className={styles.list}>
        {pressLogos.map((logo, index) => (
          <li key={logo._id} className={styles.item}>
            {logo.logo?.asset?._ref ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlFor(logo.logo).height(40).fit('max').auto('format').url()}
                alt={logo.name}
                className={styles.logoImg}
              />
            ) : (
              logo.name
            )}
            {/* The dot belongs to the preceding name — kept inside the same
                <li> so the two never separate across a wrapped line. */}
            {index < pressLogos.length - 1 && (
              <span className={styles.dot} aria-hidden="true">
                &bull;
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
