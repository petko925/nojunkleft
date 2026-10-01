import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BRAND_INK, BRAND_ORANGE, Logo, LogoMark } from "@/components/logo"

const swatches = [
  { name: "Charcoal", hex: BRAND_INK, className: "bg-ink text-ink-foreground" },
  { name: "Safety Orange", hex: BRAND_ORANGE, className: "bg-primary text-primary-foreground" },
  { name: "Off-White", hex: "#fbfaf8", className: "border border-border bg-background text-foreground" },
]

export function BrandAssetsContent() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex min-h-12 w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to site
          </Link>
          <h1 className="text-4xl font-black uppercase">Brand assets</h1>
          <p className="text-muted-foreground">Logo lockups for the website, print, and truck and trailer decals.</p>
        </div>

        <section aria-labelledby="lockups-title" className="flex flex-col gap-6">
          <h2 id="lockups-title" className="text-2xl font-black uppercase">Lockups</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <figure className="flex flex-col gap-3">
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-card p-8">
                <Logo variant="horizontal" size="lg" />
              </div>
              <figcaption className="text-sm font-semibold">Horizontal &mdash; header, invoices, truck doors</figcaption>
            </figure>
            <figure className="flex flex-col gap-3">
              <div className="flex min-h-48 items-center justify-center rounded-xl bg-ink p-8 text-ink-foreground">
                <Logo variant="horizontal" size="lg" />
              </div>
              <figcaption className="text-sm font-semibold">Horizontal on charcoal &mdash; trailer sides, shirts</figcaption>
            </figure>
            <figure className="flex flex-col gap-3">
              <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-card p-8">
                <Logo variant="stacked" size="lg" />
              </div>
              <figcaption className="text-sm font-semibold">Stacked &mdash; yard signs, social profiles, tailgate</figcaption>
            </figure>
            <figure className="flex flex-col gap-3">
              <div className="flex min-h-64 items-center justify-center gap-6 rounded-xl border border-border bg-card p-8">
                <LogoMark className="size-24" title="Icon, large" />
                <LogoMark className="size-12" title="Icon, medium" />
                <LogoMark className="size-8" title="Icon, small" />
                <LogoMark className="size-4" title="Icon, favicon size" />
              </div>
              <figcaption className="text-sm font-semibold">Icon only &mdash; favicon, app icon, hats (shown down to 16px)</figcaption>
            </figure>
          </div>
        </section>

        <section aria-labelledby="colors-title" className="flex flex-col gap-6">
          <h2 id="colors-title" className="text-2xl font-black uppercase">Colors</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {swatches.map((swatch) => (
              <li key={swatch.name} className={`flex h-32 flex-col justify-end rounded-xl p-4 ${swatch.className}`}>
                <span className="font-bold">{swatch.name}</span>
                <span className="font-mono text-sm uppercase">{swatch.hex}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            Wordmark font: Archivo Black. For decals, use the icon file at{" "}
            <a href="/icon.svg" className="font-semibold text-foreground underline underline-offset-4">
              /icon.svg
            </a>{" "}
            &mdash; it&apos;s a vector and scales to any size.
          </p>
        </section>
      </div>
    </main>
  )
}
