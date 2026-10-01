// Admin pages create Supabase clients per request; never prerender them at build time.
export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
