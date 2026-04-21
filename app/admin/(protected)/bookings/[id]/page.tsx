"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Save,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "on_route", label: "On Route" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
]

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500",
  on_route: "bg-yellow-500/10 text-yellow-500",
  in_progress: "bg-orange-500/10 text-orange-500",
  completed: "bg-green-500/10 text-green-500",
  canceled: "bg-red-500/10 text-red-500",
}

interface Booking {
  id: string
  lead_id: string | null
  customer_id: string
  scheduled_date: string
  time_window: string | null
  crew_notes: string | null
  status: string
  created_at: string
  customers: {
    full_name: string
    phone: string
    email: string | null
    address_line_1: string | null
    city: string | null
    state: string | null
    zip_code: string | null
  }
  leads: {
    id: string
    job_type: string | null
    load_size: string | null
    quote_min: number | null
    quote_max: number | null
    notes: string | null
  } | null
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [status, setStatus] = useState("")
  const [crewNotes, setCrewNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          customers (*),
          leads (*)
        `)
        .eq("id", params.id)
        .single()

      if (data) {
        setBooking(data)
        setStatus(data.status)
        setCrewNotes(data.crew_notes || "")
      }
      setIsLoading(false)
    }
    fetchBooking()
  }, [params.id, supabase])

  const handleSave = async () => {
    if (!booking) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          crew_notes: crewNotes || null,
        })
        .eq("id", booking.id)

      if (error) throw error

      // Update lead status accordingly
      if (booking.lead_id) {
        let leadStatus = "booked"
        if (status === "on_route") leadStatus = "on_route"
        if (status === "completed") leadStatus = "completed"
        if (status === "canceled") leadStatus = "canceled"
        await supabase.from("leads").update({ status: leadStatus }).eq("id", booking.lead_id)
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteJob = async () => {
    if (!booking) return
    
    // Create a job record
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        booking_id: booking.id,
        payment_status: "unpaid",
      })
      .select()
      .single()

    if (!error && job) {
      // Update booking and lead status
      await supabase.from("bookings").update({ status: "completed" }).eq("id", booking.id)
      if (booking.lead_id) {
        await supabase.from("leads").update({ status: "completed" }).eq("id", booking.lead_id)
      }
      router.push(`/admin/jobs/${job.id}`)
    }
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Booking not found</p>
        <Button asChild className="mt-4">
          <Link href="/admin/bookings">Back to Bookings</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
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
          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                {new Date(booking.scheduled_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.time_window && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {booking.time_window}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>{booking.customers.full_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={`tel:${booking.customers.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{formatPhone(booking.customers.phone)}</p>
                  </div>
                </a>
                {booking.customers.email && (
                  <a
                    href={`mailto:${booking.customers.email}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{booking.customers.email}</p>
                    </div>
                  </a>
                )}
              </div>

              {booking.customers.address_line_1 && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${booking.customers.address_line_1}, ${booking.customers.city}, ${booking.customers.state} ${booking.customers.zip_code}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {booking.customers.address_line_1}
                      <br />
                      {booking.customers.city}, {booking.customers.state}{" "}
                      {booking.customers.zip_code}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Job Details from Lead */}
          {booking.leads && (
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {booking.leads.job_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Job Type</p>
                      <p className="font-medium">{booking.leads.job_type}</p>
                    </div>
                  )}
                  {booking.leads.load_size && (
                    <div>
                      <p className="text-sm text-muted-foreground">Load Size</p>
                      <p className="font-medium">{booking.leads.load_size}</p>
                    </div>
                  )}
                  {booking.leads.quote_min && booking.leads.quote_max && (
                    <div>
                      <p className="text-sm text-muted-foreground">Quote</p>
                      <p className="font-medium text-orange-500">
                        ${booking.leads.quote_min} - ${booking.leads.quote_max}
                      </p>
                    </div>
                  )}
                </div>
                {booking.leads.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Customer Notes</p>
                    <p className="p-3 rounded-lg bg-muted text-sm">{booking.leads.notes}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/leads/${booking.leads.id}`}>View Full Lead</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Booking</CardTitle>
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

              <Field>
                <FieldLabel>Crew Notes</FieldLabel>
                <Textarea
                  value={crewNotes}
                  onChange={(e) => setCrewNotes(e.target.value)}
                  placeholder="Notes for the crew..."
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

              {status !== "completed" && status !== "canceled" && (
                <Button
                  onClick={handleCompleteJob}
                  variant="outline"
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete & Create Job
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
