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
  // send email
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  ADMIN_EMAIL_ADDRESS: process.env.ADMIN_EMAIL_ADDRESS,
  ADMIN_EMAIL_NAME: process.env.ADMIN_EMAIL_NAME,

  // JWT
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE,
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

// Log để debug
// console.log('Environment Config:', {
//   BUILD_MODE: env.BUILD_MODE,
//   ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET ? 'Set' : 'Not Set',
//   REFRESH_TOKEN_SECRET: env.REFRESH_TOKEN_SECRET ? 'Set' : 'Not Set'
// })