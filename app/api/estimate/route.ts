import { generateText } from "ai"
import twilio from "twilio"
import { createClient } from "@supabase/supabase-js"
import { resend, FROM_EMAIL, BUSINESS_EMAIL } from "@/lib/resend"

// Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

/**
 * Junk Removal Quote Estimator API
 * Accepts image + contact info, returns AI-powered estimate
 * Sends emails and SMS notifications
 * 
 * POST /api/estimate
 * Body: { image: string (base64), address: string, phone: string, email: string, notes?: string }
 */

// ============================================================
// PRICING CONFIGURATION - Easy to edit
// ============================================================
const PRICING: Record<string, { min: number; max: number }> = {
  small: { min: 99, max: 199 },
  medium: { min: 199, max: 399 },
  large: { min: 399, max: 599 },
  xl: { min: 599, max: 899 },
}

const VALID_SIZES = ["small", "medium", "large", "xl"] as const
type LoadSize = (typeof VALID_SIZES)[number]
type Confidence = "low" | "medium" | "high"

const sizeLabels: Record<LoadSize, string> = {
  small: "Small (1-3 cubic yards)",
  medium: "Medium (4-8 cubic yards)",
  large: "Large (9-14 cubic yards)",
  xl: "Extra Large (15-20 cubic yards)",
}

interface EstimateSuccess {
  success: true
  estimatedSize: LoadSize
  quoteMin: number
  quoteMax: number
  confidence: Confidence
  explanation: string
}

interface EstimateError {
  success: false
  error: string
}

// ============================================================
// FALLBACK ESTIMATE - Used when AI is unavailable
// ============================================================
const FALLBACK_ESTIMATE: EstimateSuccess = {
  success: true,
  estimatedSize: "medium",
  quoteMin: PRICING.medium.min,
  quoteMax: PRICING.medium.max,
  confidence: "low",
  explanation: "Estimate generated using default pricing. Our team will provide a precise quote after reviewing your submission.",
}

// Business phone numbers for SMS
const BUSINESS_PHONES = ["7072984268", "9253953002"] // Remove non-digits for Twilio

export async function POST(req: Request): Promise<Response> {
  console.log("[estimate] POST request received")

  try {
    // Parse request body
    let body: { image?: string; fullName?: string; address?: string; phone?: string; email?: string; notes?: string }
    try {
      body = await req.json()
    } catch {
      console.error("[estimate] Invalid JSON body")
      return Response.json(
        { success: false, error: "Invalid request body" } satisfies EstimateError,
        { status: 400 }
      )
    }

    const { image, fullName, address, phone, email, notes } = body

    // Validate required fields
    if (!image) {
      console.error("[estimate] Missing image")
      return Response.json(
        { success: false, error: "Image is required" } satisfies EstimateError,
        { status: 400 }
      )
    }

    if (!address) {
      console.error("[estimate] Missing address")
      return Response.json(
        { success: false, error: "Address is required" } satisfies EstimateError,
        { status: 400 }
      )
    }

    if (!phone) {
      console.error("[estimate] Missing phone")
      return Response.json(
        { success: false, error: "Phone number is required" } satisfies EstimateError,
        { status: 400 }
      )
    }

    if (!email) {
      console.error("[estimate] Missing email")
      return Response.json(
        { success: false, error: "Email address is required" } satisfies EstimateError,
        { status: 400 }
      )
    }

    // Validate image format (must be base64 data URL)
    if (!image.startsWith("data:image/")) {
      console.error("[estimate] Invalid image format")
      return Response.json(
        { success: false, error: "Invalid image format. Must be a base64 data URL." } satisfies EstimateError,
        { status: 400 }
      )
    }

    // Extract base64 data and media type
    const base64Match = image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!base64Match) {
      console.error("[estimate] Could not parse image data URL")
      return Response.json(
        { success: false, error: "Could not parse image data" } satisfies EstimateError,
        { status: 400 }
      )
    }

    const mimeType = base64Match[1]
    const base64Data = base64Match[2]

    console.log("[estimate] Image received:", {
      mimeType,
      base64Length: base64Data.length,
      address: address.substring(0, 30) + "...",
      phone: phone.substring(0, 6) + "...",
      hasNotes: !!notes,
    })

    // ============================================================
    // AI ANALYSIS
    // ============================================================
    let result: EstimateSuccess

    try {
      console.log("[estimate] Starting AI analysis...")

      const { text } = await generateText({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional junk removal estimator for "No Junk Left Behind" (nojunkleft.com).
Analyze the image and estimate the load size.

IMPORTANT: Respond with ONLY a valid JSON object, no markdown or explanation.

Load size guidelines:
- small: Few items, fits in pickup truck (1-3 cubic yards) - bags, small furniture, minor cleanout
- medium: Room cleanout, appliances, mattresses (4-8 cubic yards) - quarter trailer
- large: Garage cleanout, estate items, multiple rooms (9-14 cubic yards) - half to 3/4 trailer
- xl: Full house cleanout, construction debris, major renovation (15-20 cubic yards) - full trailer

JSON format:
{
  "size": "small" | "medium" | "large" | "xl",
  "confidence": "low" | "medium" | "high",
  "explanation": "Brief description of items seen and reasoning"
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this junk removal image. Customer notes: ${notes || "None provided"}. Return ONLY the JSON object.`,
              },
              {
                type: "image",
                image: base64Data,
                mimeType: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              },
            ],
          },
        ],
      })

      console.log("[estimate] AI raw response:", text.substring(0, 200))

      // Parse AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("[estimate] Could not extract JSON from AI response")
        result = FALLBACK_ESTIMATE
      } else {
        const parsed = JSON.parse(jsonMatch[0])

        // Validate and normalize size
        const size: LoadSize = VALID_SIZES.includes(parsed.size?.toLowerCase())
          ? (parsed.size.toLowerCase() as LoadSize)
          : "medium"

        // Validate confidence
        const validConfidence = ["low", "medium", "high"]
        const confidence: Confidence = validConfidence.includes(parsed.confidence?.toLowerCase())
          ? (parsed.confidence.toLowerCase() as Confidence)
          : "medium"

        // Build response
        result = {
          success: true,
          estimatedSize: size,
          quoteMin: PRICING[size].min,
          quoteMax: PRICING[size].max,
          confidence,
          explanation: parsed.explanation || `Estimated ${size} load based on image analysis.`,
        }
      }
    } catch (aiError) {
      console.error("[estimate] AI analysis failed:", aiError)
      result = FALLBACK_ESTIMATE
    }

    console.log("[estimate] Success:", result)

    // ============================================================
    // SAVE TO DATABASE
    // ============================================================
    let leadId: string | null = null
    try {
      // Parse address components (basic parsing - address, city, state)
      const addressParts = address.split(",").map((p: string) => p.trim())
      const addressLine1 = addressParts[0] || address
      const city = addressParts[1] || null
      const stateZip = addressParts[2] || ""
      const [state, ...zipParts] = stateZip.split(" ").filter(Boolean)
      const zipCode = zipParts.join(" ") || null

      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          full_name: fullName || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          phone,
          email,
          address_line_1: addressLine1,
          city,
          state: state || null,
          zip_code: zipCode,
        })
        .select()
        .single()

      if (customerError) {
        console.error("[estimate] Customer creation failed:", customerError)
      } else {
        // Create lead
        const { data: lead, error: leadError } = await supabase
          .from("leads")
          .insert({
            customer_id: customer.id,
            load_size: sizeLabels[result.estimatedSize],
            notes: notes || null,
            status: "new_lead",
            ai_estimate_min: result.quoteMin,
            ai_estimate_max: result.quoteMax,
            ai_explanation: result.explanation,
          })
          .select()
          .single()

        if (leadError) {
          console.error("[estimate] Lead creation failed:", leadError)
        } else {
          leadId = lead.id
          console.log("[estimate] Lead created:", lead.id)

          // Upload photo to Supabase Storage
          try {
            const buffer = Buffer.from(base64Data, "base64")
            const fileName = `${lead.id}/${Date.now()}.jpg`

            const { error: uploadError } = await supabase.storage
              .from("lead-photos")
              .upload(fileName, buffer, {
                contentType: mimeType,
                upsert: false,
              })

            if (uploadError) {
              console.error("[estimate] Photo upload failed:", uploadError)
            } else {
              // Save photo reference
              await supabase.from("lead_photos").insert({
                lead_id: lead.id,
                file_path: fileName,
                file_name: "customer-photo.jpg",
                file_size: buffer.length,
              })
              console.log("[estimate] Photo uploaded:", fileName)
            }
          } catch (photoError) {
            console.error("[estimate] Photo handling error:", photoError)
          }
        }
      }
    } catch (dbError) {
      console.error("[estimate] Database error:", dbError)
      // Don't fail the request if database save fails
    }

    // ============================================================
    // SEND NOTIFICATION EMAILS via Resend
    // ============================================================
    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "full",
      timeStyle: "short",
    })

    try {
      await resend.batch.send([
        // Business notification email
        {
          from: FROM_EMAIL,
          to: BUSINESS_EMAIL,
          subject: `New Quote Request - ${sizeLabels[result.estimatedSize]} - $${result.quoteMin}–$${result.quoteMax}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f1628;color:#ffffff;border-radius:12px;overflow:hidden;">
              <div style="background:#e07b23;padding:24px 32px;">
                <h1 style="margin:0;font-size:22px;color:#ffffff;">New Quote Request</h1>
                <p style="margin:4px 0 0;color:#fff3e0;font-size:14px;">No Junk Left Behind — nojunkleft.com</p>
              </div>
              <div style="padding:32px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;color:#a0aec0;font-size:13px;width:130px;">Submitted</td>
                    <td style="padding:8px 0;font-weight:600;">${submittedAt}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#a0aec0;font-size:13px;">Customer Email</td>
                    <td style="padding:8px 0;font-weight:600;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#a0aec0;font-size:13px;">Phone</td>
                    <td style="padding:8px 0;font-weight:600;"><a href="tel:${phone}" style="color:#e07b23;">${phone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#a0aec0;font-size:13px;">Address</td>
                    <td style="padding:8px 0;font-weight:600;">${address}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#a0aec0;font-size:13px;">Notes</td>
                    <td style="padding:8px 0;">${notes || "None"}</td>
                  </tr>
                </table>

                <div style="margin:24px 0;background:#1a2240;border-radius:10px;padding:20px;border-left:4px solid #e07b23;">
                  <p style="margin:0 0 4px;color:#a0aec0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">AI Estimate</p>
                  <p style="margin:0;font-size:24px;font-weight:700;color:#e07b23;">$${result.quoteMin} – $${result.quoteMax}</p>
                  <p style="margin:4px 0 0;color:#cbd5e0;">${sizeLabels[result.estimatedSize]} &bull; Confidence: ${result.confidence}</p>
                  <p style="margin:12px 0 0;color:#a0aec0;font-size:13px;">${result.explanation}</p>
                </div>

                <div style="margin:24px 0;">
                  <p style="margin:0 0 8px;color:#a0aec0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Customer Photo</p>
                  <div style="border-radius:10px;overflow:hidden;border:2px solid #2d3a5a;">
                    <img src="${image}" alt="Customer junk photo" style="width:100%;height:auto;display:block;max-width:500px;" />
                  </div>
                </div>

                <a href="tel:${phone}" style="display:inline-block;background:#e07b23;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">Call Customer Now</a>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "customer-junk-photo.jpg",
              content: Buffer.from(base64Data, "base64"),
              content_type: mimeType,
            },
          ],
        },
        // Customer confirmation email with attached image
        {
          from: FROM_EMAIL,
          to: email,
          subject: "Your Junk Removal Estimate from No Junk Left Behind",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f1628;color:#ffffff;border-radius:12px;overflow:hidden;">
              <div style="background:#e07b23;padding:24px 32px;">
                <h1 style="margin:0;font-size:22px;color:#ffffff;">Your Instant Quote</h1>
                <p style="margin:4px 0 0;color:#fff3e0;font-size:14px;">No Junk Left Behind — nojunkleft.com</p>
              </div>
              <div style="padding:32px;">
                <p style="color:#cbd5e0;">Thanks for reaching out! Here's your estimate based on your photo.</p>

                <!-- Customer's uploaded photo -->
                <div style="margin:20px 0;border-radius:10px;overflow:hidden;border:2px solid #2d3a5a;">
                  <img src="${image}" alt="Your junk removal photo" style="width:100%;height:auto;display:block;max-width:500px;" />
                </div>

                <div style="margin:24px 0;background:#1a2240;border-radius:10px;padding:24px;text-align:center;border:1px solid #2d3a5a;">
                  <p style="margin:0 0 4px;color:#a0aec0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Estimated Quote</p>
                  <p style="margin:0;font-size:36px;font-weight:700;color:#e07b23;">$${result.quoteMin} – $${result.quoteMax}</p>
                  <p style="margin:8px 0 0;color:#cbd5e0;">${sizeLabels[result.estimatedSize]}</p>
                </div>

                <div style="background:#1a2240;border-radius:10px;padding:16px;margin:16px 0;border-left:4px solid #e07b23;">
                  <p style="margin:0;color:#a0aec0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">AI Analysis</p>
                  <p style="margin:8px 0 0;color:#cbd5e0;font-size:14px;">${result.explanation}</p>
                </div>

                <p style="color:#a0aec0;font-size:13px;border-top:1px solid #2d3a5a;padding-top:16px;margin-top:24px;">
                  Our team will follow up shortly to confirm your pickup. Questions? Call or text us anytime.<br/>
                  <strong style="color:#e07b23;">nojunkleft.com • 707-298-4268 • 925-395-3002</strong>
                </p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "your-junk-photo.jpg",
              content: Buffer.from(base64Data, "base64"),
              content_type: mimeType,
            },
          ],
        },
      ])
      console.log("[estimate] Emails sent successfully")
    } catch (emailError) {
      console.error("[estimate] Email send failed:", emailError)
    }

    // ============================================================
    // SEND SMS VIA TWILIO
    // ============================================================
    if (process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
        const normalizedPhone = phone.replace(/\D/g, "")
        const customerPhoneE164 = `+1${normalizedPhone.slice(-10)}`

        // SMS to customer with their estimate
        const customerMessage = `Hi! Your No Junk Left Behind estimate is ready: $${result.quoteMin}-$${result.quoteMax} (${sizeLabels[result.estimatedSize]}). Our team will call you shortly. Reply STOP to opt out.`

        await twilioClient.messages.create({
          body: customerMessage,
          from: twilioPhoneNumber,
          to: customerPhoneE164,
        })
        console.log("[estimate] Customer SMS sent to:", customerPhoneE164)

        // SMS to business phone numbers with customer info
        const businessMessage = `New Junk Removal Lead:\n${address}\nEst: $${result.quoteMin}-$${result.quoteMax} (${sizeLabels[result.estimatedSize]})\nPhone: ${phone}\nEmail: ${email}\n${notes ? `Notes: ${notes}` : ""}`

        for (const businessPhone of BUSINESS_PHONES) {
          const businessPhoneE164 = `+1${businessPhone.slice(-10)}`
          await twilioClient.messages.create({
            body: businessMessage,
            from: twilioPhoneNumber,
            to: businessPhoneE164,
          })
          console.log("[estimate] Business SMS sent to:", businessPhoneE164)
        }
      } catch (smsError) {
        console.error("[estimate] SMS send failed:", smsError)
        // Don't fail the request if SMS fails
      }
    }

    return Response.json(result)

  } catch (error) {
    console.error("[estimate] Unexpected error:", error)
    return Response.json(
      { 
        success: false, 
        error: "An unexpected error occurred. Please try again." 
      } satisfies EstimateError,
      { status: 500 }
    )
  }
}
