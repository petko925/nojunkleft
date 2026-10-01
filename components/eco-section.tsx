import { HeartHandshake, Leaf, Recycle } from "lucide-react"

export function EcoSection() {
  return (
    <section aria-labelledby="eco-title" className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-6 rounded-2xl bg-accent p-5 md:grid-cols-[1.2fr_2fr] md:items-center md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-ink text-primary">
              <Leaf className="size-6" aria-hidden="true" />
            </span>
            <h2 id="eco-title" className="text-balance font-display text-xl font-black uppercase">
              Less goes to the landfill
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex gap-3">
              <Recycle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-pretty text-sm leading-relaxed">
                Metal, cardboard, e-waste, and yard waste get sorted and recycled.
              </p>
            </li>
            <li className="flex gap-3">
              <HeartHandshake className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-pretty text-sm leading-relaxed">
                Usable furniture and household goods get donated to local charities.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
