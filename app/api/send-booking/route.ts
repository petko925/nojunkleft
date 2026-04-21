import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM_EMAIL, BUSINESS_EMAIL } from '@/lib/resend'

interface BookingData {
  name: string
  email: string
  phone: string
  address: string
  notes?: string
  date: string
  time: string
  service?: string
  trailer?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('[send-booking] RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }
    
    const body: BookingData = await request.json()
    const { name, email, phone, address, notes, date, time, service, trailer } = body

    // Validate required fields
    if (!name || !email || !phone || !address || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone, address, date, and time are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    // Use environment variable or fallback to centralized constant
    const businessEmail = process.env.BUSINESS_EMAIL || BUSINESS_EMAIL

    // Customer confirmation email HTML
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #1a1f35; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #232942; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e07830 0%, #f5a623 100%); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: #1a1f35; font-size: 28px; font-weight: bold;">No Junk Left Behind</h1>
            <p style="margin: 8px 0 0; color: #1a1f35; opacity: 0.8;">Professional Junk Removal</p>
          </div>
          <div style="padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 64px; height: 64px; background-color: rgba(76, 175, 80, 0.2); border-radius: 50%; margin: 0 auto 16px; line-height: 64px;">
                <span style="font-size: 32px;">&#10003;</span>
              </div>
              <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 24px;">Thank You, ${name}!</h2>
              <p style="color: #9ca3af; margin: 0;">We received your junk removal request</p>
            </div>
            <div style="background-color: #1a1f35; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 16px; line-height: 1.6;">
                A member of our team will review your request and get back to you shortly to confirm your appointment and provide a final quote.
              </p>
            </div>
            <div style="background-color: #1a1f35; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #e07830; margin: 0 0 16px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Your Request Summary</h3>
              ${trailer ? `
              <div style="border-bottom: 1px solid #2d3555; padding-bottom: 12px; margin-bottom: 12px;">
                <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">TRAILER</p>
                <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">${trailer}</p>
              </div>
              ` : ''}
              <div style="border-bottom: 1px solid #2d3555; padding-bottom: 12px; margin-bottom: 12px;">
                <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">PREFERRED DATE</p>
                <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">${date}</p>
              </div>
              <div style="border-bottom: 1px solid #2d3555; padding-bottom: 12px; margin-bottom: 12px;">
                <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">PREFERRED TIME</p>
                <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">${time}</p>
              </div>
              <div style="border-bottom: 1px solid #2d3555; padding-bottom: 12px; margin-bottom: 12px;">
                <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">PICKUP ADDRESS</p>
                <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">${address}</p>
              </div>
              ${service ? `
              <div style="border-bottom: 1px solid #2d3555; padding-bottom: 12px; margin-bottom: 12px;">
                <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">SERVICE REQUESTED</p>
                <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">${service}</p>
              </div>
              ` : ''}
              ${notes ? `
              <div>
                <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">YOUR MESSAGE</p>
                <p style="color: #ffffff; margin: 0; font-size: 16px;">${notes}</p>
              </div>
              ` : ''}
            </div>
            <div style="background-color: #1a1f35; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #e07830; margin: 0 0 16px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">What Happens Next</h3>
              <ul style="color: #ffffff; margin: 0; padding-left: 20px; line-height: 2;">
                <li>We will call or text you to confirm the appointment</li>
                <li>We will provide a final price quote</li>
                <li>On pickup day, we will call 30 minutes before arrival</li>
                <li>Just point to the junk and we handle the rest!</li>
              </ul>
            </div>
            <div style="text-align: center; padding: 24px; background-color: #1a1f35; border-radius: 12px;">
              <p style="color: #9ca3af; margin: 0 0 8px;">Questions? Reach us anytime:</p>
              <p style="color: #e07830; margin: 0 0 4px; font-size: 18px; font-weight: bold;">
                <a href="mailto:hello@nojunkleft.com" style="color: #e07830; text-decoration: none;">hello@nojunkleft.com</a>
              </p>
            </div>
          </div>
          <div style="padding: 24px; text-align: center; border-top: 1px solid #2d3555;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              &copy; ${new Date().getFullYear()} No Junk Left Behind. All rights reserved.
            </p>
            <p style="color: #6b7280; margin: 8px 0 0; font-size: 12px;">nojunkleft.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Business notification email HTML
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #e07830; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">New Booking Request</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Submitted: ${submittedAt}</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 24px; font-size: 20px; border-bottom: 2px solid #e07830; padding-bottom: 12px;">Customer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 140px; font-weight: 500;">Customer Name:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Phone:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">
                  <a href="tel:${phone.replace(/\D/g, '')}" style="color: #e07830; text-decoration: none; font-size: 16px;">${phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Email:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">
                  <a href="mailto:${email}" style="color: #e07830; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Pickup Address:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${address}</td>
              </tr>
            </table>
            <h2 style="color: #1f2937; margin: 32px 0 24px; font-size: 20px; border-bottom: 2px solid #e07830; padding-bottom: 12px;">Booking Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${trailer ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 140px; font-weight: 500;">Trailer:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${trailer}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 140px; font-weight: 500;">Preferred Date:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Preferred Time:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${time}</td>
              </tr>
              ${service ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Service Requested:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 600;">${service}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 500;">Submitted At:</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${submittedAt}</td>
              </tr>
            </table>
            ${notes ? `
            <div style="margin-top: 24px;">
              <h3 style="color: #1f2937; margin: 0 0 12px; font-size: 16px;">Message / Notes:</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; border-left: 4px solid #e07830;">
                <p style="margin: 0; color: #374151; line-height: 1.6;">${notes}</p>
              </div>
            </div>
            ` : ''}
            <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Action Required:</strong> Contact customer to confirm appointment and provide quote.
              </p>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="tel:${phone.replace(/\D/g, '')}" style="display: inline-block; background-color: #e07830; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Call Customer Now
              </a>
            </div>
          </div>
          <div style="padding: 16px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              This is an automated notification from nojunkleft.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    console.log('[send-booking] Sending emails to:', { customer: email, business: businessEmail })
    
    // Send both emails using batch for reliability
    const { data, error } = await resend.batch.send([
      {
        from: FROM_EMAIL,
        to: [email],
        subject: 'We Received Your Request - No Junk Left Behind',
        html: customerEmailHtml,
      },
      {
        from: FROM_EMAIL,
        to: [businessEmail],
        subject: `New Booking Request - ${name} - ${date}`,
        html: businessEmailHtml,
      },
    ])

    if (error) {
      console.error('[send-booking] Batch email error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to send emails', details: error },
        { status: 500 }
      )
    }

    console.log('[send-booking] Emails sent successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Booking request received. Confirmation emails sent.',
      emailIds: data
    })
    
  } catch (error) {
    console.error('[send-booking] Unexpected error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
