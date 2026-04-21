"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Save,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

const statusOptions = [
  { value: "new_lead", label: "New Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "awaiting_customer", label: "Awaiting Customer" },
  { value: "booked", label: "Booked" },
  { value: "on_route", label: "On Route" },
  { value: "completed", label: "Completed" },
  { value: "paid", label: "Paid" },
  { value: "canceled", label: "Canceled" },
]

const statusColors: Record<string, string> = {
  new_lead: "bg-blue-500/10 text-blue-500",
  contacted: "bg-yellow-500/10 text-yellow-500",
  quoted: "bg-purple-500/10 text-purple-500",
  awaiting_customer: "bg-orange-500/10 text-orange-500",
  booked: "bg-green-500/10 text-green-500",
  on_route: "bg-cyan-500/10 text-cyan-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  paid: "bg-green-600/10 text-green-600",
  canceled: "bg-red-500/10 text-red-500",
}

interface Lead {
  id: string
  customer_id: string
  status: string
  job_type: string | null
  load_size: string | null
  preferred_service_date: string | null
  preferred_time_window: string | null
  notes: string | null
  referral_source: string | null
  quote_min: number | null
  quote_max: number | null
  internal_notes: string | null
  ai_estimate_min: number | null
  ai_estimate_max: number | null
  ai_explanation: string | null
  created_at: string
  updated_at: string
  customers: {
    id: string
    full_name: string
    phone: string
    email: string | null
    address_line_1: string | null
    city: string | null
    state: string | null
    zip_code: string | null
  }
  lead_photos: Array<{
    id: string
    file_path: string
    file_name: string | null
  }>
}

interface LeadDetailClientProps {
  lead: Lead
  supabaseUrl: string
}

export function LeadDetailClient({ lead, supabaseUrl }: LeadDetailClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [status, setStatus] = useState(lead.status)
  const [quoteMin, setQuoteMin] = useState(lead.quote_min?.toString() || "")
  const [quoteMax, setQuoteMax] = useState(lead.quote_max?.toString() || "")
  const [internalNotes, setInternalNotes] = useState(lead.internal_notes || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status,
          quote_min: quoteMin ? parseFloat(quoteMin) : null,
          quote_max: quoteMax ? parseFloat(quoteMax) : null,
          internal_notes: internalNotes || null,
        })
        .eq("id", lead.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateBooking = async () => {
    // Update status to booked and redirect to booking creation
    await supabase.from("leads").update({ status: "booked" }).eq("id", lead.id)
    router.push(`/admin/bookings/new?lead_id=${lead.id}&customer_id=${lead.customer_id}`)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/leads">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Link>
        </Button>
        <div className="flex-1" />
        <Badge className={statusColors[status]} variant="secondary">
          {statusOptions.find((s) => s.value === status)?.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>{lead.customers.full_name}</CardTitle>
              <CardDescription>Customer Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${lead.customers.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{formatPhone(lead.customers.phone)}</p>
                  </div>
                </a>
                {lead.customers.email && (
                  <a
                    href={`mailto:${lead.customers.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{lead.customers.email}</p>
                    </div>
                  </a>
                )}
              </div>

              {lead.customers.address_line_1 && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${lead.customers.address_line_1}, ${lead.customers.city}, ${lead.customers.state} ${lead.customers.zip_code}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {lead.customers.address_line_1}
                      <br />
                      {lead.customers.city}, {lead.customers.state} {lead.customers.zip_code}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {lead.job_type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium">{lead.job_type}</p>
                  </div>
                )}
                {lead.load_size && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Load Size</p>
                    <p className="font-medium">{lead.load_size}</p>
                  </div>
                )}
                {lead.preferred_service_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Date</p>
                    <p className="font-medium">
                      {new Date(lead.preferred_service_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {lead.preferred_time_window && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred Time</p>
                    <p className="font-medium">{lead.preferred_time_window}</p>
                  </div>
                )}
              </div>

              {lead.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer Notes</p>
                  <p className="p-3 rounded-lg bg-muted text-sm">{lead.notes}</p>
                </div>
              )}

              {lead.ai_explanation && (
                <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
                  <p className="text-sm font-medium text-orange-500 mb-1">AI Analysis</p>
                  <p className="text-sm text-muted-foreground">{lead.ai_explanation}</p>
                  {lead.ai_estimate_min && lead.ai_estimate_max && (
                    <p className="mt-2 font-medium">
                      AI Estimate: ${lead.ai_estimate_min} - ${lead.ai_estimate_max}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          {lead.lead_photos && lead.lead_photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Photos ({lead.lead_photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {lead.lead_photos.map((photo) => (
                    <a
                      key={photo.id}
                      href={`${supabaseUrl}/storage/v1/object/public/lead-photos/${photo.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={`${supabaseUrl}/storage/v1/object/public/lead-photos/${photo.file_path}`}
                        alt={photo.file_name || "Lead photo"}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Quote */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Quote Min ($)</FieldLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quoteMin}
                    onChange={(e) => setQuoteMin(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Quote Max ($)</FieldLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quoteMax}
                    onChange={(e) => setQuoteMax(e.target.value)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Internal Notes</FieldLabel>
                <Textarea
                  placeholder="Notes visible only to staff..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                />
              </Field>

              <Button
                onClick={handleSave}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>

              {status !== "booked" && status !== "completed" && status !== "paid" && status !== "canceled" && (
                <Button
                  onClick={handleCreateBooking}
                  variant="outline"
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Booking
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-500" />
                  <div>
                    <p className="font-medium">Lead Created</p>
                    <p className="text-muted-foreground">{formatDate(lead.created_at)}</p>
                  </div>
                </div>
                {lead.updated_at !== lead.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-muted-foreground">{formatDate(lead.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
