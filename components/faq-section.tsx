import { MessageSquare, Phone } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { business } from "@/lib/business"
import { faqs } from "@/lib/faq"

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-secondary">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">FAQ</p>
          <h2 id="faq-title" className="text-balance text-3xl font-black uppercase md:text-4xl">
            Straight answers
          </h2>
          <p className="text-pretty text-muted-foreground">Still have a question? Call or text &mdash; a real person answers.</p>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Button asChild className="h-12 px-5 font-bold">
              <a href={business.phoneHref}>
                <Phone className="size-4" aria-hidden="true" />
                Call {business.phoneDisplay}
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12 px-5 font-bold">
              <a href={business.smsHref}>
                <MessageSquare className="size-4" aria-hidden="true" />
                Text Us
              </a>
            </Button>
          </div>
        </div>
        <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-5">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-left text-base font-bold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-pretty text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
