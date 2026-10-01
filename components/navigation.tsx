import Link from "next/link"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo, LogoMark } from "@/components/logo"
import { business } from "@/lib/business"

const navLinks = [
  { href: "#pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#service-area", label: "Service Area" },
  { href: "#faq", label: "FAQ" },
]

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 md:h-18">
        <Link href="/" className="flex items-center rounded-md" aria-label="No Junk Left Behind home">
          <LogoMark className="size-10 sm:hidden" />
          <Logo variant="horizontal" size="sm" className="hidden sm:inline-flex" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={business.phoneHref}
            className="flex h-12 items-center gap-1.5 rounded-md px-2 text-[15px] font-bold tabular-nums text-foreground transition-colors hover:text-primary sm:px-3 sm:text-base"
          >
            <Phone className="size-4 text-primary" aria-hidden="true" />
            <span>
              <span className="sr-only">Call </span>
              {business.phoneDisplay}
            </span>
          </a>
          <Button asChild className="h-11 px-3.5 font-bold sm:h-12 sm:px-5">
            <a href="#estimate">Get My Quote</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
