"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  ShoppingCart,
  TrendingUp,
  Zap,
} from "lucide-react"
import type { CampaignRow } from "@/lib/google-ads"

interface AdState {
  loading: boolean
  configured: boolean | null
  campaigns: CampaignRow[]
  error: string | null
}

function microsToUsd(micros: string | undefined): string {
  if (!micros) return "—"
  return `$${(Number(micros) / 1_000_000).toFixed(2)}`
}

function budgetMicrosToDaily(micros: string | undefined): string {
  if (!micros) return "—"
  return `$${(Number(micros) / 1_000_000).toFixed(0)}/day`
}

const statusColor: Record<string, string> = {
  ENABLED: "bg-green-500/10 text-green-500",
  PAUSED: "bg-yellow-500/10 text-yellow-500",
  REMOVED: "bg-red-500/10 text-red-500",
}

const SETUP_STEPS = [
  {
    label: "Google Ads Account",
    detail: "Sign in at ads.google.com and note your 10-digit Customer ID (top right corner).",
    env: null,
  },
  {
    label: "Developer Token",
    detail: "In Google Ads: Tools → API Center → Apply for Basic access. Copy the token.",
    env: "GOOGLE_ADS_DEVELOPER_TOKEN",
  },
  {
    label: "OAuth2 Credentials",
    detail: "Google Cloud Console → APIs → Credentials → Create OAuth2 Client ID (Web app). Enable the Google Ads API.",
    env: "GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET",
  },
  {
    label: "Refresh Token",
    detail: "Run the OAuth2 flow once to get a refresh token. Use Google's OAuth2 Playground or the helper script below.",
    env: "GOOGLE_ADS_REFRESH_TOKEN",
  },
  {
    label: "Customer ID",
    detail: "Your Google Ads account ID. Format: 123-456-7890. Dashes are stripped automatically.",
    env: "GOOGLE_ADS_CUSTOMER_ID",
  },
]

export default function GoogleAdsPage() {
  const [state, setState] = useState<AdState>({
    loading: true,
    configured: null,
    campaigns: [],
    error: null,
  })
  const [launching, setLaunching] = useState(false)
  const [dailyBudget, setDailyBudget] = useState("30")
  const [launchResult, setLaunchResult] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    setState((s: AdState) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch("/api/admin/google-ads")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setState({ loading: false, configured: data.configured, campaigns: data.campaigns, error: null })
    } catch (err) {
      setState((s: AdState) => ({ ...s, loading: false, error: String(err) }))
    }
  }

  async function launchCampaign() {
    setLaunching(true)
    setLaunchResult(null)
    try {
      const res = await fetch("/api/admin/google-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyBudget: Number(dailyBudget) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create campaign")
      setLaunchResult(`Campaign created! ID: ${data.campaignId} — it's PAUSED. Review in Google Ads then enable it here.`)
      await fetchCampaigns()
    } catch (err) {
      setLaunchResult(`Error: ${String(err)}`)
    } finally {
      setLaunching(false)
    }
  }

  async function toggleCampaign(campaignId: string, currentStatus: string) {
    const newStatus = currentStatus === "ENABLED" ? "PAUSED" : "ENABLED"
    setTogglingId(campaignId)
    try {
      const res = await fetch(`/api/admin/google-ads/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      await fetchCampaigns()
    } catch (err) {
      alert(`Failed to update campaign: ${String(err)}`)
    } finally {
      setTogglingId(null)
    }
  }

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Ads</h1>
        <p className="text-muted-foreground">
          Manage your Contra Costa County search ad campaigns
        </p>
      </div>

      {/* Configuration status */}
      <Card className={state.configured ? "border-green-500/20" : "border-yellow-500/20"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {state.configured ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            {state.configured ? "Connected to Google Ads" : "Setup Required"}
          </CardTitle>
          {!state.configured && (
            <CardDescription>
              Add these environment variables to your <code className="text-xs bg-muted px-1 rounded">.env.local</code>{" "}
              (or your Vercel project settings) then redeploy.
            </CardDescription>
          )}
        </CardHeader>
        {!state.configured && (
          <CardContent>
            <div className="space-y-4">
              {SETUP_STEPS.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                    {step.env && (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-1 inline-block text-orange-400">
                        {step.env}
                      </code>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                  Required env vars summary
                </p>
                <pre className="text-xs text-foreground/80 leading-relaxed">{`GOOGLE_ADS_DEVELOPER_TOKEN=your-token
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
# Optional — only if using a manager (MCC) account:
# GOOGLE_ADS_LOGIN_CUSTOMER_ID=your-mcc-id`}</pre>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://developers.google.com/google-ads/api/docs/get-started/oauth-cloud-project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Google Ads API Setup Guide
                </a>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Conversion tracking notice */}
      {state.configured && (
        <Card className="border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              Conversion Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              To track leads from your ads, add{" "}
              <code className="text-xs bg-muted px-1 rounded">NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID</code> (format:{" "}
              <code className="text-xs">AW-XXXXXXXXXX</code>) to your env vars.
              Find it in Google Ads → Tools → Conversions. Estimate submissions and bookings will
              automatically fire conversion events.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Launch new campaign */}
      {state.configured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-500" />
              Launch Contra Costa County Campaign
            </CardTitle>
            <CardDescription>
              Creates a Search campaign targeting Contra Costa County with 2 ad groups, 17 keywords,
              and responsive search ads. Campaign starts <strong>paused</strong> — review it in
              Google Ads before enabling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4 max-w-xs">
              <div className="flex-1">
                <Label htmlFor="daily-budget" className="text-sm">
                  Daily Budget (USD)
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="daily-budget"
                    type="number"
                    min="5"
                    max="500"
                    step="5"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Included:</strong> Junk Removal + Cleanout Services ad groups, negative
                keywords, Contra Costa County geo-targeting, responsive search ads.
              </p>
              <p>
                <strong>Bidding:</strong> Maximize Clicks (automated) with $5 max CPC ceiling.
              </p>
            </div>

            <Button
              onClick={launchCampaign}
              disabled={launching}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {launching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating campaign…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Create Campaign (${dailyBudget}/day)
                </>
              )}
            </Button>

            {launchResult && (
              <p
                className={`text-sm p-3 rounded-lg ${
                  launchResult.startsWith("Error")
                    ? "bg-red-500/10 text-red-400"
                    : "bg-green-500/10 text-green-400"
                }`}
              >
                {launchResult}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Campaign list */}
      {state.configured && state.campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Active Campaigns
            </CardTitle>
            <CardDescription>Last 30 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.campaigns.map((row) => {
                const campaign = row.campaign
                const metrics = row.metrics
                const budget = row.campaignBudget
                const isToggling = togglingId === campaign.id
                return (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{campaign.name}</p>
                        <Badge className={statusColor[campaign.status] ?? ""} variant="secondary">
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {metrics?.clicks ?? "0"} clicks
                        </span>
                        <span>{metrics?.impressions ?? "0"} impr.</span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {metrics?.conversions ?? "0"} conv.
                        </span>
                        <span>Spend: {microsToUsd(metrics?.costMicros)}</span>
                        <span>Budget: {budgetMicrosToDaily(budget?.amountMicros)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isToggling}
                        onClick={() => toggleCampaign(campaign.id, campaign.status)}
                      >
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : campaign.status === "ENABLED" ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" /> Enable
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href={`https://ads.google.com/aw/campaigns?campaignId=${campaign.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {state.configured && state.campaigns.length === 0 && !state.error && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No campaigns yet. Use the form above to launch your first campaign.
          </CardContent>
        </Card>
      )}

      {state.error && (
        <Card className="border-red-500/20">
          <CardContent className="py-6">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {state.error}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
