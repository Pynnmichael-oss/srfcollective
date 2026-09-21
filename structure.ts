import { CogIcon, UserIcon } from '@sanity/icons'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'

// Document types that are singletons — locked to a fixed document ID and
// never shown in a generic "create new" list anywhere in the Studio.
export const SINGLETON_TYPES = new Set(['siteSettings', 'aboutSettings'])

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('SRF Collective')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings'),
        ),
      S.listItem()
        .title('About Page')
        .icon(UserIcon)
        .child(
          S.document().schemaType('aboutSettings').documentId('aboutSettings').title('About Page'),
        ),
      S.divider(),
      orderableDocumentListDeskItem({ type: 'project', title: 'Projects', S, context }),
      orderableDocumentListDeskItem({ type: 'pressLogo', title: 'Press Logos', S, context }),
      orderableDocumentListDeskItem({ type: 'partner', title: 'Partners', S, context }),
    ])
