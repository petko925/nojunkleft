"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, Loader2, Save, Calendar } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const timeWindows = [
  { value: "8am-10am", label: "8:00 AM - 10:00 AM" },
  { value: "10am-12pm", label: "10:00 AM - 12:00 PM" },
  { value: "12pm-2pm", label: "12:00 PM - 2:00 PM" },
  { value: "2pm-4pm", label: "2:00 PM - 4:00 PM" },
  { value: "4pm-6pm", label: "4:00 PM - 6:00 PM" },
]

interface Customer {
  id: string
  full_name: string
  phone: string
  address_line_1: string | null
  city: string | null
  state: string | null
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<NewBookingPageSkeleton />}>
      <NewBookingPageContent />
    </Suspense>
  )
}

function NewBookingPageSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Skeleton className="h-10 w-24" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

function NewBookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const leadId = searchParams.get("lead_id")
  const customerId = searchParams.get("customer_id")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || "")
  const [formData, setFormData] = useState({
    scheduled_date: "",
    time_window: "",
    crew_notes: "",
  })

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase
        .from("customers")
        .select("id, full_name, phone, address_line_1, city, state")
        .order("created_at", { ascending: false })
      if (data) setCustomers(data)
    }
    fetchCustomers()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          lead_id: leadId || null,
          customer_id: selectedCustomer,
          scheduled_date: formData.scheduled_date,
          time_window: formData.time_window || null,
          crew_notes: formData.crew_notes || null,
          status: "scheduled",
        })
        .select()
        .single()

      if (error) throw error

      // Update lead status if linked
      if (leadId) {
        await supabase.from("leads").update({ status: "booked" }).eq("id", leadId)
      }

      router.push(`/admin/bookings/${booking.id}`)
    } catch (error) {
      console.error("Failed to create booking:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            New Booking
          </CardTitle>
          <CardDescription>Schedule a pickup appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <Field>
              <FieldLabel>Customer *</FieldLabel>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomerData && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedCustomerData.address_line_1}, {selectedCustomerData.city},{" "}
                  {selectedCustomerData.state}
                </p>
              )}
            </Field>

            {/* Date & Time */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Date *</FieldLabel>
                <Input
                  type="date"
                  required
                  value={formData.scheduled_date}
                  onChange={(e) => updateField("scheduled_date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </Field>
              <Field>
                <FieldLabel>Time Window</FieldLabel>
                <Select
                  value={formData.time_window}
                  onValueChange={(v) => updateField("time_window", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeWindows.map((tw) => (
                      <SelectItem key={tw.value} value={tw.value}>
                        {tw.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Notes */}
            <Field>
              <FieldLabel>Crew Notes</FieldLabel>
              <Textarea
                value={formData.crew_notes}
                onChange={(e) => updateField("crew_notes", e.target.value)}
                placeholder="Special instructions for the crew..."
                rows={3}
              />
            </Field>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting || !selectedCustomer || !formData.scheduled_date}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Booking
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
