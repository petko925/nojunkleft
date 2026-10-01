import { cn } from "@/lib/utils"

export function LoadGauge({ fraction, className }: { fraction: number; className?: string }) {
  const bedTop = 6
  const bedBottom = 38
  const fillTop = bedBottom - (bedBottom - bedTop) * fraction
  const clipId = `load-bed-${Math.round(fraction * 100)}`

  return (
    <svg viewBox="0 0 120 56" className={cn("h-auto w-full", className)} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d="M6 6h96l-6 32H12z" />
        </clipPath>
      </defs>
      <path d="M6 6h96l-6 32H12z" className="fill-muted" />
      <rect
        x="0"
        y={fillTop}
        width="120"
        height={bedBottom - fillTop}
        clipPath={`url(#${clipId})`}
        className="fill-primary"
      />
      {[0.25, 0.5, 0.75].map((mark) => (
        <line
          key={mark}
          x1="8"
          x2="100"
          y1={bedBottom - (bedBottom - bedTop) * mark}
          y2={bedBottom - (bedBottom - bedTop) * mark}
          className="stroke-foreground/15"
          strokeDasharray="3 3"
        />
      ))}
      <path d="M6 6h96l-6 32H12z" fill="none" className="stroke-foreground" strokeWidth="3" strokeLinejoin="round" />
      <rect x="10" y="40" width="88" height="4" rx="2" className="fill-foreground" />
      <path d="M98 42h14" className="stroke-foreground" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="48" r="7" className="fill-foreground" />
      <circle cx="56" cy="48" r="7" className="fill-foreground" />
      <circle cx="36" cy="48" r="2.5" className="fill-background" />
      <circle cx="56" cy="48" r="2.5" className="fill-background" />
    </svg>
  )
}
