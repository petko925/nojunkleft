import { ImageResponse } from "next/og"
import { BRAND_INK, renderMarkShapes } from "@/components/logo"

const ICON_SIZES = [48, 96, 192, 512] as const

export const contentType = "image/png"

export function generateImageMetadata() {
  return ICON_SIZES.map((px) => ({
    id: String(px),
    size: { width: px, height: px },
    contentType,
  }))
}

export function renderBrandIcon(px: number) {
  return new ImageResponse(
    (
      <svg width={px} height={px} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill={BRAND_INK} />
        {renderMarkShapes()}
      </svg>
    ),
    { width: px, height: px },
  )
}

export default async function Icon({ id }: { id: Promise<string> | string }) {
  const px = Number(await id) || 48
  return renderBrandIcon(px)
}
