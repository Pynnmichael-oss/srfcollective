import Link from 'next/link'

import styles from './ClosingCta.module.css'

interface ClosingCtaProps {
  ctaHeading?: string
  contactEmail?: string
}

export default function ClosingCta({ ctaHeading, contactEmail }: ClosingCtaProps) {
  // Heading and email are independent data sources — hide the whole
  // section only when neither has anything to show. The button always
  // renders once the section does, regardless of which of the two is set.
  if (!ctaHeading && !contactEmail) {
    return null
  }

  return (
    <section className={styles.section}>
      {ctaHeading && <h2 className={styles.heading}>{ctaHeading}</h2>}
      {contactEmail && (
        <a href={`mailto:${contactEmail}`} className={styles.email}>
          <span className={styles.emailText}>{contactEmail}</span>
        </a>
      )}
      <Link href="/contact" className={styles.button}>
        Inquire
      </Link>
    </section>
  )
}
