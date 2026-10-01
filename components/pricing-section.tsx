import { Check, Phone, Sofa } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadGauge } from "@/components/load-gauge"
import { cn } from "@/lib/utils"
import { business, loadingAddOnPrice, loadTiers, singleItemPrice, trailerOptions } from "@/lib/business"

function CallButton({ label, className }: { label: string; className?: string }) {
  return (
    <Button asChild className={cn("h-12 w-full text-base font-bold", className)}>
      <a href={business.phoneHref} aria-label={`Call ${business.phoneDisplay} to book: ${label}`}>
        <Phone className="size-4" aria-hidden="true" />
        Call to Book
      </a>
    </Button>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 md:py-20">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Pricing</p>
          <h2 id="pricing-title" className="text-balance text-3xl font-black uppercase md:text-4xl">
            Pay by how much trailer you fill
          </h2>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
            We load for you. Pick the size that looks closest &mdash; the orange shows how full the trailer gets.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">We load for you</h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loadTiers.map((tier) => (
              <li
                key={tier.id}
                className={cn(
                  "relative flex flex-col gap-4 rounded-xl border bg-card p-5",
                  tier.popular ? "border-primary ring-2 ring-primary" : "border-border",
                )}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-4 lg:flex-col lg:items-stretch">
                  <LoadGauge fraction={tier.fraction} className="w-28 shrink-0 lg:w-full" />
                  <div className="flex flex-col">
                    <h4 className="font-display text-lg font-extrabold uppercase">{tier.name}</h4>
                    <p className="font-display text-4xl font-black tabular-nums">${tier.price}</p>
                  </div>
                </div>
                <p className="flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">{tier.fits}</p>
                <CallButton label={`${tier.name}, $${tier.price}`} className={tier.popular ? undefined : "bg-ink text-ink-foreground hover:bg-ink/90"} />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Sofa className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-1 flex-col">
              <h4 className="font-display text-lg font-extrabold uppercase">
                Single bulky item &mdash; from ${singleItemPrice}
              </h4>
              <p className="text-sm text-muted-foreground">One couch, mattress, fridge, hot tub cover, or treadmill.</p>
            </div>
            <CallButton label={`single bulky item from $${singleItemPrice}`} className="bg-ink text-ink-foreground hover:bg-ink/90 sm:w-auto sm:px-6" />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-ink p-5 text-ink-foreground md:p-8">
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-2xl font-black uppercase">Trailer Rental</h3>
            <p className="text-ink-muted">Doing it yourself or need a few days to fill it? Rent our dump trailer.</p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {trailerOptions.map((option) => (
              <li key={option.id} className="flex flex-col gap-4 rounded-xl border border-ink-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <h4 className="font-display text-lg font-extrabold uppercase">{option.name}</h4>
                    <p className="text-sm font-semibold text-primary">{option.tagline}</p>
                  </div>
                  <p className="font-display text-4xl font-black tabular-nums">
                    ${option.price}
                    {option.unit && <span className="text-base font-bold text-ink-muted">{option.unit}</span>}
                  </p>
                </div>
                <ul className="flex flex-1 flex-col gap-2">
                  {option.details.map((detail) => (
                    <li key={detail} className="flex gap-2 text-sm text-ink-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <CallButton label={`${option.name}, $${option.price}${option.unit}`} />
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted">
            Want us to do the loading? Add a crew for <strong className="text-ink-foreground">+${loadingAddOnPrice}/job</strong>.
          </p>
        </div>
      </div>
    </section>
  )
}
