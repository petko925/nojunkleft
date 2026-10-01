import { ImageResponse } from 'next/og'
import { BRAND_INK, BRAND_ORANGE, renderMarkShapes } from '@/components/logo'

export const alt = 'No Junk Left Behind - Junk Removal in Contra Costa County'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PAPER = '#fbfaf8'
const MUTED = '#a8a8ad'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_INK,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <svg width="220" height="220" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill={BRAND_INK} />
            {renderMarkShapes(BRAND_INK, BRAND_ORANGE)}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <div style={{ fontSize: 120, fontWeight: 900, color: PAPER, letterSpacing: -3, textTransform: 'uppercase' }}>
              No Junk
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 44,
                fontWeight: 800,
                color: BRAND_ORANGE,
                letterSpacing: 10,
                textTransform: 'uppercase',
              }}
            >
              Left Behind
            </div>
          </div>
        </div>
        <div style={{ marginTop: 56, fontSize: 32, color: MUTED }}>
          Junk removal in Contra Costa County · nojunkleft.com
        </div>
      </div>
    ),
    size,
  )
}
