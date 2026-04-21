"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  MapPin,
  Calendar,
  DollarSign,
  Save,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

const paymentStatusOptions = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
]

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "check", label: "Check" },
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "invoice", label: "Invoice" },
]

const paymentStatusColors: Record<string, string> = {
  unpaid: "bg-red-500/10 text-red-500",
  partial: "bg-yellow-500/10 text-yellow-500",
  paid: "bg-green-500/10 text-green-500",
  refunded: "bg-gray-500/10 text-gray-500",
}

interface Job {
  id: string
  booking_id: string
  final_price: number | null
  disposal_cost: number | null
  payment_status: string
  payment_method: string | null
  completed_at: string | null
  created_at: string
  bookings: {
    id: string
    scheduled_date: string
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
    } | null
  }
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [job, setJob] = useState<Job | null>(null)
  const [finalPrice, setFinalPrice] = useState("")
  const [disposalCost, setDisposalCost] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          bookings (
            *,
            customers (*),
            leads (*)
          )
        `)
        .eq("id", params.id)
        .single()

      if (data) {
        setJob(data)
        setFinalPrice(data.final_price?.toString() || "")
        setDisposalCost(data.disposal_cost?.toString() || "")
        setPaymentStatus(data.payment_status)
        setPaymentMethod(data.payment_method || "")
      }
      setIsLoading(false)
    }
    fetchJob()
  }, [params.id, supabase])

  const handleSave = async () => {
    if (!job) return
    setIsSaving(true)
    try {
      const updates: Record<string, unknown> = {
        payment_status: paymentStatus,
        payment_method: paymentMethod || null,
        final_price: finalPrice ? parseFloat(finalPrice) : null,
        disposal_cost: disposalCost ? parseFloat(disposalCost) : null,
      }

      if (paymentStatus === "paid" && !job.completed_at) {
        updates.completed_at = new Date().toISOString()
      }

      const { error } = await supabase.from("jobs").update(updates).eq("id", job.id)

      if (error) throw error

      // Update lead status if paid
      if (paymentStatus === "paid" && job.bookings?.leads?.id) {
        await supabase.from("leads").update({ status: "paid" }).eq("id", job.bookings.leads.id)
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
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

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found</p>
        <Button asChild className="mt-4">
          <Link href="/admin/jobs">Back to Jobs</Link>
        </Button>
      </div>
    )
  }

  const customer = job.bookings?.customers
  const lead = job.bookings?.leads

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <div className="flex-1" />
        <Badge className={paymentStatusColors[paymentStatus]} variant="secondary">
          {paymentStatusOptions.find((s) => s.value === paymentStatus)?.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Completed Job
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(job.bookings.scheduled_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                {lead?.load_size && (
                  <div>
                    <p className="text-sm text-muted-foreground">Load Size</p>
                    <p className="font-medium">{lead.load_size}</p>
                  </div>
                )}
              </div>
              {lead?.quote_min && lead?.quote_max && (
                <div className="mt-4 p-3 rounded-lg bg-orange-500/10">
                  <p className="text-sm text-muted-foreground">Original Quote</p>
                  <p className="text-lg font-bold text-orange-500">
                    ${lead.quote_min} - ${lead.quote_max}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>{customer.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{formatPhone(customer.phone)}</p>
                    </div>
                  </a>
                </div>

                {customer.address_line_1 && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${customer.address_line_1}, ${customer.city}, ${customer.state} ${customer.zip_code}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {customer.address_line_1}
                        <br />
                        {customer.city}, {customer.state} {customer.zip_code}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel>Final Price ($)</FieldLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Disposal Cost ($)</FieldLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={disposalCost}
                  onChange={(e) => setDisposalCost(e.target.value)}
                />
              </Field>

              {finalPrice && disposalCost && (
                <div className="p-3 rounded-lg bg-green-500/10">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-lg font-bold text-green-500">
                    ${(parseFloat(finalPrice) - parseFloat(disposalCost)).toFixed(2)}
                  </p>
                </div>
              )}

              <Field>
                <FieldLabel>Payment Status</FieldLabel>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Payment Method</FieldLabel>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/admin/bookings/${job.booking_id}`}>View Booking</Link>
              </Button>
              {lead && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/admin/leads/${lead.id}`}>View Lead</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
