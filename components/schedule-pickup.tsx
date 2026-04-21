"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Calendar, Clock, MapPin, CheckCircle, ChevronLeft, ChevronRight, Loader2, AlertCircle, Truck, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { addBooking, formatDateKey } from "@/lib/bookings-store"
import { Skeleton } from "@/components/ui/skeleton"
import { getAddressSuggestions, loadGooglePlacesScript, type AddressSuggestion } from "@/lib/address-autocomplete"

const timeSlots = [
  { id: "morning", label: "Morning", time: "8:00 AM - 12:00 PM", available: true },
  { id: "afternoon", label: "Afternoon", time: "12:00 PM - 4:00 PM", available: true },
  { id: "evening", label: "Evening", time: "4:00 PM - 7:00 PM", available: false },
]

// Generate calendar days using a reference "today" date to ensure consistency
function generateCalendarDays(year: number, month: number, todayRef: Date) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()
  
  const days: { date: Date; isCurrentMonth: boolean; isAvailable: boolean }[] = []
  
  // Previous month's days
  const prevMonthLastDay = new Date(year, month, 0)
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay.getDate() - i),
      isCurrentMonth: false,
      isAvailable: false,
    })
  }
  
  // Current month's days - use todayRef passed in for consistent comparison
  const todayStart = new Date(todayRef.getFullYear(), todayRef.getMonth(), todayRef.getDate())
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const isPast = date < todayStart
    const isWeekend = date.getDay() === 0
    days.push({
      date,
      isCurrentMonth: true,
      isAvailable: !isPast && !isWeekend,
    })
  }
  
  // Next month's days
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isAvailable: false,
    })
  }
  
  return days
}

// Available trailers for booking
const trailerOptions = [
  { id: "alpha", name: "Trailer Alpha", description: "Large & XL loads (20 cubic yards)" },
  { id: "bravo", name: "Trailer Bravo", description: "Small & Medium loads (10 cubic yards)" },
]

export function SchedulePickup() {
  // Track mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [today, setToday] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null)
  const [step, setStep] = useState<"date" | "details" | "confirm">("date")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })
  
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize dates only on client side to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    setToday(now)
    setCurrentMonth(now)
    setMounted(true)
  }, [])

  // Load Google Places API on mount
  useEffect(() => {
    loadGooglePlacesScript()
  }, [])

  // Close address suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressInputRef.current && !addressInputRef.current.contains(e.target as Node)) {
        setShowAddressSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle address input change with debounced suggestions
  const handleAddressChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, address: value }))
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    if (value.length < 3) {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      return
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      const suggestions = await getAddressSuggestions(value)
      setAddressSuggestions(suggestions)
      setShowAddressSuggestions(suggestions.length > 0)
    }, 300)
  }, [])

  // Select an address from suggestions
  const selectAddress = useCallback((suggestion: AddressSuggestion) => {
    setFormData(prev => ({ ...prev, address: suggestion.value }))
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
  }, [])

  const days = mounted && currentMonth && today 
    ? generateCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth(), today)
    : []
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const prevMonth = () => {
    if (!currentMonth) return
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    if (!currentMonth) return
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Show loading skeleton until mounted to prevent hydration mismatch
  if (!mounted || !currentMonth) {
    return (
      <section id="schedule" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Easy Scheduling</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Schedule Your Pickup
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Choose a date and time that works for you. Same-day service available for urgent pickups.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setEmailError(null)
    
    const selectedTimeSlot = timeSlots.find(s => s.id === selectedTime)
    const dateFormatted = selectedDate?.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "long", 
      day: "numeric",
      year: "numeric"
    })
    const dateISO = selectedDate?.toISOString().split('T')[0] // YYYY-MM-DD format

    try {
      // Save booking to Supabase (also sends confirmation emails)
      if (selectedDate && selectedTime && selectedTrailer) {
        const bookingRes = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trailer_id: selectedTrailer,
            date: dateISO,
            time_slot: selectedTimeSlot?.time || selectedTime,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            address: formData.address,
            notes: formData.notes || null,
          }),
        })

        const bookingData = await bookingRes.json()

        if (!bookingRes.ok) {
          console.error('[v0] Booking API error:', bookingData)
          throw new Error(bookingData.error || 'Failed to save booking')
        }

        // Check if email was sent
        if (!bookingData.emailSent) {
          setEmailError('Booking confirmed but email failed to send. Please contact us if you need confirmation.')
        }

        // Also add to local store for real-time UI updates
        addBooking({
          trailerId: selectedTrailer,
          date: dateISO!,
          timeSlot: selectedTime as "morning" | "afternoon" | "evening",
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          address: formData.address,
          notes: formData.notes || undefined,
        })
      }

      setStep("confirm")
    } catch (error) {
      console.error('[v0] Schedule pickup error:', error)
      setEmailError('Booking confirmed but email failed to send. Please contact us if you need confirmation.')
      setStep("confirm")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="schedule" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Easy Scheduling</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Schedule Your Pickup
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Choose a date and time that works for you. Same-day service available for urgent pickups.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                step === "date" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
              )}>
                1
              </div>
              <span className="text-sm font-medium hidden sm:inline">Select Date</span>
            </div>
            <div className="w-8 md:w-16 h-0.5 bg-border mx-2" />
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                step === "details" ? "bg-primary text-primary-foreground" : step === "confirm" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
              )}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">Your Details</span>
            </div>
            <div className="w-8 md:w-16 h-0.5 bg-border mx-2" />
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                step === "confirm" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                3
              </div>
              <span className="text-sm font-medium hidden sm:inline">Confirm</span>
            </div>
          </div>

          {step === "date" && (
            <div className="space-y-6">
              {/* Trailer Selection */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Select Trailer
                  </CardTitle>
                  <CardDescription>
                    Choose the right trailer size for your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  {trailerOptions.map((trailer) => (
                    <button
                      key={trailer.id}
                      type="button"
                      onClick={() => setSelectedTrailer(trailer.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        selectedTrailer === trailer.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{trailer.name}</div>
                          <div className="text-sm text-muted-foreground">{trailer.description}</div>
                        </div>
                        {selectedTrailer === trailer.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Button variant="ghost" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-lg">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, i) => {
                      const isSelected = selectedDate?.toDateString() === day.date.toDateString()
                      return (
                        <button
                          key={i}
                          disabled={!day.isAvailable}
                          onClick={() => setSelectedDate(day.date)}
                          className={cn(
                            "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                            !day.isCurrentMonth && "text-muted-foreground/30",
                            day.isCurrentMonth && !day.isAvailable && "text-muted-foreground/50 cursor-not-allowed",
                            day.isCurrentMonth && day.isAvailable && "hover:bg-primary/10 cursor-pointer",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                          )}
                        >
                          {day.date.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Select Time
                  </CardTitle>
                  <CardDescription>
                    {selectedDate
                      ? `Available times for ${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
                      : "Select a date first"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={!selectedDate || !slot.available}
                      onClick={() => setSelectedTime(slot.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all min-h-[72px]",
                        !selectedDate || !slot.available
                          ? "border-border bg-secondary/50 opacity-50 cursor-not-allowed"
                          : selectedTime === slot.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{slot.label}</div>
                          <div className="text-sm text-muted-foreground">{slot.time}</div>
                        </div>
                        {!slot.available && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                            Booked
                          </span>
                        )}
                        {selectedTime === slot.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                  
                  <Button
                    className="w-full h-12 mt-4"
                    disabled={!selectedDate || !selectedTime || !selectedTrailer}
                    onClick={() => setStep("details")}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
              </div>
            </div>
          )}

          {step === "details" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Your Details
                </CardTitle>
                <CardDescription>
                  Pickup scheduled for {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} - {timeSlots.find(s => s.id === selectedTime)?.time}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Pickup Address</Label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={addressInputRef}
                        id="address"
                        placeholder="Start typing your address..."
                        value={formData.address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => formData.address.length >= 3 && setShowAddressSuggestions(true)}
                        className="h-12 pl-9"
                      />
                    </div>
                    
                    {/* Address suggestions dropdown */}
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                        {addressSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setFormData(prev => ({ ...prev, address: suggestion.value }))
                              setShowAddressSuggestions(false)
                              setAddressSuggestions([])
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm flex items-center gap-2 border-b border-border last:border-b-0"
                          >
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>{suggestion.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Gate code, parking info, item location..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep("date")} className="h-12">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                  </Button>
                  <Button 
                    className="flex-1 h-12"
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.phone || !formData.email || !formData.address || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sending Confirmation...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "confirm" && (
            <Card className="bg-card border-border text-center">
              <CardContent className="py-12">
                <div className="w-20 h-20 bg-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-chart-4" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                <p className="text-muted-foreground mb-6">
                  Your pickup has been scheduled. We&apos;ve sent a confirmation to your email.
                </p>
                
                {emailError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start gap-3 text-left max-w-md mx-auto">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{emailError}</p>
                  </div>
                )}
                
                <div className="bg-secondary rounded-xl p-6 max-w-md mx-auto text-left mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trailer:</span>
                      <span className="font-medium">{trailerOptions.find(t => t.id === selectedTrailer)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{timeSlots.find(s => s.id === selectedTime)?.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium text-right max-w-[200px]">{formData.address}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => {
                  setStep("date")
                  setSelectedDate(null)
                  setSelectedTime(null)
                  setSelectedTrailer(null)
                  setFormData({ name: "", phone: "", email: "", address: "", notes: "" })
                  setEmailError(null)
                }}>
                  Book Another Pickup
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
