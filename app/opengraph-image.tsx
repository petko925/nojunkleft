import { ImageResponse } from 'next/og'

export const alt = 'No Junk Left Behind - Professional Junk Removal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const NAVY = '#1a1f35'
const ORANGE = '#FF7F00'
const AMBER = '#FFB84D'
const MUTED = '#c7cbd6'

const TRUCK_SVG = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="truck" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7F00"/><stop offset="100%" stop-color="#FF5500"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFB84D"/><stop offset="100%" stop-color="#FF7F00"/>
    </linearGradient>
    <linearGradient id="arrow" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FF5500"/><stop offset="100%" stop-color="#FFD700"/>
    </linearGradient>
  </defs>
  <circle cx="40" cy="48" r="36" stroke="url(#accent)" stroke-width="0.8" opacity="0.3"/>
  <rect x="12" y="36" width="38" height="22" rx="4" fill="url(#truck)"/>
  <rect x="12" y="36" width="38" height="5" rx="4" fill="white" opacity="0.15"/>
  <path d="M50 38C50 36.9 50.9 36 52 36H66C68.2 36 70 37.8 70 40V54C70 55.1 69.1 56 68 56H50V38Z" fill="url(#truck)"/>
  <rect x="56" y="40" width="10" height="8" rx="1.5" stroke="white" stroke-width="1" opacity="0.4"/>
  <rect x="56" y="40" width="10" height="3" rx="1" fill="white" opacity="0.2"/>
  <circle cx="68" cy="50" r="2.5" fill="white" opacity="0.5"/>
  <circle cx="68" cy="45" r="2" fill="white" opacity="0.4"/>
  <rect x="48" y="42" width="3" height="12" fill="url(#accent)" opacity="0.8"/>
  <circle cx="22" cy="60" r="8" stroke="url(#truck)" stroke-width="2.5"/>
  <circle cx="22" cy="60" r="5.5" fill="url(#accent)" opacity="0.6"/>
  <circle cx="22" cy="60" r="3" fill="#1a1a1a" opacity="0.7"/>
  <circle cx="58" cy="60" r="8" stroke="url(#truck)" stroke-width="2.5"/>
  <circle cx="58" cy="60" r="5.5" fill="url(#accent)" opacity="0.6"/>
  <circle cx="58" cy="60" r="3" fill="#1a1a1a" opacity="0.7"/>
  <line x1="40" y1="28" x2="40" y2="8" stroke="url(#arrow)" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="40,2 34,12 46,12" fill="url(#arrow)" stroke="#FF5500" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="12" y="36" width="38" height="22" rx="4" stroke="url(#accent)" stroke-width="0.8" opacity="0.4"/>
</svg>`

const TRUCK_SRC = `data:image/svg+xml;base64,${Buffer.from(TRUCK_SVG).toString('base64')}`

const HEADLINE = 'No Junk'
const SUBHEAD = 'LEFT BEHIND'
const TAGLINE = 'Fast, reliable junk removal. Same-day service available.'

async function loadSpaceGrotesk(weight: number, text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}&text=${encodeURIComponent(text)}`,
    ).then((res) => res.text())
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return await fetch(url).then((res) => res.arrayBuffer())
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const [bold, medium] = await Promise.all([
    loadSpaceGrotesk(700, HEADLINE + SUBHEAD),
    loadSpaceGrotesk(500, TAGLINE + 'nojunkleft.com'),
  ])

  const fonts = [
    ...(bold ? [{ name: 'Space Grotesk', data: bold, weight: 700 as const, style: 'normal' as const }] : []),
    ...(medium ? [{ name: 'Space Grotesk', data: medium, weight: 500 as const, style: 'normal' as const }] : []),
  ]

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
          backgroundColor: NAVY,
          fontFamily: 'Space Grotesk',
          borderBottom: `14px solid ${ORANGE}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TRUCK_SRC} width={240} height={240} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 150, fontWeight: 700, color: ORANGE, lineHeight: 1, letterSpacing: -4 }}>
              {HEADLINE}
            </div>
            <div style={{ fontSize: 50, fontWeight: 700, color: AMBER, letterSpacing: 12, marginTop: 12 }}>
              {SUBHEAD}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 500, color: MUTED, marginTop: 56 }}>
          {TAGLINE}
        </div>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 500, color: ORANGE, marginTop: 18 }}>
          nojunkleft.com
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
