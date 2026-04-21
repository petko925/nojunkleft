"use client"

import { useState } from "react"
import { Menu, X, Camera, Calendar, Truck, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import Link from "next/link"

const navItems = [
  { id: "estimate", label: "AI Estimate", icon: Camera },
  { id: "schedule", label: "Schedule Pickup", icon: Calendar },
  { id: "availability", label: "Trailer Availability", icon: Truck },
  { id: "contact", label: "Contact", icon: Phone },
]

// Scroll to a section by ID, offsetting for the fixed 64px header
function scrollToSection(id: string, onDone?: () => void) {
  const el = document.getElementById(id)
  if (!el) return
  const offset = 72 // fixed header height + small buffer
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: "smooth" })
  onDone?.()
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
          <Button onClick={() => scrollToSection("estimate")}>
            Get Free Quote
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-16 bg-background border-b border-border transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id, () => setIsOpen(false))}
                className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-secondary transition-colors w-full text-left"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
          <Button
            className="mt-2 w-full h-12"
            onClick={() => scrollToSection("estimate", () => setIsOpen(false))}
          >
            Get Free Quote
          </Button>
        </div>
      </div>
    </header>
  )
}
