'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NAV_LINKS } from '@/lib/nav-links'

import styles from './Nav.module.css'

export default function Nav() {
  // Client component solely so aria-current can reflect the actual route —
  // usePathname works fine under static generation (each page renders with
  // its own path), so this doesn't change any page's rendering strategy.
  const pathname = usePathname()

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/" className={styles.wordmark}>
          SRF Collective
        </Link>
        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.link}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                <span className={styles.linkText}>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
