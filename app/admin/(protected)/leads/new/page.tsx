"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"

const loadSizes = [
  { value: "small", label: "Small (1-3 items)" },
  { value: "medium", label: "Medium (4-8 items)" },
  { value: "large", label: "Large (9-14 items)" },
  { value: "x-large", label: "X-Large (Full truck)" },
]

const jobTypes = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "construction", label: "Construction Debris" },
  { value: "estate", label: "Estate Cleanout" },
  { value: "hoarding", label: "Hoarding Cleanout" },
  { value: "other", label: "Other" },
]

export default function NewLeadPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address_line_1: "",
    city: "",
    state: "",
    zip_code: "",
    job_type: "",
    load_size: "",
    notes: "",
    quote_min: "",
    quote_max: "",
    internal_notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create customer first
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || null,
          address_line_1: formData.address_line_1 || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zip_code || null,
        })
        .select()
        .single()

      if (customerError) throw customerError

      // Create lead
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          customer_id: customer.id,
          job_type: formData.job_type || null,
          load_size: formData.load_size || null,
          notes: formData.notes || null,
          quote_min: formData.quote_min ? parseFloat(formData.quote_min) : null,
          quote_max: formData.quote_max ? parseFloat(formData.quote_max) : null,
          internal_notes: formData.internal_notes || null,
          status: "new_lead",
        })
        .select()
        .single()

      if (leadError) throw leadError

      router.push(`/admin/leads/${lead.id}`)
    } catch (error) {
      console.error("Failed to create lead:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/leads">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Lead</CardTitle>
          <CardDescription>Add a new customer lead manually</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Customer Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Full Name *</FieldLabel>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="John Smith"
                  />
                </Field>
                <Field>
                  <FieldLabel>Phone *</FieldLabel>
                  <Input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </Field>
              <Field>
                <FieldLabel>Address</FieldLabel>
                <Input
                  value={formData.address_line_1}
                  onChange={(e) => updateField("address_line_1", e.target.value)}
                  placeholder="123 Main Street"
                />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>City</FieldLabel>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Fairfield"
                  />
                </Field>
                <Field>
                  <FieldLabel>State</FieldLabel>
                  <Input
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                  />
                </Field>
                <Field>
                  <FieldLabel>ZIP</FieldLabel>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => updateField("zip_code", e.target.value)}
                    placeholder="94533"
                  />
                </Field>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Job Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Job Type</FieldLabel>
                  <Select value={formData.job_type} onValueChange={(v) => updateField("job_type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Load Size</FieldLabel>
                  <Select value={formData.load_size} onValueChange={(v) => updateField("load_size", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel>Customer Notes</FieldLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="What does the customer need removed?"
                  rows={3}
                />
              </Field>
            </div>

            {/* Quote */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Quote
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Quote Min ($)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.quote_min}
                    onChange={(e) => updateField("quote_min", e.target.value)}
                    placeholder="199"
                  />
                </Field>
                <Field>
                  <FieldLabel>Quote Max ($)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.quote_max}
                    onChange={(e) => updateField("quote_max", e.target.value)}
                    placeholder="299"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Internal Notes</FieldLabel>
                <Textarea
                  value={formData.internal_notes}
                  onChange={(e) => updateField("internal_notes", e.target.value)}
                  placeholder="Notes visible only to staff..."
                  rows={2}
                />
              </Field>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Lead
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
