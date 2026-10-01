import { ImageResponse } from "next/og"
import { BRAND_INK, renderMarkShapes } from "@/components/logo"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill={BRAND_INK} />
        {renderMarkShapes()}
      </svg>
    ),
    size,
  )
}
