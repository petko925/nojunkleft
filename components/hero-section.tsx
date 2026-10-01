import Image from "next/image"
import { BadgeDollarSign, Camera, Clock, Phone, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { business, loadTiers, singleItemPrice } from "@/lib/business"

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 md:pb-16 md:pt-14 md:grid-cols-[1.1fr_1fr] md:items-center lg:gap-12">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Fixed-price junk hauling · {business.region}, {business.state}
          </p>
          <h1
            id="hero-title"
            className="text-balance text-4xl font-black uppercase leading-[0.95] sm:text-5xl lg:text-6xl"
          >
            Junk Removal in Contra Costa County
          </h1>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-ink-muted">
            Tell us what&apos;s going, get a fixed price, and we haul it all away &mdash; often the same day.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-6 text-base font-bold">
              <a href={business.phoneHref}>
                <Phone className="size-5" aria-hidden="true" />
                Call {business.phoneDisplay}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 border-ink-foreground/30 bg-transparent px-6 text-base font-bold text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <a href="#estimate">
                <Camera className="size-5" aria-hidden="true" />
                Get a Photo Estimate
              </a>
            </Button>
          </div>

          <p className="text-base text-ink-muted">
            Loads from <strong className="font-bold text-ink-foreground">${loadTiers[0].price}</strong> · Single items
            from <strong className="font-bold text-ink-foreground">${singleItemPrice}</strong> ·{" "}
            <a href="#pricing" className="font-semibold text-primary underline underline-offset-4">
              See all prices
            </a>
          </p>

          <ul
            aria-label="Why customers trust us"
            className="flex flex-col gap-3 border-t border-ink-border pt-6 sm:flex-row sm:flex-wrap sm:gap-x-6"
          >
            <li className="flex items-center gap-2 text-sm font-semibold">
              <BadgeDollarSign className="size-5 text-primary" aria-hidden="true" />
              Fixed Upfront Prices
            </li>
            <li className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              Licensed &amp; Insured
            </li>
            <li className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="size-5 text-primary" aria-hidden="true" />
              Same-Day Service Available
            </li>
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-ink-border">
          <Image
            src="/images/hero-crew.webp"
            alt="No Junk Left Behind crew loading an old sofa into a dump trailer in a Contra Costa driveway"
            width={1200}
            height={900}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/3] h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
