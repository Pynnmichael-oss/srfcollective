import Link from 'next/link'

import { NAV_LINKS } from '@/lib/nav-links'

import styles from './Nav.module.css'

export default function Nav() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.wordmark}>
          SRF Collective
        </Link>
        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                <span className={styles.linkText}>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
