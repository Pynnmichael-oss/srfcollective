// Single source of truth for site navigation links.
// Nav (and later, Footer) both import this — don't duplicate it.
//
// Only the homepage exists right now, so these hrefs 404 until
// /about, /services, /contact are built in later tasks. Expected.
export const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
] as const
