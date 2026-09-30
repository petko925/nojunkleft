import { cn } from "@/lib/utils"
import { ContactButtons } from "./contact-buttons"

export type PriceItem = {
  name: string
  price: string
  prefix?: string
  unit?: string
  detail: string
  fill?: number
  popular?: boolean
}

function LoadGauge({ fill }: { fill: number }) {
  return (
    <div
      className="flex h-3 w-full gap-1"
      role="img"
      aria-label={`${fill * 100}% of a trailer load`}
    >
      {[0.25, 0.5, 0.75, 1].map((step) => (
        <span
          key={step}
          className={cn("flex-1 rounded-sm", step <= fill ? "bg-primary" : "bg-muted")}
        />
      ))}
    </div>
  )
}

export function PriceCard({ item }: { item: PriceItem }) {
  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border bg-card p-5",
        item.popular ? "border-primary ring-2 ring-primary/25" : "border-border",
      )}
    >
      {item.popular && (
        <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
          Most popular
        </span>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="text-lg font-semibold leading-tight">{item.name}</h4>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{item.detail}</p>
        </div>
        <p className="shrink-0 text-right">
          {item.prefix && <span className="mb-1 block text-xs text-muted-foreground">{item.prefix}</span>}
          <span className="block text-3xl font-bold leading-none text-primary">{item.price}</span>
          {item.unit && <span className="mt-1 block text-xs text-muted-foreground">{item.unit}</span>}
        </p>
      </div>

      {item.fill !== undefined && <LoadGauge fill={item.fill} />}

      <div className="mt-auto">
        <ContactButtons label={item.name} highlight={item.popular} />
      </div>
    </article>
  )
}
