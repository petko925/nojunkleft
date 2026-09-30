import { MessageSquare, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export const PHONE_DISPLAY = "707-298-4268"
export const PHONE_HREF = "+17072984268"

export function ContactButtons({ label, highlight = false }: { label: string; highlight?: boolean }) {
  const smsBody = encodeURIComponent(`Hi, I'm interested in: ${label}`)

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button asChild size="lg" variant={highlight ? "default" : "secondary"} className="h-12 text-base">
        <a href={`tel:${PHONE_HREF}`} aria-label={`Call ${PHONE_DISPLAY} about ${label}`}>
          <Phone className="size-4" aria-hidden="true" />
          Call
        </a>
      </Button>
      <Button asChild size="lg" variant="outline" className="h-12 text-base">
        <a href={`sms:${PHONE_HREF}?&body=${smsBody}`} aria-label={`Text ${PHONE_DISPLAY} about ${label}`}>
          <MessageSquare className="size-4" aria-hidden="true" />
          Text
        </a>
      </Button>
    </div>
  )
}
