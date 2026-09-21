// Shared by the contact form (client) and the /api/contact route (server) so
// the checkbox list and the server's allow-list can't drift apart. Kept out
// of route.ts because Next only permits HTTP-method exports from route files.
export const PROJECT_TYPES = [
  'Social Media Management',
  'Brand Management',
  'Content Creation',
  'Creative Direction',
  'Event / Brand Storytelling',
  'Wedding / Event iPhone Content',
  'One-Off Project Help',
  'Don’t Know What I Want Yet',
] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]

// Name of the hidden honeypot input. Real users never fill it in.
export const HONEYPOT_FIELD = 'website'
