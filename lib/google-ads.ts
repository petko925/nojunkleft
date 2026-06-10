const GOOGLE_ADS_BASE_URL = "https://googleads.googleapis.com/v18"

// Contra Costa County, CA geo target constant ID
// Verify via: GET https://googleads.googleapis.com/v18/geoTargetConstants?locale=en&countryCode=US&query=Contra+Costa
const CONTRA_COSTA_COUNTY_GEO_ID = "9031891"

interface GoogleAdsConfig {
  developerToken: string
  clientId: string
  clientSecret: string
  refreshToken: string
  customerId: string
  loginCustomerId?: string
}

function getConfig(): GoogleAdsConfig {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID

  if (!developerToken || !clientId || !clientSecret || !refreshToken || !customerId) {
    throw new Error("Missing Google Ads environment variables")
  }

  return {
    developerToken,
    clientId,
    clientSecret,
    // Remove dashes from customer ID (e.g. 123-456-7890 → 1234567890)
    customerId: customerId.replace(/-/g, ""),
    refreshToken,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, ""),
  }
}

async function getAccessToken(config: GoogleAdsConfig): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OAuth2 token refresh failed: ${err}`)
  }
  const data = await res.json()
  return data.access_token as string
}

function buildHeaders(config: GoogleAdsConfig, accessToken: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": config.developerToken,
    "Content-Type": "application/json",
  }
  if (config.loginCustomerId) {
    headers["login-customer-id"] = config.loginCustomerId
  }
  return headers
}

async function apiPost(path: string, body: object): Promise<Record<string, unknown>> {
  const config = getConfig()
  const accessToken = await getAccessToken(config)
  const headers = buildHeaders(config, accessToken)

  const res = await fetch(`${GOOGLE_ADS_BASE_URL}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Google Ads API error [${path}]: ${JSON.stringify(data)}`)
  }
  return data as Record<string, unknown>
}

// ============================================================
// LIST CAMPAIGNS
// ============================================================
export async function listCampaigns() {
  const config = getConfig()
  const accessToken = await getAccessToken(config)
  const headers = buildHeaders(config, accessToken)

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.cost_micros
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.name
  `

  const res = await fetch(
    `${GOOGLE_ADS_BASE_URL}/customers/${config.customerId}/googleAds:search`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    }
  )

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Failed to list campaigns: ${JSON.stringify(data)}`)
  }
  return data as { results?: CampaignRow[] }
}

export interface CampaignRow {
  campaign: {
    id: string
    name: string
    status: "ENABLED" | "PAUSED" | "REMOVED"
    advertisingChannelType: string
    resourceName: string
  }
  campaignBudget?: {
    amountMicros: string
  }
  metrics?: {
    impressions: string
    clicks: string
    conversions: string
    costMicros: string
  }
}

// ============================================================
// UPDATE CAMPAIGN STATUS
// ============================================================
export async function updateCampaignStatus(
  campaignId: string,
  status: "ENABLED" | "PAUSED"
) {
  const config = getConfig()
  const resourceName = `customers/${config.customerId}/campaigns/${campaignId}`

  return apiPost(`customers/${config.customerId}/campaigns:mutate`, {
    operations: [
      {
        updateMask: "status",
        update: { resourceName, status },
      },
    ],
  })
}

// ============================================================
// CREATE CONTRA COSTA COUNTY CAMPAIGN
// Full setup: budget → campaign → geo target → 2 ad groups →
// keywords → responsive search ads → campaign-level negatives
// ============================================================
export async function createContraCostaCountyCampaign(dailyBudgetUsd: number) {
  const config = getConfig()
  const customerId = config.customerId

  // Step 1: Campaign budget
  const budgetData = await apiPost(`customers/${customerId}/campaignBudgets:mutate`, {
    operations: [
      {
        create: {
          name: `No Junk Left - Contra Costa Budget (${Date.now()})`,
          amountMicros: String(Math.round(dailyBudgetUsd * 1_000_000)),
          deliveryMethod: "STANDARD",
          explicitlyShared: false,
        },
      },
    ],
  })
  const budgetResourceName = (budgetData.results as { resourceName: string }[])[0].resourceName

  // Step 2: Campaign — starts PAUSED so user can review before going live
  const campaignData = await apiPost(`customers/${customerId}/campaigns:mutate`, {
    operations: [
      {
        create: {
          name: "No Junk Left Behind - Contra Costa County",
          advertisingChannelType: "SEARCH",
          status: "PAUSED",
          campaignBudget: budgetResourceName,
          // Maximize Clicks: automated bidding that gets as many clicks as possible
          targetSpend: {
            cpcBidCeilingMicros: String(5 * 1_000_000), // $5 max CPC ceiling
          },
          networkSettings: {
            targetGoogleSearch: true,
            targetSearchNetwork: true,
            targetContentNetwork: false,
            targetPartnerSearchNetwork: false,
          },
          geoTargetTypeSetting: {
            positiveGeoTargetType: "PRESENCE_OR_INTEREST",
          },
          startDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
        },
      },
    ],
  })
  const campaignResourceName = (campaignData.results as { resourceName: string }[])[0].resourceName
  const campaignId = campaignResourceName.split("/").pop()!

  // Step 3: Location targeting — Contra Costa County, CA
  await apiPost(`customers/${customerId}/campaignCriteria:mutate`, {
    operations: [
      {
        create: {
          campaign: campaignResourceName,
          type: "LOCATION",
          location: {
            geoTargetConstant: `geoTargetConstants/${CONTRA_COSTA_COUNTY_GEO_ID}`,
          },
        },
      },
    ],
  })

  // Step 4: Campaign-level negative keywords (avoid irrelevant traffic)
  const negatives = ["junk food", "junk mail", "junk email", "spam", "junk bonds", "junk yard parts"]
  await apiPost(`customers/${customerId}/campaignCriteria:mutate`, {
    operations: negatives.map((text) => ({
      create: {
        campaign: campaignResourceName,
        type: "NEGATIVE_KEYWORD",
        keyword: { text, matchType: "BROAD" },
      },
    })),
  })

  // Step 5: Create ad groups with keywords + responsive search ads
  const adGroupConfigs = [
    {
      name: "Junk Removal",
      defaultCpcMicros: "3000000", // $3.00
      keywords: [
        { text: "junk removal contra costa county", matchType: "EXACT" },
        { text: "junk removal near me", matchType: "PHRASE" },
        { text: "junk removal walnut creek", matchType: "EXACT" },
        { text: "junk removal concord ca", matchType: "EXACT" },
        { text: "junk removal antioch", matchType: "EXACT" },
        { text: "junk removal pittsburg ca", matchType: "EXACT" },
        { text: "junk removal martinez ca", matchType: "EXACT" },
        { text: "junk hauling service", matchType: "PHRASE" },
        { text: "junk pickup service near me", matchType: "PHRASE" },
      ],
      headlines: [
        "Junk Removal Contra Costa",
        "Same-Day Junk Pickup",
        "Fast & Affordable Hauling",
        "No Junk Left Behind",
        "Local Junk Removal Co.",
        "Free Instant AI Quote",
        "Serving Contra Costa Co.",
        "Reliable Junk Removal",
        "Quick Junk Hauling",
        "Call For Free Quote",
        "Licensed & Insured",
        "We Haul Everything",
        "Walnut Creek Junk Removal",
        "Concord Junk Hauling",
        "Book Online Today",
      ],
      descriptions: [
        "Fast, affordable junk removal in Contra Costa County. Get an instant AI-powered quote. Book online today!",
        "Professional junk hauling for homes & businesses. Same-day service available. Call 925-395-3002 now.",
        "No Junk Left Behind — trusted local removal. Serving Walnut Creek, Concord, Martinez & all of Contra Costa.",
        "Get rid of junk fast! We handle furniture, appliances, yard waste & more. Free estimates at nojunkleft.com.",
      ],
    },
    {
      name: "Cleanout Services",
      defaultCpcMicros: "2500000", // $2.50
      keywords: [
        { text: "garage cleanout service", matchType: "EXACT" },
        { text: "house cleanout service", matchType: "PHRASE" },
        { text: "estate cleanout near me", matchType: "PHRASE" },
        { text: "furniture removal service", matchType: "PHRASE" },
        { text: "appliance removal near me", matchType: "PHRASE" },
        { text: "yard debris removal", matchType: "PHRASE" },
        { text: "hoarding cleanup service", matchType: "BROAD" },
        { text: "get rid of old furniture", matchType: "PHRASE" },
      ],
      headlines: [
        "Garage Cleanout Service",
        "House Cleanout Specialists",
        "Estate Cleanout Service",
        "Fast Furniture Removal",
        "Appliance Hauling Service",
        "Full Home Cleanouts",
        "No Junk Left Behind",
        "Free Instant Quote",
        "Same Day Available",
        "Licensed & Insured",
        "Local & Affordable",
        "Serving Contra Costa",
        "Reliable Cleanout Crew",
        "Book Online Today",
        "Eco-Friendly Disposal",
      ],
      descriptions: [
        "Complete garage, estate & house cleanout in Contra Costa County. Efficient, eco-friendly disposal.",
        "We clear garages, attics, storage units & whole homes. Get an instant quote at nojunkleft.com.",
        "Professional cleanout services for homes & businesses. Fast, affordable & eco-conscious. Book online!",
        "From garage cleanouts to full estate clearances — No Junk Left Behind handles it all. Free estimates!",
      ],
    },
  ]

  const createdAdGroups: { name: string; resourceName: string }[] = []

  for (const cfg of adGroupConfigs) {
    // Create ad group
    const adGroupData = await apiPost(`customers/${customerId}/adGroups:mutate`, {
      operations: [
        {
          create: {
            name: cfg.name,
            campaign: campaignResourceName,
            status: "ENABLED",
            type: "SEARCH_STANDARD",
            cpcBidMicros: cfg.defaultCpcMicros,
          },
        },
      ],
    })
    const adGroupResourceName = (adGroupData.results as { resourceName: string }[])[0].resourceName

    // Create keywords
    await apiPost(`customers/${customerId}/adGroupCriteria:mutate`, {
      operations: cfg.keywords.map((kw) => ({
        create: {
          adGroup: adGroupResourceName,
          type: "KEYWORD",
          status: "ENABLED",
          keyword: { text: kw.text, matchType: kw.matchType },
        },
      })),
    })

    // Create responsive search ad
    await apiPost(`customers/${customerId}/adGroupAds:mutate`, {
      operations: [
        {
          create: {
            adGroup: adGroupResourceName,
            status: "ENABLED",
            ad: {
              finalUrls: ["https://www.nojunkleft.com"],
              responsiveSearchAd: {
                headlines: cfg.headlines.map((text) => ({ text })),
                descriptions: cfg.descriptions.map((text) => ({ text })),
                path1: "junk-removal",
                path2: "contra-costa",
              },
            },
          },
        },
      ],
    })

    createdAdGroups.push({ name: cfg.name, resourceName: adGroupResourceName })
  }

  return {
    campaignId,
    campaignResourceName,
    budgetResourceName,
    dailyBudgetUsd,
    adGroups: createdAdGroups,
  }
}

export function isConfigured(): boolean {
  return !!(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_ADS_CLIENT_ID &&
    process.env.GOOGLE_ADS_CLIENT_SECRET &&
    process.env.GOOGLE_ADS_REFRESH_TOKEN &&
    process.env.GOOGLE_ADS_CUSTOMER_ID
  )
}
