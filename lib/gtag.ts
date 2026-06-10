// Google Ads conversion tracking helper
// Fires conversion events via window.gtag (loaded by the global site tag in layout.tsx)

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void
    dataLayer?: unknown[]
  }
}

export const GA_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID

// Fire a Google Ads conversion event
export function fireConversion(conversionLabel: string, value?: number, currency = "USD") {
  if (typeof window === "undefined" || !window.gtag || !GA_ADS_ID) return
  window.gtag("event", "conversion", {
    send_to: `${GA_ADS_ID}/${conversionLabel}`,
    value,
    currency,
  })
}

// Predefined conversion events — use these labels from your Google Ads conversion actions
export const Conversions = {
  // Fired when a customer submits the estimate form
  estimateSubmitted: () =>
    fireConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_ESTIMATE_LABEL ?? "estimate_submitted"),

  // Fired when a booking is confirmed
  bookingConfirmed: (value?: number) =>
    fireConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL ?? "booking_confirmed", value),
}
