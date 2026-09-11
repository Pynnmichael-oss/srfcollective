import styles from './Hero.module.css'

interface HeroProps {
  headline?: string
  subline?: string
}

export default function Hero({ headline, subline }: HeroProps) {
  // Nothing to show without siteSettings (or an unset required field) —
  // fail gracefully rather than render an empty hero band.
  if (!headline) {
    return null
  }

  return (
    <section className={styles.hero}>
      <h1 className={styles.headline}>{headline}</h1>
      {subline && <p className={styles.subline}>{subline}</p>}
    </section>
  )
}
