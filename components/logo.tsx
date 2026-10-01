import { cn } from "@/lib/utils"

export const BRAND_INK = "#19191b"
export const BRAND_ORANGE = "#ff6a13"

type LogoVariant = "horizontal" | "stacked" | "icon"
type LogoSize = "sm" | "md" | "lg"

interface LogoProps {
  variant?: LogoVariant
  size?: LogoSize
  className?: string
}

const markSizes: Record<LogoSize, string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-20",
}

const wordSizes: Record<LogoSize, { top: string; bottom: string }> = {
  sm: { top: "text-lg", bottom: "text-[0.62rem]" },
  md: { top: "text-xl", bottom: "text-[0.7rem]" },
  lg: { top: "text-4xl", bottom: "text-sm" },
}

// A dump trailer mid-dump: the tilted bed and its open tailgate together form a checkmark.
// Plain function (not a component) so the same shapes render inside next/og ImageResponse.
export function renderMarkShapes(ink: string = BRAND_INK, orange: string = BRAND_ORANGE) {
  return (
    <g transform="translate(1.5 -5.5)">
      <path d="M36 48V34" stroke={orange} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M20 46.5L44.5 25.9L38.1 18.2L13.6 38.8Z"
        fill={orange}
        stroke={orange}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13.6 38.8L17.05 35.9L11.26 29L7.81 31.9Z"
        fill={orange}
        stroke={orange}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M28.23 37.63L23.72 32.27M35.13 31.84L30.62 26.48"
        stroke={ink}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <rect x="14" y="47" width="37" height="3" rx="1.5" fill={orange} />
      <path d="M50 48.5H55" stroke={orange} strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="53" r="5.5" fill={orange} stroke={ink} strokeWidth="2" />
      <circle cx="35.5" cy="53" r="5.5" fill={orange} stroke={ink} strokeWidth="2" />
      <circle cx="24" cy="53" r="1.8" fill={ink} />
      <circle cx="35.5" cy="53" r="1.8" fill={ink} />
    </g>
  )
}

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="64" height="64" rx="14" fill={BRAND_INK} />
      {renderMarkShapes()}
    </svg>
  )
}

function Wordmark({ size, align = "left" }: { size: LogoSize; align?: "left" | "center" }) {
  return (
    <span
      className={cn(
        "flex flex-col font-display uppercase leading-none",
        align === "center" ? "items-center" : "items-start",
      )}
    >
      <span className={cn("font-black tracking-tight", wordSizes[size].top)}>No Junk</span>
      <span className={cn("mt-1 font-extrabold tracking-[0.18em] text-primary", wordSizes[size].bottom)}>
        Left Behind
      </span>
    </span>
  )
}

export function Logo({ variant = "horizontal", size = "md", className }: LogoProps) {
  if (variant === "icon") {
    return <LogoMark className={cn(markSizes[size], className)} title="No Junk Left Behind" />
  }

  if (variant === "stacked") {
    return (
      <span className={cn("inline-flex flex-col items-center gap-3", className)}>
        <LogoMark className={markSizes[size]} />
        <Wordmark size={size} align="center" />
        <span className="sr-only">No Junk Left Behind</span>
      </span>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markSizes[size]} />
      <Wordmark size={size} />
      <span className="sr-only">No Junk Left Behind</span>
    </span>
  )
}
