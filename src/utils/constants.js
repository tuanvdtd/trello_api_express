/**
 * Danh sách các domain được phép truy cập API
 */

import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'http://localhost:5173'
  // React app running on localhost
]

export const BOARD_TYPE = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEV)
