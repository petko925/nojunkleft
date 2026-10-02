import { renderBrandIcon } from "../icon"

export function GET() {
  const response = renderBrandIcon(48)
  response.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800")
  return response
}
