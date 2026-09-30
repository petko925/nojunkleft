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
        {/* Artistic truck icon with enhanced design */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="text-primary" stopColor="currentColor" />
              <stop offset="100%" stopColor="#FF8C00" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>
          
          {/* Truck cargo box with gradient */}
          <rect
            x="8"
            y="24"
            width="32"
            height="18"
            rx="3"
            fill="url(#truckGradient)"
            filter="url(#shadow)"
            style={{ opacity: 0.95 }}
          />
          
          {/* Truck cabin */}
          <path
            d="M40 28H52C54.2091 28 56 29.7909 56 32V40C56 41.1046 55.1046 42 54 42H40V28Z"
            fill="url(#truckGradient)"
            filter="url(#shadow)"
            style={{ opacity: 0.95 }}
          />
          
          {/* Cabin window with accent */}
          <rect x="44" y="30" width="8" height="6" rx="1.5" className="fill-background" />
          <rect x="44" y="30" width="8" height="6" rx="1.5" className="stroke-accent" strokeWidth="0.5" />
          
          {/* Front bumper accent */}
          <rect x="52" y="38" width="4" height="4" rx="1" className="fill-accent" />
          
          {/* Front wheels - dynamic design */}
          <circle cx="18" cy="46" r="6" className="stroke-primary" strokeWidth="2" />
          <circle cx="18" cy="46" r="3" className="fill-accent" />
          <circle cx="18" cy="46" r="1.5" className="fill-background" />
          
          {/* Rear wheels - dynamic design */}
          <circle cx="50" cy="46" r="6" className="stroke-primary" strokeWidth="2" />
          <circle cx="50" cy="46" r="3" className="fill-accent" />
          <circle cx="50" cy="46" r="1.5" className="fill-background" />
          
          {/* Dynamic upward arrow with style */}
          <g filter="url(#shadow)">
            {/* Arrow shaft */}
            <path
              d="M30 18V6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="stroke-accent"
            />
            {/* Arrow head - enhanced */}
            <path
              d="M24 12L30 2L36 12"
              fill="url(#truckGradient)"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-accent"
            />
          </g>
          
          {/* Accent glow around truck */}
          <rect
            x="8"
            y="24"
            width="32"
            height="18"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="stroke-accent opacity-50"
          />
        </svg>
      </div>
      
      {/* Text with enhanced styling */}
      <div className="flex flex-col leading-tight">
        <span className={cn(
          "font-black tracking-tighter text-primary drop-shadow-sm",
          sizes[size].text
        )}>
          No Junk
        </span>
        <span className={cn(
          "font-bold tracking-wider text-accent",
          size === "lg" ? "text-sm" : "text-xs"
        )}>
          LEFT BEHIND
        </span>
      </div>
    </div>
  )
}
