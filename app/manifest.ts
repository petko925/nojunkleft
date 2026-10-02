import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "No Junk Left Behind",
    short_name: "No Junk",
    description: "Professional junk and garbage removal with AI-powered estimates",
    start_url: "/",
    display: "standalone",
    background_color: "#19191b",
    theme_color: "#ff6a13",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  }
}
