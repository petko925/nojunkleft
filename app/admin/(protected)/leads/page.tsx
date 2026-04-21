import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Phone, Mail, Clock, MapPin, Filter } from "lucide-react"

const statusColors: Record<string, string> = {
  new_lead: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  quoted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  awaiting_customer: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  booked: "bg-green-500/10 text-green-500 border-green-500/20",
  on_route: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  paid: "bg-green-600/10 text-green-600 border-green-600/20",
  canceled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  quoted: "Quoted",
  awaiting_customer: "Awaiting Customer",
  booked: "Booked",
  on_route: "On Route",
  completed: "Completed",
  paid: "Paid",
  canceled: "Canceled",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

interface LeadsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("leads")
    .select(`
      id,
      status,
      created_at,
      job_type,
      load_size,
      quote_min,
      quote_max,
      ai_estimate_min,
      ai_estimate_max,
      notes,
      customers (id, full_name, phone, email, address_line_1, city, state)
    `)
    .order("created_at", { ascending: false })

  if (params.status) {
    query = query.eq("status", params.status)
  }

  const { data: leads, error } = await query

  // Get status counts
  const { data: statusCounts } = await supabase
    .from("leads")
    .select("status")

  const counts = statusCounts?.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage quote requests and customer inquiries</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/admin/leads/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Link>
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/leads">
          <Badge
            variant={!params.status ? "default" : "outline"}
            className={!params.status ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-muted"}
          >
            All ({statusCounts?.length || 0})
          </Badge>
        </Link>
        {Object.entries(statusLabels).map(([key, label]) => (
          <Link key={key} href={`/admin/leads?status=${key}`}>
            <Badge
              variant={params.status === key ? "default" : "outline"}
              className={params.status === key ? statusColors[key] : "hover:bg-muted"}
            >
              {label} ({counts[key] || 0})
            </Badge>
          </Link>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {leads && leads.length > 0 ? (
          leads.map((lead: {
            id: string
            status: string
            created_at: string
            job_type: string | null
            load_size: string | null
            quote_min: number | null
            quote_max: number | null
            ai_estimate_min: number | null
            ai_estimate_max: number | null
            notes: string | null
            customers: {
              id: string
              full_name: string
              phone: string
              email: string | null
              address_line_1: string | null
              city: string | null
              state: string | null
            } | null
          }) => (
            <Card key={lead.id} className="hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <Link href={`/admin/leads/${lead.id}`} className="block">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {lead.customers?.full_name || "Unknown Customer"}
                        </h3>
                        <Badge className={statusColors[lead.status]} variant="secondary">
                          {statusLabels[lead.status]}
                        </Badge>
                        {lead.load_size && (
                          <Badge variant="outline">{lead.load_size}</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(lead.created_at)}
                        </span>
                        {lead.customers?.phone && (
                          <a
                            href={`tel:${lead.customers.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 hover:text-orange-500"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {formatPhone(lead.customers.phone)}
                          </a>
                        )}
                        {lead.customers?.email && (
                          <a
                            href={`mailto:${lead.customers.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 hover:text-orange-500"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {lead.customers.email}
                          </a>
                        )}
                        {(lead.customers?.city || lead.customers?.address_line_1) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {lead.customers?.city}, {lead.customers?.state}
                          </span>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                          {lead.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 lg:text-right">
                      {(lead.quote_min || lead.ai_estimate_min) && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {lead.quote_min ? "Quote" : "AI Estimate"}
                          </p>
                          <p className="text-lg font-bold text-orange-500">
                            ${lead.quote_min || lead.ai_estimate_min} - ${lead.quote_max || lead.ai_estimate_max}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No leads found</p>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/admin/leads/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Lead
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
