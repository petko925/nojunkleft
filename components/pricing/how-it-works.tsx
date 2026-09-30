const steps = [
  { title: "Pick your load size", body: "Call, text, or book online. Not sure? Send a photo." },
  { title: "We show up", body: "We arrive in your window and confirm the price before lifting anything." },
  { title: "We haul it away", body: "We load it, sweep up, and take it to the dump or recycler." },
]

export function HowItWorks() {
  return (
    <div className="rounded-xl bg-secondary p-5 md:p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">How it works</h3>
      <ol className="flex flex-col gap-4 md:flex-row md:gap-6">
        {steps.map((step, i) => (
          <li key={step.title} className="flex flex-1 items-start gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold leading-snug">{step.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
