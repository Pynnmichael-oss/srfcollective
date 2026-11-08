import type { SchemaTypeDefinition } from 'sanity'

import aboutSettings from './aboutSettings'
import partner from './partner'
import photoItem from './objects/photoItem'
import pressLogo from './pressLogo'
import project from './project'
import service from './service'
import servicesPage from './servicesPage'
import siteSettings from './siteSettings'
import videoItem from './objects/videoItem'

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  aboutSettings,
  servicesPage,
  project,
  photoItem,
  videoItem,
  pressLogo,
  partner,
  service,
]
