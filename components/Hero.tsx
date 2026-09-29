import styles from './Hero.module.css'

interface HeroProps {
  headline?: string
  subline?: string
}

export default function Hero({ headline, subline }: HeroProps) {
  return (
    <section className={styles.hero}>
      <h1 className={styles.brand}>SRF Collective</h1>
      {headline && <p className={styles.tagline}>{headline}</p>}
      {subline && <p className={styles.subline}>{subline}</p>}
    </section>
  )
}
