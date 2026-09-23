import Link from 'next/link'

import { urlFor } from '@/lib/sanity/image'
import type { Service, ServicesPage, SanityImage, SanityImageWithAsset } from '@/lib/sanity/types'

import styles from './Services.module.css'

// urlFor()'s declared parameter type (SanityImage, a bare asset _ref) is
// narrower than what @sanity/image-url's builder.image() actually accepts
// at runtime — a dereferenced asset object like hoverImage is one of its
// documented input shapes (SanityImageObject). This local cast only
// widens the type urlFor() is told to expect; it changes no behavior.
function hoverImageUrl(image: SanityImageWithAsset) {
  return urlFor(image as unknown as SanityImage)
}

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
    hoverImage: item.hoverImage?.asset ? item.hoverImage : undefined,
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
                {/* Slot always renders (even without an image) so every
                    row's grid keeps the same 4-column track — only the
                    <img> itself is conditional, so there's never a broken
                    or empty image element. */}
                <span className={styles.imageSlot}>
                  {item.hoverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      // Hotspot-aware crop: passing both width() and height()
                      // to @sanity/image-url auto-crops to the hotspot rect
                      // (see Activations.module.css for the same mechanism
                      // used deliberately here, unlike the bare-image
                      // convention used for gallery tiles). 240x300 and
                      // 480x600 mirror --service-image-w/--service-image-h
                      // exactly — JS numeric literals can't reference CSS
                      // custom properties, so keep these two in sync by hand.
                      src={hoverImageUrl(item.hoverImage).width(240).height(300).fit('crop').auto('format').url()}
                      srcSet={[
                        `${hoverImageUrl(item.hoverImage).width(240).height(300).fit('crop').auto('format').url()} 240w`,
                        `${hoverImageUrl(item.hoverImage).width(480).height(600).fit('crop').auto('format').url()} 480w`,
                      ].join(', ')}
                      sizes="240px"
                      loading="lazy"
                      alt=""
                      aria-hidden="true"
                      className={styles.image}
                    />
                  )}
                </span>
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
