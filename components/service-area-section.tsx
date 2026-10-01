import { MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { business, serviceCities } from "@/lib/business"

export function ServiceAreaSection() {
  return (
    <section id="service-area" aria-labelledby="area-title" className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Service area</p>
          <h2 id="area-title" className="text-balance text-3xl font-black uppercase md:text-4xl">
            Junk removal across Contra Costa County
          </h2>
          <p className="text-pretty leading-relaxed text-ink-muted">
            We&apos;re local. Our crew hauls junk, furniture, appliances, yard debris, and cleanouts from homes and
            businesses throughout Contra Costa County &mdash; from Richmond and El Cerrito out to Brentwood and Discovery
            Bay, and from Martinez down to San Ramon.
          </p>
          <Button asChild size="lg" className="h-12 w-full font-bold sm:w-auto">
            <a href={business.phoneHref}>
              <Phone className="size-4" aria-hidden="true" />
              Not listed? Call {business.phoneDisplay}
            </a>
          </Button>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 self-center sm:grid-cols-3" aria-label="Cities we serve">
          {serviceCities.map((city) => (
            <li key={city} className="flex items-center gap-2 border-b border-ink-border py-3">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="font-semibold">
                {city}
                <span className="sr-only"> junk removal</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
