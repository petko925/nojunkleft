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
        {/* Premium artistic truck icon */}
        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Main gradient for truck body */}
            <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7F00" />
              <stop offset="100%" stopColor="#FF5500" />
            </linearGradient>
            
            {/* Accent gradient for details */}
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFB84D" />
              <stop offset="100%" stopColor="#FF7F00" />
            </linearGradient>
            
            {/* Arrow gradient - vibrant */}
            <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
            
            {/* Shadow filter */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
            </filter>
            
            {/* Glow effect */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Background circle for balance */}
          <circle cx="40" cy="48" r="36" fill="none" stroke="url(#accentGradient)" strokeWidth="0.8" opacity="0.3" />
          
          {/* Truck cargo box - premium styling */}
          <rect
            x="12"
            y="36"
            width="38"
            height="22"
            rx="4"
            fill="url(#truckGradient)"
            filter="url(#shadow)"
          />
          
          {/* Cargo box highlight - gives depth */}
          <rect
            x="12"
            y="36"
            width="38"
            height="5"
            rx="4"
            fill="white"
            opacity="0.15"
          />
          
          {/* Truck cabin - sophisticated design */}
          <path
            d="M50 38C50 36.8954 50.8954 36 52 36H66C68.2091 36 70 37.7909 70 40V54C70 55.1046 69.1046 56 68 56H50V38Z"
            fill="url(#truckGradient)"
            filter="url(#shadow)"
          />
          
          {/* Cabin window - modern style */}
          <rect x="56" y="40" width="10" height="8" rx="1.5" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
          <rect x="56" y="40" width="10" height="3" fill="white" opacity="0.2" rx="1" />
          
          {/* Headlights - adds character */}
          <circle cx="68" cy="50" r="2.5" fill="white" opacity="0.5" />
          <circle cx="68" cy="45" r="2" fill="white" opacity="0.4" />
          
          {/* Connection between cabin and cargo */}
          <rect x="48" y="42" width="3" height="12" fill="url(#accentGradient)" opacity="0.8" />
          
          {/* Front wheels - sophisticated */}
          <g filter="url(#shadow)">
            {/* Left wheel */}
            <circle cx="22" cy="60" r="8" stroke="url(#truckGradient)" strokeWidth="2.5" />
            <circle cx="22" cy="60" r="5.5" fill="url(#accentGradient)" opacity="0.6" />
            <circle cx="22" cy="60" r="3" fill="#1a1a1a" opacity="0.7" />
            <circle cx="22" cy="60" r="1.2" fill="white" opacity="0.3" />
            
            {/* Right wheel */}
            <circle cx="58" cy="60" r="8" stroke="url(#truckGradient)" strokeWidth="2.5" />
            <circle cx="58" cy="60" r="5.5" fill="url(#accentGradient)" opacity="0.6" />
            <circle cx="58" cy="60" r="3" fill="#1a1a1a" opacity="0.7" />
            <circle cx="58" cy="60" r="1.2" fill="white" opacity="0.3" />
          </g>
          
          {/* Dynamic upward arrow with premium styling */}
          <g filter="url(#glow)">
            {/* Arrow outer glow */}
            <circle cx="40" cy="20" r="14" fill="url(#arrowGradient)" opacity="0.15" />
            
            {/* Arrow shaft - bold and vibrant */}
            <line x1="40" y1="28" x2="40" y2="8" stroke="url(#arrowGradient)" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Arrow head - geometric and striking */}
            <polygon
              points="40,2 34,12 46,12"
              fill="url(#arrowGradient)"
              stroke="#FF5500"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            
            {/* Arrow accent lines for dimension */}
            <line x1="37.5" y1="10" x2="42.5" y2="10" stroke="white" strokeWidth="0.8" opacity="0.4" />
          </g>
          
          {/* Premium border accent */}
          <rect
            x="12"
            y="36"
            width="38"
            height="22"
            rx="4"
            fill="none"
            stroke="url(#accentGradient)"
            strokeWidth="0.8"
            opacity="0.4"
          />
        </svg>
      </div>
      
      {/* Premium text styling */}
      <div className="flex flex-col leading-tight">
        <span className={cn(
          "font-black tracking-tight text-primary drop-shadow-md",
          "bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent",
          sizes[size].text
        )}>
          No Junk
        </span>
        <span className={cn(
          "font-bold tracking-widest text-accent drop-shadow-sm",
          size === "lg" ? "text-sm" : "text-xs"
        )}>
          LEFT BEHIND
        </span>
      </div>
    </div>
  )
}
