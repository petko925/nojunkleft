import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { PricingSection } from "@/components/pricing-section"
import { QuoteEstimator } from "@/components/quote-estimator"
import { SchedulePickup } from "@/components/schedule-pickup"
import { TrailerAvailability } from "@/components/trailer-availability"
import { EcoSection } from "@/components/eco-section"
import { ServiceAreaSection } from "@/components/service-area-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { MobileActionBar } from "@/components/mobile-action-bar"
import { StructuredData } from "@/components/structured-data"

export default function Home() {
  return (
    <>
      <StructuredData />
      <Navigation />
      <main className="min-h-screen bg-background">
        <HeroSection />
        <HowItWorks />
        <PricingSection />
        <QuoteEstimator />
        <SchedulePickup />
        <TrailerAvailability />
        <EcoSection />
        <ServiceAreaSection />
        <FaqSection />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  )
}
