"use client"

import { useState, useEffect } from "react"
import { Truck, CheckCircle, XCircle, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  subscribeToBookings, 
  getAvailabilityForTrailerDay, 
  formatDateKey,
  type Booking 
} from "@/lib/bookings-store"

interface Trailer {
  id: string
  name: string
  type: "small" | "medium" | "large" | "xl"
  capacity: string
  description: string
  bestFor: string[]
  status: "available" | "in-use" | "maintenance"
  location: string
  nextAvailable?: string
}

const trailers: Trailer[] = [
  { 
    id: "alpha", 
    name: "Trailer Alpha", 
    type: "xl", 
    capacity: "20 cubic yards", 
    description: "Our largest trailer for major cleanouts",
    bestFor: ["Large loads", "Extra-large loads", "Estate cleanouts", "Construction debris", "Full garage cleanouts"],
    status: "available", 
    location: "Main Depot" 
  },
  { 
    id: "bravo", 
    name: "Trailer Bravo", 
    type: "medium", 
    capacity: "10 cubic yards", 
    description: "Perfect for small to medium projects",
    bestFor: ["Small loads", "Medium loads", "Single room cleanouts", "Yard waste", "Furniture removal"],
    status: "available", 
    location: "Main Depot" 
  },
]

const typeColors = {
  small: "bg-chart-4",
  medium: "bg-chart-2",
  large: "bg-primary",
  xl: "bg-primary",
}

const statusConfig = {
  available: { icon: CheckCircle, label: "Available", color: "text-chart-4" },
  "in-use": { icon: Clock, label: "In Use", color: "text-accent" },
  maintenance: { icon: XCircle, label: "Maintenance", color: "text-destructive" },
}

function generateWeekDays(startDate: Date) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push(date)
  }
  return days
}

export function TrailerAvailability() {
  // Track mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [weekStart, setWeekStart] = useState<Date | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  // Initialize dates only on client to avoid server/client timezone mismatch
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setWeekStart(today)
    setMounted(true)
  }, [])

  // Subscribe to booking changes for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToBookings((updatedBookings) => {
      setBookings(updatedBookings)
    })
    return unsubscribe
  }, [])

  const weekDays = weekStart ? generateWeekDays(weekStart) : []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const filteredTrailers = trailers

  const prevWeek = () => {
    if (!weekStart) return
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() - 7)
    setWeekStart(newStart)
  }

  const nextWeek = () => {
    if (!weekStart) return
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() + 7)
    setWeekStart(newStart)
  }

  const goToToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setWeekStart(today)
  }

  // Get trailer availability based on actual bookings
  const getTrailerAvailability = (trailerId: string, dayIndex: number): "available" | "booked" | "partial" => {
    if (!weekStart) return "available"
    
    // Get the date for this day
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + dayIndex)
    const dateKey = formatDateKey(date)
    
    // Check actual bookings first
    const actualAvailability = getAvailabilityForTrailerDay(trailerId, dateKey)
    if (actualAvailability !== "available") {
      return actualAvailability
    }
    
    // For demo purposes, add some pre-booked slots based on deterministic hash
    // This simulates existing bookings - remove this in production with real database
    const dayOffset = weekStart.getDate() + dayIndex
    const hash = (trailerId.charCodeAt(0) * 31 + dayOffset) % 10
    if (hash < 4) return "available"
    if (hash < 7) return "partial"
    return "booked"
  }

  // Show loading skeleton until client is mounted to avoid hydration mismatch
  if (!mounted || !weekStart) {
    return (
      <section id="availability" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Real-Time Tracking</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Trailer Availability
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Check real-time availability of our dump trailers and book the right size for your project.
            </p>
          </div>
          
          {/* Loading skeleton */}
          <Card className="bg-card border-border mb-8">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-10 w-10" />
              </div>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  // Get today for comparison (after mount)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <section id="availability" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Real-Time Tracking</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Trailer Availability
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Check real-time availability of our dump trailers and book the right size for your project.
          </p>
        </div>

        {/* Trailer Quick Info */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-medium">Alpha: Large &amp; XL Loads (20 yd)</span>
          </div>
          <div className="flex items-center gap-2 bg-chart-2/10 border border-chart-2/20 rounded-full px-4 py-2">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <span className="text-sm font-medium">Bravo: Small &amp; Medium Loads (10 yd)</span>
          </div>
        </div>

        {/* Week Calendar View */}
        <Card className="bg-card border-border mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevWeek}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={nextWeek}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <CardTitle className="text-lg">
              {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Week Header */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="text-sm font-medium text-muted-foreground p-2">Trailer</div>
                {weekDays.map((day, i) => {
                  const isToday = day.getTime() === today.getTime()
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "text-center p-2 rounded-lg",
                        isToday && "bg-primary/10"
                      )}
                    >
                      <div className="text-xs text-muted-foreground">{dayNames[day.getDay()]}</div>
                      <div className={cn("font-semibold", isToday && "text-primary")}>{day.getDate()}</div>
                    </div>
                  )
                })}
              </div>

              {/* Trailer Rows */}
              {filteredTrailers.map((trailer) => (
                <div key={trailer.id} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="flex items-center gap-2 p-2">
                    <div className={cn("w-3 h-3 rounded-full", typeColors[trailer.type])} />
                    <span className="text-sm font-medium truncate">{trailer.name}</span>
                  </div>
                  {weekDays.map((_, dayIndex) => {
                    const availability = getTrailerAvailability(trailer.id, dayIndex)
                    return (
                      <button
                        key={dayIndex}
                        className={cn(
                          "h-12 rounded-lg transition-all flex items-center justify-center text-xs font-medium min-h-[44px]",
                          availability === "available" && "bg-chart-4/20 text-chart-4 hover:bg-chart-4/30",
                          availability === "booked" && "bg-muted text-muted-foreground cursor-not-allowed",
                          availability === "partial" && "bg-accent/20 text-accent hover:bg-accent/30"
                        )}
                      >
                        {availability === "available" && "Open"}
                        {availability === "booked" && "Full"}
                        {availability === "partial" && "PM"}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trailer Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {filteredTrailers.map((trailer) => {
            const StatusIcon = statusConfig[trailer.status].icon
            const isAlpha = trailer.id === "alpha"
            return (
              <Card key={trailer.id} className={cn(
                "bg-card border-border",
                isAlpha && "border-primary/30"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-4 h-4 rounded-full", typeColors[trailer.type])} />
                        <h3 className="text-xl font-bold">{trailer.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{trailer.capacity}</p>
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-sm font-medium", statusConfig[trailer.status].color)}>
                      <StatusIcon className="h-4 w-4" />
                      <span>{statusConfig[trailer.status].label}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{trailer.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Best for:</p>
                    <div className="flex flex-wrap gap-2">
                      {trailer.bestFor.map((item) => (
                        <span 
                          key={item} 
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            isAlpha ? "bg-primary/10 text-primary" : "bg-chart-2/10 text-chart-2"
                          )}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{trailer.location}</span>
                  </div>

                  {trailer.nextAvailable && (
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>Next available: <span className="font-medium text-accent">{trailer.nextAvailable}</span></span>
                    </div>
                  )}

                  <Button 
                    variant={trailer.status === "available" ? "default" : "outline"}
                    className="w-full h-12 text-base"
                    disabled={trailer.status === "maintenance"}
                  >
                    {trailer.status === "available" ? "Book Now" : trailer.status === "in-use" ? "Reserve Next" : "Unavailable"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-chart-4/20" />
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/20" />
            <span className="text-sm text-muted-foreground">Partial Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Booked</span>
          </div>
        </div>
      </div>
    </section>
  )
}
