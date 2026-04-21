"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: { wrapper: "h-8", text: "text-lg", icon: "w-8 h-8" },
    md: { wrapper: "h-10", text: "text-xl", icon: "w-10 h-10" },
    lg: { wrapper: "h-14", text: "text-3xl", icon: "w-14 h-14" },
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative", sizes[size].icon)}>
        {/* Truck icon with arrow */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Truck body */}
          <rect
            x="4"
            y="18"
            width="28"
            height="16"
            rx="2"
            className="fill-primary"
          />
          {/* Truck cabin */}
          <path
            d="M32 22H40C42.2091 22 44 23.7909 44 26V32C44 33.1046 43.1046 34 42 34H32V22Z"
            className="fill-primary"
          />
          {/* Window */}
          <rect x="34" y="24" width="6" height="4" rx="1" className="fill-background" />
          {/* Wheels */}
          <circle cx="12" cy="36" r="4" className="fill-accent" />
          <circle cx="38" cy="36" r="4" className="fill-accent" />
          <circle cx="12" cy="36" r="2" className="fill-background" />
          <circle cx="38" cy="36" r="2" className="fill-background" />
          {/* Arrow going up and out */}
          <path
            d="M18 8L24 2L30 8M24 2V16"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-accent"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("font-bold tracking-tight text-primary", sizes[size].text)}>
          No Junk
        </span>
        <span className={cn("font-medium tracking-wide text-foreground/80", size === "lg" ? "text-sm" : "text-xs")}>
          LEFT BEHIND
        </span>
      </div>
    </div>
  )
}
