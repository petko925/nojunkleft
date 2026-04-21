"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Facebook, Share2, Loader2, X } from "lucide-react"

const ORANGE = "#F97316"
const BLACK = "#0A0A0A"

export function BrandAssetsContent() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<{ dataUrl: string; filename: string } | null>(null)

  const downloadAsPNG = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) return

    setLoadingId(elementId)

    try {
      const html2canvasModule = await import("html2canvas")
      const html2canvas = html2canvasModule.default
      
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      })

      const dataUrl = canvas.toDataURL("image/png")
      
      // Try Web Share API first (works best on mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob()
          const file = new File([blob], filename, { type: "image/png" })
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "No Junk Left Behind",
            })
            return
          }
        } catch {
          // Share was cancelled or failed, fall through to other methods
        }
      }
      
      // Fallback: Show preview modal for mobile to long-press save
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      if (isMobile) {
        setPreviewImage({ dataUrl, filename })
      } else {
        // Desktop: direct download
        const link = document.createElement("a")
        link.download = filename
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">No Junk Left Behind - Brand Assets</h1>
          <p className="text-muted-foreground">
            Download optimized logos for Facebook profile and banner
          </p>
        </div>

        {/* Facebook Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Facebook Profile Picture
            </CardTitle>
            <CardDescription>
              180x180 pixels - Optimized for circular crop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div
                id="fb-profile"
                className="w-[180px] h-[180px] flex items-center justify-center"
                style={{ backgroundColor: BLACK }}
              >
                <div className="text-center p-4">
                  <div className="mb-2">
                    <svg className="w-12 h-12 mx-auto" viewBox="0 0 64 40" fill="none" stroke="#F97316" strokeWidth="2.5">
                      <rect x="2" y="8" width="40" height="24" rx="2" />
                      <path d="M42 16 L54 16 L60 24 L60 32 L42 32 Z" />
                      <circle cx="14" cy="34" r="4" />
                      <circle cx="50" cy="34" r="4" />
                      <line x1="18" y1="32" x2="46" y2="32" />
                      <path d="M6 4 L6 8" />
                      <path d="M10 2 L10 8" />
                      <path d="M14 4 L14 8" />
                    </svg>
                  </div>
                  <div className="font-black italic text-white text-xl leading-tight">
                    NO JUNK
                  </div>
                  <div className="font-black italic text-xl leading-tight" style={{ color: ORANGE }}>
                    LEFT BEHIND
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-muted">
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: BLACK }}
                >
                  <div className="text-center p-2 scale-[0.67]">
                    <div className="mb-1">
                      <svg className="w-12 h-12 mx-auto" viewBox="0 0 64 40" fill="none" stroke="#F97316" strokeWidth="2.5">
                        <rect x="2" y="8" width="40" height="24" rx="2" />
                        <path d="M42 16 L54 16 L60 24 L60 32 L42 32 Z" />
                        <circle cx="14" cy="34" r="4" />
                        <circle cx="50" cy="34" r="4" />
                        <line x1="18" y1="32" x2="46" y2="32" />
                        <path d="M6 4 L6 8" />
                        <path d="M10 2 L10 8" />
                        <path d="M14 4 L14 8" />
                      </svg>
                    </div>
                    <div className="font-black italic text-white text-xl leading-tight">
                      NO JUNK
                    </div>
                    <div className="font-black italic text-xl leading-tight" style={{ color: ORANGE }}>
                      LEFT BEHIND
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">Preview with circular crop</p>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => downloadAsPNG("fb-profile", "nojunk-fb-profile.png")}
                disabled={loadingId === "fb-profile"}
                className="min-w-[160px]"
              >
                {loadingId === "fb-profile" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {loadingId === "fb-profile" ? "Generating..." : "Download PNG"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Facebook Banner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Facebook Banner / Cover Photo
            </CardTitle>
            <CardDescription>
              820x312 pixels - Desktop optimized with icons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center overflow-x-auto">
              <div
                id="fb-banner"
                className="w-[820px] h-[312px] flex items-center justify-between px-12"
                style={{ 
                  background: `linear-gradient(135deg, ${BLACK} 0%, #1a1a1a 50%, ${ORANGE} 100%)`,
                }}
              >
                {/* Left side - Icons */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="2">
                      <rect x="4" y="24" width="20" height="16" rx="1" />
                      <rect x="24" y="28" width="16" height="12" rx="1" />
                      <rect x="8" y="8" width="16" height="16" rx="1" />
                      <rect x="40" y="20" width="20" height="20" rx="1" />
                    </svg>
                    <span className="text-white text-sm font-medium">Junk Removal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-10 h-10" viewBox="0 0 64 48" fill="none" stroke="#F97316" strokeWidth="2">
                      <path d="M8 16 C8 8, 16 4, 32 4 C48 4, 56 8, 56 16 L56 28 L8 28 Z" />
                      <rect x="4" y="20" width="8" height="20" rx="2" />
                      <rect x="52" y="20" width="8" height="20" rx="2" />
                      <rect x="12" y="28" width="40" height="12" rx="2" />
                    </svg>
                    <span className="text-white text-sm font-medium">Furniture Pickup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-10 h-10" viewBox="0 0 64 48" fill="none" stroke="white" strokeWidth="2">
                      <rect x="4" y="4" width="56" height="32" rx="2" />
                      <rect x="8" y="8" width="48" height="24" rx="1" />
                      <line x1="32" y1="36" x2="32" y2="44" />
                      <line x1="20" y1="44" x2="44" y2="44" />
                    </svg>
                    <span className="text-white text-sm font-medium">E-Waste Disposal</span>
                  </div>
                </div>

                {/* Center - Logo */}
                <div className="text-center">
                  <div className="mb-3">
                    <svg className="w-16 h-16 mx-auto" viewBox="0 0 64 40" fill="none" stroke="#F97316" strokeWidth="2.5">
                      <rect x="2" y="8" width="40" height="24" rx="2" />
                      <path d="M42 16 L54 16 L60 24 L60 32 L42 32 Z" />
                      <circle cx="14" cy="34" r="4" />
                      <circle cx="50" cy="34" r="4" />
                      <line x1="18" y1="32" x2="46" y2="32" />
                      <path d="M6 4 L6 8" />
                      <path d="M10 2 L10 8" />
                      <path d="M14 4 L14 8" />
                    </svg>
                  </div>
                  <div className="font-black italic text-white text-4xl leading-tight">
                    NO JUNK
                  </div>
                  <div className="font-black italic text-4xl leading-tight" style={{ color: ORANGE }}>
                    LEFT BEHIND
                  </div>
                  <div className="mt-2 text-white/80 text-sm tracking-wide">
                    NOTHING LEFT BEHIND. EVER.
                  </div>
                </div>

                {/* Right side - CTA */}
                <div className="text-right">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                    <div className="text-white font-bold text-lg">Same-Day Service</div>
                    <div className="text-white/80 text-sm">Instant AI Estimates</div>
                    <div className="mt-2 text-xs font-medium" style={{ color: ORANGE }}>
                      NoJunkLeft.com
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                      707-298-4268
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => downloadAsPNG("fb-banner", "nojunk-fb-banner.png")}
                disabled={loadingId === "fb-banner"}
                className="min-w-[160px]"
              >
                {loadingId === "fb-banner" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {loadingId === "fb-banner" ? "Generating..." : "Download PNG"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Square Post */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Square Post (1080x1080)
            </CardTitle>
            <CardDescription>
              Perfect for Instagram and Facebook feed posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center overflow-x-auto">
              <div
                id="fb-square"
                className="w-[540px] h-[540px] flex flex-col"
                style={{ backgroundColor: BLACK }}
              >
                {/* Top section with icons */}
                <div className="flex-1 flex items-center justify-center gap-8 px-8">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="2">
                      <rect x="4" y="24" width="20" height="16" rx="1" />
                      <rect x="24" y="28" width="16" height="12" rx="1" />
                      <rect x="8" y="8" width="16" height="16" rx="1" />
                      <rect x="40" y="20" width="20" height="20" rx="1" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto" viewBox="0 0 64 48" fill="none" stroke="#F97316" strokeWidth="2">
                      <path d="M8 16 C8 8, 16 4, 32 4 C48 4, 56 8, 56 16 L56 28 L8 28 Z" />
                      <rect x="4" y="20" width="8" height="20" rx="2" />
                      <rect x="52" y="20" width="8" height="20" rx="2" />
                      <rect x="12" y="28" width="40" height="12" rx="2" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto" viewBox="0 0 64 48" fill="none" stroke="white" strokeWidth="2">
                      <rect x="4" y="4" width="56" height="32" rx="2" />
                      <rect x="8" y="8" width="48" height="24" rx="1" />
                      <line x1="32" y1="36" x2="32" y2="44" />
                      <line x1="20" y1="44" x2="44" y2="44" />
                    </svg>
                  </div>
                </div>

                {/* Bottom orange section */}
                <div className="h-[220px] px-8 py-6 flex flex-col justify-center" style={{ backgroundColor: ORANGE }}>
                  <div className="text-white text-3xl font-bold leading-tight mb-2">
                    We haul the clutter.
                  </div>
                  <div className="text-white text-3xl font-bold leading-tight mb-6">
                    You get your space back.
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-10 h-10" viewBox="0 0 64 40" fill="none" stroke="white" strokeWidth="2.5">
                      <rect x="2" y="8" width="40" height="24" rx="2" />
                      <path d="M42 16 L54 16 L60 24 L60 32 L42 32 Z" />
                      <circle cx="14" cy="34" r="4" />
                      <circle cx="50" cy="34" r="4" />
                    </svg>
                    <div>
                      <div className="font-black italic text-white text-xl leading-tight">
                        NO JUNK
                      </div>
                      <div className="font-black italic text-xl leading-tight" style={{ color: BLACK }}>
                        LEFT BEHIND
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-white/90 text-sm">
                    Instant AI Estimates. Same-Day Service.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => downloadAsPNG("fb-square", "nojunk-square-post.png")}
                disabled={loadingId === "fb-square"}
                className="min-w-[160px]"
              >
                {loadingId === "fb-square" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {loadingId === "fb-square" ? "Generating..." : "Download PNG"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-orange-500 text-white text-center p-4 rounded-t-lg font-medium">
              Long-press the image below and tap &quot;Save Image&quot;
            </div>
            <div className="bg-neutral-900 p-4 rounded-b-lg">
              <img 
                src={previewImage.dataUrl} 
                alt={previewImage.filename}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <Button 
              onClick={() => setPreviewImage(null)}
              className="w-full mt-4"
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
