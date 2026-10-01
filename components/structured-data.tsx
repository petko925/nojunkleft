import { business, loadTiers, serviceCities, singleItemPrice, trailerOptions } from "@/lib/business"
import { faqs } from "@/lib/faq"

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${business.url}/#business`,
  name: business.name,
  description: "Fixed-price junk removal and dump trailer rental in Contra Costa County, California.",
  url: business.url,
  telephone: "+1-707-298-4268",
  email: business.email,
  image: `${business.url}/images/hero-crew.webp`,
  logo: `${business.url}/icon.svg`,
  priceRange: `$${singleItemPrice}–$${loadTiers[loadTiers.length - 1].price}`,
  address: {
    "@type": "PostalAddress",
    addressRegion: business.state,
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Contra Costa County, CA" },
    ...serviceCities.map((city) => ({ "@type": "City", name: `${city}, CA` })),
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "07:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "09:00",
      closes: "17:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Junk removal pricing",
    itemListElement: [
      ...loadTiers.map((tier) => ({
        "@type": "Offer",
        name: `${tier.name} junk removal`,
        price: tier.price,
        priceCurrency: "USD",
      })),
      { "@type": "Offer", name: "Single bulky item removal", price: singleItemPrice, priceCurrency: "USD" },
      ...trailerOptions.map((option) => ({
        "@type": "Offer",
        name: option.name,
        price: option.price,
        priceCurrency: "USD",
      })),
    ],
  },
}

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
}

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage).replace(/</g, "\\u003c") }}
      />
    </>
  )
}
