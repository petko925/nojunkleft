import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { LeadDetailClient } from "./lead-detail-client"

interface LeadDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead, error } = await supabase
    .from("leads")
    .select(`
      *,
      customers (*),
      lead_photos (*)
    `)
    .eq("id", id)
    .single()

  if (error || !lead) {
    notFound()
  }

  // Get Supabase project URL for photo URLs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return <LeadDetailClient lead={lead} supabaseUrl={supabaseUrl} />
}
