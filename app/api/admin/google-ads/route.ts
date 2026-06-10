import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { listCampaigns, createContraCostaCountyCampaign, isConfigured } from "@/lib/google-ads"

async function checkAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}

// GET — list campaigns and configuration status
export async function GET() {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isConfigured()) {
    return NextResponse.json({ configured: false, campaigns: [] })
  }

  try {
    const data = await listCampaigns()
    return NextResponse.json({ configured: true, campaigns: data.results ?? [] })
  } catch (error) {
    console.error("[google-ads] list campaigns error:", error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

// POST — create the Contra Costa County campaign
export async function POST(req: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Google Ads credentials not configured. Add the required environment variables." },
      { status: 400 }
    )
  }

  try {
    const body = await req.json()
    const dailyBudget = Math.max(5, Math.min(500, Number(body.dailyBudget) || 30))
    const result = await createContraCostaCountyCampaign(dailyBudget)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("[google-ads] create campaign error:", error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
