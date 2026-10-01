export const business = {
  name: "No Junk Left Behind",
  url: "https://www.nojunkleft.com",
  phoneDisplay: "707-298-4268",
  phoneHref: "tel:+17072984268",
  smsHref: "sms:+17072984268",
  email: "nojunkleftca@gmail.com",
  region: "Contra Costa County",
  state: "CA",
  hours: [
    { days: "Mon–Sat", time: "7AM–7PM" },
    { days: "Sun", time: "9AM–5PM" },
  ],
} as const

export const serviceCities = [
  "Concord",
  "Walnut Creek",
  "Pleasant Hill",
  "Martinez",
  "Pittsburg",
  "Antioch",
  "Brentwood",
  "Oakley",
  "Clayton",
  "Danville",
  "San Ramon",
  "Lafayette",
  "Orinda",
  "Moraga",
  "Richmond",
  "San Pablo",
  "El Cerrito",
  "Hercules",
  "Pinole",
  "Discovery Bay",
] as const

export type LoadTier = {
  id: "quarter" | "half" | "three-quarter" | "full"
  name: string
  fraction: number
  price: number
  fits: string
  popular?: boolean
}

export const loadTiers: LoadTier[] = [
  {
    id: "quarter",
    name: "1/4 Load",
    fraction: 0.25,
    price: 199,
    fits: "About one pickup bed. A couch, a mattress set, or 8–10 trash bags.",
  },
  {
    id: "half",
    name: "1/2 Load",
    fraction: 0.5,
    price: 349,
    fits: "About two pickup beds. A small room cleanout or a big pile of yard debris.",
    popular: true,
  },
  {
    id: "three-quarter",
    name: "3/4 Load",
    fraction: 0.75,
    price: 499,
    fits: "A one-car garage cleanout or several rooms of furniture.",
  },
  {
    id: "full",
    name: "Full Load",
    fraction: 1,
    price: 649,
    fits: "A packed garage, estate, or full move-out cleanout.",
  },
]

export const singleItemPrice = 99

export const trailerOptions = [
  {
    id: "rental",
    name: "Dump Trailer Rental",
    tagline: "You tow",
    price: 99,
    unit: "/day",
    details: ["Large dump trailer", "Pick it up, load it, dump it yourself", "Great for DIY remodels and yard work"],
  },
  {
    id: "drop-off",
    name: "Trailer Drop-Off",
    tagline: "We deliver, you load, we haul",
    price: 449,
    unit: "",
    details: [
      "We drop the trailer at your place",
      "Load it at your pace for up to 3 days",
      "We haul it away — dump fees included up to 2 tons",
    ],
  },
] as const

export const loadingAddOnPrice = 75

/** Maps AI estimator size keys to load tiers so photo estimates match the menu. */
export const estimateSizeToTier = {
  small: loadTiers[0],
  medium: loadTiers[1],
  large: loadTiers[2],
  xl: loadTiers[3],
} as const
