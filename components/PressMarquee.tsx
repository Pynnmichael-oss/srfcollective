import { Fragment } from 'react'

import { urlFor } from '@/lib/sanity/image'
import type { PressLogo } from '@/lib/sanity/types'

import styles from './PressMarquee.module.css'

interface PressMarqueeProps {
  pressLogos: PressLogo[]
}

export default function PressMarquee({ pressLogos }: PressMarqueeProps) {
  // No press logos yet — the whole band collapses, not just its content.
  if (!pressLogos.length) {
    return null
  }

  // Duplicated once for a seamless CSS loop (see PressMarquee.module.css).
  // The whole track is aria-hidden — it's a decorative, duplicated visual
  // effect, and the section's own aria-label already gives screen reader
  // users the one meaningful description ("As seen in ...").
  const items = [...pressLogos, ...pressLogos]

  return (
    <section className={styles.band} aria-label="As seen in">
      <div className={styles.track} aria-hidden="true">
        {items.map((logo, index) => {
          const isDuplicate = index >= pressLogos.length
          const isLast = index === items.length - 1
          // A separator dot sits between this item and the next, so it
          // belongs to the "duplicate" (hidden under reduced motion) set
          // whenever either neighbor does — including the seam between
          // the last real item and the first duplicate, which would
          // otherwise leave a dangling trailing dot once duplicates are
          // hidden.
          const dotIsDuplicate = isDuplicate || index + 1 >= pressLogos.length

          return (
            <Fragment key={`${logo._id}-${index}`}>
              <span className={isDuplicate ? `${styles.item} ${styles.duplicate}` : styles.item}>
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
              </span>
              {!isLast && (
                <span className={dotIsDuplicate ? `${styles.dot} ${styles.duplicate}` : styles.dot}>
                  &bull;
                </span>
              )}
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}
