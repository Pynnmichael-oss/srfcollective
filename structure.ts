import { CogIcon, ThListIcon, UserIcon } from '@sanity/icons'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'

// Document types that are singletons — locked to a fixed document ID and
// never shown in a generic "create new" list anywhere in the Studio.
export const SINGLETON_TYPES = new Set(['siteSettings', 'aboutSettings', 'servicesPage'])

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('SRF Collective')
    .items([
      orderableDocumentListDeskItem({ type: 'project', title: 'Projects', S, context }),
      S.divider(),
      S.listItem()
        .title('Homepage & Site Settings')
        .icon(CogIcon)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Homepage & Site Settings'),
        ),
      S.listItem()
        .title('About Page')
        .icon(UserIcon)
        .child(
          S.document().schemaType('aboutSettings').documentId('aboutSettings').title('About Page'),
        ),
      S.listItem()
        .title('Services Page')
        .icon(ThListIcon)
        .child(
          S.document()
            .schemaType('servicesPage')
            .documentId('servicesPage')
            .title('Services Page'),
        ),
      orderableDocumentListDeskItem({ type: 'service', title: 'Services', S, context }),
      S.divider(),
      orderableDocumentListDeskItem({ type: 'pressLogo', title: 'Press', S, context }),
      orderableDocumentListDeskItem({ type: 'partner', title: 'Partners', S, context }),
    ])
