import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Centralized sender email - using verified domain nojunkleft.com
export const FROM_EMAIL = 'No Junk Left Behind <hello@nojunkleft.com>'

// Business email for receiving notifications
export const BUSINESS_EMAIL = 'nojunkleftca@gmail.com'
