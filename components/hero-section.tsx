"use client"

import { ArrowRight, Camera, Sparkles, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 72
  window.scrollTo({ top, behavior: "smooth" })
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary via-background to-background" />
      
      {/* Animated lines */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0" />
              <stop offset="50%" className="[stop-color:var(--primary)]" stopOpacity="1" />
              <stop offset="100%" className="[stop-color:var(--accent)]" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M-100 300 Q 200 200 500 350 T 1100 300 T 1700 350"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            className="animate-pulse"
          />
          <path
            d="M-100 400 Q 300 350 600 450 T 1200 400 T 1800 450"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Estimates</span>
          </div>

          {/* Logo Large */}
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            <span className="text-foreground">Your Junk.</span>{" "}
            <span className="text-primary">Gone Fast.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 text-pretty">
            Professional junk removal made simple. Snap a photo, get an instant AI estimate, 
            and schedule your pickup in minutes. We handle everything from furniture to construction debris.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="h-14 px-8 text-lg gap-2" onClick={() => scrollTo("estimate")}>
              <Camera className="h-5 w-5" />
              Get AI Estimate
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg gap-2" onClick={() => scrollTo("schedule")}>
              <Truck className="h-5 w-5" />
              Schedule Pickup
            </Button>
          </div>

          {/* Tagline */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground text-lg md:text-xl font-medium text-balance">
              Fast, reliable junk removal for the Bay Area. Same-day service available.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
