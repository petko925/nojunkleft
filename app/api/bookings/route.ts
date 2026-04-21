import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { resend, FROM_EMAIL, BUSINESS_EMAIL } from "@/lib/resend"

// Use service role client to bypass RLS for public form submissions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const {
      trailer_id,
      date,
      time_slot,
      customer_name,
      customer_email,
      customer_phone,
      address,
      notes,
    } = await req.json()

    // Validate required fields
    if (
      !trailer_id ||
      !date ||
      !time_slot ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !address
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Parse address into components
    const addressParts = address.split(",").map((p: string) => p.trim())
    const addressLine1 = addressParts[0] || address
    const city = addressParts[1] || null
    const stateZip = addressParts[2] || ""
    const [state, ...zipParts] = stateZip.split(" ").filter(Boolean)
    const zipCode = zipParts.join(" ") || null

    // First, create or find the customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        full_name: customer_name,
        phone: customer_phone,
        email: customer_email,
        address_line_1: addressLine1,
        city,
        state: state || null,
        zip_code: zipCode,
      })
      .select()
      .single()

    if (customerError) {
      console.error("[bookings POST] Customer creation error:", customerError)
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    // Create a lead for tracking
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .insert({
        customer_id: customer.id,
        notes: notes || null,
        status: "booked",
      })
      .select()
      .single()

    if (leadError) {
      console.error("[bookings POST] Lead creation error:", leadError)
      // Continue anyway - booking is more important
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        customer_id: customer.id,
        lead_id: lead?.id || null,
        scheduled_date: date,
        time_window: time_slot,
        crew_notes: notes || null,
        status: "scheduled",
      })
      .select()
      .single()

    if (bookingError) {
      console.error("[bookings POST] Booking creation error:", bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    // Send confirmation emails
    let emailSent = false
    try {
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      await resend.batch.send([
        {
          from: FROM_EMAIL,
          to: [customer_email],
          subject: 'Booking Confirmed - No Junk Left Behind',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #e07830;">Booking Confirmed!</h1>
              <p>Hi ${customer_name},</p>
              <p>Your junk removal pickup has been scheduled.</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${time_slot}</p>
                <p><strong>Address:</strong> ${address}</p>
              </div>
              <p>We'll call you 30 minutes before arrival. Questions? Call us anytime.</p>
              <p style="color: #e07830; font-weight: bold;">No Junk Left Behind<br>707-298-4268 | 925-395-3002</p>
            </div>
          `,
        },
        {
          from: FROM_EMAIL,
          to: [BUSINESS_EMAIL],
          subject: `New Booking - ${customer_name} - ${formattedDate}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #e07830;">New Booking</h1>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                <p><strong>Customer:</strong> ${customer_name}</p>
                <p><strong>Phone:</strong> <a href="tel:${customer_phone}">${customer_phone}</a></p>
                <p><strong>Email:</strong> ${customer_email}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${time_slot}</p>
                <p><strong>Address:</strong> ${address}</p>
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              </div>
            </div>
          `,
        },
      ])
      emailSent = true
    } catch (emailError: unknown) {
      const err = emailError as { message?: string; statusCode?: number; name?: string }
      console.error("[bookings POST] Email error:", {
        message: err?.message,
        statusCode: err?.statusCode,
        name: err?.name,
        fromEmail: FROM_EMAIL,
        toCustomer: customer_email,
        toBusiness: BUSINESS_EMAIL,
      })
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ 
      booking: {
        ...booking,
        customer,
      },
      emailSent,
    }, { status: 201 })
  } catch (error) {
    console.error("[bookings POST] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET bookings (for dashboard or other needs)
export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        customers (
          full_name,
          phone,
          email,
          address_line_1,
          city,
          state
        )
      `)
      .order("scheduled_date", { ascending: false })

    if (error) {
      console.error("[bookings GET] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookings: data })
  } catch (error) {
    console.error("[bookings GET] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
