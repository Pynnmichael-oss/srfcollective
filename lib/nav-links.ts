// Single source of truth for site navigation links.
// Nav (and later, Footer) both import this — don't duplicate it.
//
// No "Work" entry — there's no dedicated work page and none is planned;
// the project grid lives on the homepage itself.
export const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
] as const
