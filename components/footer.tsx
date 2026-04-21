"use client"

import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

export function Footer() {
  return (
    <footer id="contact" className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="mb-4" />
            <p className="text-muted-foreground text-sm mb-4">
              Professional junk removal services. Fast, reliable, and eco-friendly. 
              We handle everything so you don&apos;t have to.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#estimate" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI Estimate
                </Link>
              </li>
              <li>
                <Link href="#schedule" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Schedule Pickup
                </Link>
              </li>
              <li>
                <Link href="#availability" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Trailer Availability
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Residential Junk Removal</li>
              <li>Commercial Cleanouts</li>
              <li>Construction Debris</li>
              <li>Estate Cleanouts</li>
              <li>Appliance Removal</li>
              <li>Furniture Disposal</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:707-298-4268" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">707-298-4268</div>
                    <div className="text-xs">Call or Text</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="tel:925-395-3002" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">925-395-3002</div>
                    <div className="text-xs">Call or Text</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:nojunkleftca@gmail.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">nojunkleftca@gmail.com</div>
                    <div className="text-xs">Email Us</div>
                  </div>
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Mon-Sat: 7AM - 7PM</div>
                  <div className="text-xs text-muted-foreground">Sunday: 9AM - 5PM</div>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Serving the Metro Area</div>
                  <div className="text-xs text-muted-foreground">50 mile radius</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} No Junk Left Behind. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors text-xs opacity-50 hover:opacity-100">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
