import type { Metadata, Viewport } from 'next'
import { Inter, Archivo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './site.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const title = 'Junk Removal in Contra Costa County | No Junk Left Behind'
const description =
  'Fixed-price junk removal in Concord, Walnut Creek, Antioch and all of Contra Costa County. Loads from $199, single items from $99, dump trailer rental $99/day. Call or text 707-298-4268.'

export const metadata: Metadata = {
  title,
  description,
  generator: 'v0.app',
  metadataBase: new URL('https://www.nojunkleft.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: 'https://www.nojunkleft.com',
    siteName: 'No Junk Left Behind',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  formatDetection: { telephone: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbfaf8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} ${archivo.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
