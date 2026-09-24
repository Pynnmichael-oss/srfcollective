// Single source of truth for site navigation links.
// Nav (and later, Footer) both import this — don't duplicate it.
export const NAV_LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
] as const
