/* eslint-disable no-useless-catch */
// dev
import { Resend } from 'resend'
import { env } from '~/config/environment'

const resendInstance = new Resend(env.RESEND_API_KEY)

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resendInstance.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to, // email nguoi nhan phải đc xác thực trên Resend
      subject,
      html
    })
    return data
  } catch (error) {
    // console.log(error)
    throw error
  }
}

export const ResendProvider = {
  sendEmail
}
