import { MessageSquare, Phone, Camera } from "lucide-react"
import { business } from "@/lib/business"

export function MobileActionBar() {
  return (
    <nav
      aria-label="Quick contact"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-border bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-3">
        <li>
          <a
            href={business.phoneHref}
            className="flex h-16 flex-col items-center justify-center gap-1 bg-primary text-sm font-bold text-primary-foreground"
          >
            <Phone className="size-5" aria-hidden="true" />
            Call Now
          </a>
        </li>
        <li>
          <a
            href={business.smsHref}
            className="flex h-16 flex-col items-center justify-center gap-1 text-sm font-semibold text-ink-foreground"
          >
            <MessageSquare className="size-5" aria-hidden="true" />
            Text Us
          </a>
        </li>
        <li>
          <a
            href="#estimate"
            className="flex h-16 flex-col items-center justify-center gap-1 border-l border-ink-border text-sm font-semibold text-ink-foreground"
          >
            <Camera className="size-5" aria-hidden="true" />
            Photo Quote
          </a>
        </li>
      </ul>
    </nav>
  )
}
