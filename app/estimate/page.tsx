import { QuoteEstimator } from "@/components/quote-estimator"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Get a Free Quote | No Junk Left Behind",
  description: "Upload a photo of your junk and get an instant quote from No Junk Left Behind. Professional junk removal pricing in seconds.",
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <QuoteEstimator />
      <Footer />
    </main>
  )
}
