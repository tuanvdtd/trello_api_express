import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  PORT: process.env.APP_PORT,
  HOSTNAME: process.env.APP_HOST,
  AUTHOR: process.env.AUTHOR,
  BUILD_MODE: process.env.BUILD_MODE,
  WEBSITE_DOMAIN_DEV: process.env.WEBSITE_DOMAIN_DEV,
  WEBSITE_DOMAIN_PRODUCTION: process.env.WEBSITE_DOMAIN_PRODUCTION,
  RESEND_API_KEY: process.env.RESEND_API_KEY
}