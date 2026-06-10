import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { updateCampaignStatus, isConfigured } from "@/lib/google-ads"

async function checkAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}

// PATCH — enable or pause a campaign
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isConfigured()) {
    return NextResponse.json({ error: "Google Ads not configured" }, { status: 400 })
  }

  try {
    const { id } = await params
    const { status } = await req.json()

    if (status !== "ENABLED" && status !== "PAUSED") {
      return NextResponse.json({ error: "status must be ENABLED or PAUSED" }, { status: 400 })
    }

    const result = await updateCampaignStatus(id, status)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("[google-ads] update campaign error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
