import type { SchemaTypeDefinition } from 'sanity'

import aboutSettings from './aboutSettings'
import partner from './partner'
import pressLogo from './pressLogo'
import project from './project'
import service from './service'
import servicesPage from './servicesPage'
import siteSettings from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  aboutSettings,
  servicesPage,
  project,
  pressLogo,
  partner,
  service,
]
