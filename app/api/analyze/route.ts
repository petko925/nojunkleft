/**
 * /api/analyze - AI junk load estimation endpoint
 * Always returns JSON responses
 */

export async function POST(req: Request) {
  try {
    console.log("[analyze] route hit")

    const contentType = req.headers.get("content-type") || ""
    console.log("[analyze] content-type:", contentType)

    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        { success: false, error: "Unsupported content type" },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return Response.json(
        { success: false, error: "No image file received" },
        { status: 400 }
      )
    }

    console.log("[analyze] file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Return fallback estimate (AI integration can be added later)
    const fallbackEstimate = {
      success: true as const,
      loadSize: "quarter" as const,
      items: ["small furniture", "misc household items"],
      priceMin: 150,
      priceMax: 250,
      confidence: "low" as const,
      summary: "Fallback estimate generated because live AI analysis is not configured.",
    }

    console.log("[analyze] returning fallback estimate")
    return Response.json(fallbackEstimate)

  } catch (error) {
    console.error("[analyze] fatal error:", error)

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}
