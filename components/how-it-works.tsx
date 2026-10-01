import { Camera, Tag, Truck } from "lucide-react"

const steps = [
  {
    icon: Camera,
    title: "Snap a photo or pick a load size",
    body: "Send us a picture for an AI estimate, or choose 1/4 to full load below.",
  },
  {
    icon: Tag,
    title: "Get your fixed price",
    body: "You see the price before we lift anything. No hidden fees.",
  },
  {
    icon: Truck,
    title: "We haul it away",
    body: "We load it, haul it, and recycle or donate what we can.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 md:py-20">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">How it works</p>
          <h2 id="how-title" className="text-balance text-3xl font-black uppercase md:text-4xl">
            Gone in three steps
          </h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-xl border border-border bg-card p-5 md:flex-col">
              <div className="flex shrink-0 items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg bg-ink text-primary">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-display text-4xl font-black text-border md:ml-auto" aria-hidden="true">
                  0{index + 1}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-extrabold">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="text-pretty text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
