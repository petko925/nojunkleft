import { Phone } from "lucide-react"
import { PriceCard, type PriceItem } from "@/components/pricing/price-card"
import { HowItWorks } from "@/components/pricing/how-it-works"
import { PricingFaq } from "@/components/pricing/pricing-faq"
import { PHONE_DISPLAY, PHONE_HREF } from "@/components/pricing/contact-buttons"

const weLoad: PriceItem[] = [
  { name: "1/4 Load", price: "$199", detail: "A few big items or a small pile.", fill: 0.25 },
  { name: "1/2 Load", price: "$349", detail: "One room or a small garage.", fill: 0.5, popular: true },
  { name: "3/4 Load", price: "$499", detail: "Multiple rooms or a full garage.", fill: 0.75 },
  { name: "Full Load", price: "$649", detail: "Whole-house or big project cleanouts.", fill: 1 },
  { name: "Single Bulky Item", price: "$99", prefix: "from", detail: "One couch, fridge, or curbside pickup." },
]

const trailers: PriceItem[] = [
  {
    name: "Dump Trailer Rental",
    price: "$99",
    unit: "per day",
    detail: "Large dump trailer. You tow it, load it, and dump it.",
  },
  {
    name: "Trailer Drop-Off",
    price: "$449",
    detail: "We deliver it, you load it for up to 3 days, we haul it away. Dump fees included up to 2 tons.",
  },
  {
    name: "Loading Add-On",
    price: "+$75",
    unit: "per job",
    detail: "Don't want to lift? Our crew loads the trailer for you.",
  },
]

function PriceGroup({ title, note, items }: { title: string; note: string; items: PriceItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{note}</p>
      </div>
      <div className="grid gap-5 pt-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <PriceCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-20" aria-labelledby="pricing-heading">
      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4">
        <header className="flex flex-col gap-3">
          <h2 id="pricing-heading" className="text-3xl font-bold md:text-4xl text-balance">
            Flat prices. No guessing.
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
            Pay by how much of the trailer you fill. Serving Contra Costa County.
          </p>
          <a
            href={`tel:${PHONE_HREF}`}
            className="inline-flex min-h-11 w-fit items-center gap-2 text-lg font-semibold text-primary underline-offset-4 hover:underline"
          >
            <Phone className="size-5" aria-hidden="true" />
            Call or text {PHONE_DISPLAY}
          </a>
        </header>

        <HowItWorks />

        <PriceGroup title="We Load For You" note="Our crew does all the lifting." items={weLoad} />
        <PriceGroup title="Trailer Rental" note="Do it yourself and save." items={trailers} />

        <PricingFaq />
      </div>
    </section>
  )
}
