import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'No Junk Left Behind | Professional Junk Removal',
  description: 'Fast, reliable junk and garbage removal service. Get instant AI-powered estimates and schedule pickups with ease.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.nojunkleft.com'),
  openGraph: {
    title: 'No Junk Left Behind | Professional Junk Removal',
    description: 'Fast, reliable junk and garbage removal service. Get instant AI-powered estimates and schedule pickups with ease.',
    url: 'https://www.nojunkleft.com',
    siteName: 'No Junk Left Behind',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'No Junk Left Behind - Professional Junk Removal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'No Junk Left Behind | Professional Junk Removal',
    description: 'Fast, reliable junk and garbage removal service. Get instant AI-powered estimates and schedule pickups with ease.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1f35',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
