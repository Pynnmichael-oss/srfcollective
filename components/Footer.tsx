import Link from 'next/link'

import { NAV_LINKS } from '@/lib/nav-links'
import type { SiteSettings } from '@/lib/sanity/types'

import styles from './Footer.module.css'

interface FooterProps {
  siteSettings?: SiteSettings | null
}

export default function Footer({ siteSettings }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <span className={styles.wordmark}>SRF Collective</span>
        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {(siteSettings?.footerLocation || siteSettings?.instagramUrl) && (
        <div className={styles.meta}>
          {siteSettings?.footerLocation && <span>{siteSettings.footerLocation}</span>}
          {siteSettings?.instagramUrl && (
            <a
              href={siteSettings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Instagram
            </a>
          )}
        </div>
      )}
    </footer>
  )
}
