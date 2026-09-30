import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    q: "What counts as a 1/4 load vs a 1/2 load?",
    a: "Loads are measured by how much of our trailer your stuff fills. A 1/4 load is roughly a couch, a mattress, and a few boxes or bags. A 1/2 load is about a single-room or small garage cleanout. Can't tell? Text us a photo and we'll tell you which size it is.",
  },
  {
    q: "What's included in the price?",
    a: "For We Load pickups, the price covers the labor, loading, hauling, and disposal. You point, we carry. We confirm the price on site before we start, and you only pay for the space you actually use.",
  },
  {
    q: "How do dump fees work?",
    a: "On We Load pickups, disposal is built into the load price. On a Trailer Drop-Off, dump fees are included up to 2 tons. If you go over, we'll tell you the extra cost before we haul it away. With a Dump Trailer Rental, you tow it and handle the dumping yourself.",
  },
  {
    q: "Can I add loading to a trailer drop-off?",
    a: "Yes. Add our crew to load it for you for +$75 per job.",
  },
]

export function PricingFaq() {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold">Pricing questions</h3>
      <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-5">
        {faqs.map((faq) => (
          <AccordionItem key={faq.q} value={faq.q}>
            <AccordionTrigger className="py-4 text-base">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
