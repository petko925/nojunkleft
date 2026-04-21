import { cookies } from "next/headers"

/**
 * Check if user has valid admin session
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get("admin_session")?.value
    
    const isValid = sessionValue === "authenticated"

    return Response.json({ 
      success: true, 
      authenticated: isValid 
    })
  } catch (error) {
    console.error("[admin/session] Error:", error)
    return Response.json(
      { success: false, authenticated: false },
      { status: 500 }
    )
  }
}
