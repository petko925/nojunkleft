import Link from "next/link"
import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react"
import { Logo } from "@/components/logo"
import { business } from "@/lib/business"

const quickLinks = [
  { href: "#pricing", label: "Pricing" },
  { href: "#estimate", label: "Photo Estimate" },
  { href: "#schedule", label: "Schedule a Pickup" },
  { href: "#service-area", label: "Service Area" },
  { href: "#faq", label: "FAQ" },
]

export function Footer() {
  return (
    <footer className="bg-ink pb-24 text-ink-foreground md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo variant="horizontal" size="md" />
          <p className="text-pretty text-sm leading-relaxed text-ink-muted">
            Fixed-price junk removal and dump trailer rental in {business.region}, California.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Contact</h2>
          <address className="flex flex-col gap-1 not-italic">
            <a href={business.phoneHref} className="flex min-h-12 items-center gap-3 text-lg font-bold tabular-nums hover:text-primary">
              <Phone className="size-5 text-primary" aria-hidden="true" />
              {business.phoneDisplay}
            </a>
            <a href={business.smsHref} className="flex min-h-12 items-center gap-3 hover:text-primary">
              <MessageSquare className="size-5 text-primary" aria-hidden="true" />
              Text us
            </a>
            <a href={`mailto:${business.email}`} className="flex min-h-12 items-center gap-3 break-all hover:text-primary">
              <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
              {business.email}
            </a>
          </address>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Hours</h2>
          <dl className="flex flex-col gap-2">
            {business.hours.map((row) => (
              <div key={row.days} className="flex items-center gap-3">
                <Clock className="size-5 text-primary" aria-hidden="true" />
                <dt className="w-20 font-semibold">{row.days}</dt>
                <dd className="text-ink-muted">{row.time}</dd>
              </div>
            ))}
          </dl>
          <p className="flex items-start gap-3 pt-2 text-sm text-ink-muted">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            Serving all of {business.region}: Concord, Walnut Creek, Antioch, Pittsburg, Brentwood, San Ramon, Richmond
            and more.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Quick links</h2>
          <ul className="flex flex-col">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="flex min-h-10 items-center text-ink-muted hover:text-ink-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-ink-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {business.name}. Licensed &amp; insured.
          </p>
          <Link href="/brand-assets" className="hover:text-ink-foreground">
            Brand assets
          </Link>
        </div>
      </div>
    </footer>
  )
}
