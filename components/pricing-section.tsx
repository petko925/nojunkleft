"use client"

import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

const pricingTiers = [
  {
    name: "Pickup Truck Load",
    description: "Small cleanouts and quick jobs",
    price: 99,
    priceNote: "Starting at",
    capacity: "1-3 cubic yards",
    popular: false,
    features: [
      "Few bags of trash or debris",
      "Small furniture items",
      "Single room cleanout",
      "Same-day service available",
      "Eco-friendly disposal",
    ],
  },
  {
    name: "Quarter Trailer",
    description: "Medium projects and renovations",
    price: 199,
    priceNote: "Starting at",
    capacity: "4-8 cubic yards",
    popular: true,
    features: [
      "Multiple furniture items",
      "Appliances included",
      "Garage or attic cleanout",
      "Priority scheduling",
      "Free on-site estimate",
      "Recycling included",
    ],
  },
  {
    name: "Half Trailer",
    description: "Large cleanouts and estates",
    price: 399,
    priceNote: "Starting at",
    capacity: "9-14 cubic yards",
    popular: false,
    features: [
      "Estate cleanouts",
      "Multiple rooms",
      "Heavy items included",
      "Dedicated crew",
      "Same-day service",
      "Donation coordination",
    ],
  },
  {
    name: "Full Trailer",
    description: "Construction and major projects",
    price: 899,
    priceNote: "Starting at",
    capacity: "15-20 cubic yards",
    popular: false,
    features: [
      "Full house cleanouts",
      "Construction debris",
      "Commercial projects",
      "Extended crew hours",
      "Project management",
      "All disposal fees included",
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            No hidden fees. Pay only for the space you use. Get a free estimate before we start.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pricingTiers.map((tier, i) => (
            <Card 
              key={tier.name}
              className={cn(
                "bg-card border-border relative flex flex-col",
                tier.popular && "border-primary ring-2 ring-primary/20"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">{tier.priceNote}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-primary">${tier.price}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{tier.capacity}</span>
                </div>
                
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-chart-4 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild
                  variant={tier.popular ? "default" : "outline"}
                  className="w-full h-12"
                >
                  <Link href="#estimate">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-secondary rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-2">No Surprises</div>
              <p className="text-sm text-muted-foreground">Price quoted is the price you pay. We never add hidden fees.</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-2">Free Estimates</div>
              <p className="text-sm text-muted-foreground">Not sure about the size? We provide free on-site estimates.</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-2">We Do The Work</div>
              <p className="text-sm text-muted-foreground">Our team handles all the lifting and hauling. You just point.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
