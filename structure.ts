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
      // "Homepage" rather than "Homepage & Site Settings": the homepage
      // highlights are what she actually comes here to change, and "site
      // settings" reads like something technical she might break.
      S.listItem()
        .title('Homepage')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Homepage')),
      S.listItem()
        .title('About Page')
        .icon(UserIcon)
        .child(
          S.document().schemaType('aboutSettings').documentId('aboutSettings').title('About Page'),
        ),
      S.listItem()
        .title('Services')
        .icon(ThListIcon)
        .child(
          S.list()
            .title('Services')
            .items([
              S.listItem()
                .title('Page copy')
                .icon(ThListIcon)
                .child(
                  S.document()
                    .schemaType('servicesPage')
                    .documentId('servicesPage')
                    .title('Page copy'),
                ),
              orderableDocumentListDeskItem({ type: 'service', title: 'Service list', S, context }),
            ]),
        ),
      S.divider(),
      orderableDocumentListDeskItem({ type: 'pressLogo', title: 'Press', S, context }),
      orderableDocumentListDeskItem({ type: 'partner', title: 'Partners', S, context }),
    ])
