import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { QuoteEstimator } from "@/components/quote-estimator"
import { SchedulePickup } from "@/components/schedule-pickup"
import { TrailerAvailability } from "@/components/trailer-availability"
import { PricingSection } from "@/components/pricing-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <QuoteEstimator />
      <SchedulePickup />
      <TrailerAvailability />
      <PricingSection />
      <Footer />
    </main>
  )
}
