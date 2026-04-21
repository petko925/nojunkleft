import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Phone, MapPin, Calendar, Clock } from "lucide-react"

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  on_route: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  in_progress: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  canceled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  on_route: "On Route",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
}

function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

interface BookingsPageProps {
  searchParams: Promise<{ status?: string; date?: string }>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("bookings")
    .select(`
      id,
      scheduled_date,
      time_window,
      status,
      crew_notes,
      customers (id, full_name, phone, address_line_1, city, state),
      leads (id, job_type, load_size, quote_min, quote_max)
    `)
    .order("scheduled_date", { ascending: true })

  if (params.status) {
    query = query.eq("status", params.status)
  }

  if (params.date) {
    query = query.eq("scheduled_date", params.date)
  } else {
    // Default: show from today onwards
    query = query.gte("scheduled_date", new Date().toISOString().split("T")[0])
  }

  const { data: bookings } = await query

  // Group bookings by date
  const groupedBookings = bookings?.reduce((acc, booking) => {
    const date = booking.scheduled_date
    if (!acc[date]) acc[date] = []
    acc[date].push(booking)
    return acc
  }, {} as Record<string, typeof bookings>) || {}

  const dates = Object.keys(groupedBookings).sort()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Scheduled pickups and appointments</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/admin/bookings/new">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Link>
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/bookings">
          <Badge
            variant={!params.status ? "default" : "outline"}
            className={!params.status ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-muted"}
          >
            Upcoming
          </Badge>
        </Link>
        {Object.entries(statusLabels).map(([key, label]) => (
          <Link key={key} href={`/admin/bookings?status=${key}`}>
            <Badge
              variant={params.status === key ? "default" : "outline"}
              className={params.status === key ? statusColors[key] : "hover:bg-muted"}
            >
              {label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Bookings by Date */}
      {dates.length > 0 ? (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                <Badge variant="secondary">{groupedBookings[date].length} booking(s)</Badge>
              </h2>
              <div className="space-y-3">
                {groupedBookings[date].map((booking: {
                  id: string
                  scheduled_date: string
                  time_window: string | null
                  status: string
                  crew_notes: string | null
                  customers: {
                    id: string
                    full_name: string
                    phone: string
                    address_line_1: string | null
                    city: string | null
                    state: string | null
                  } | null
                  leads: {
                    id: string
                    job_type: string | null
                    load_size: string | null
                    quote_min: number | null
                    quote_max: number | null
                  } | null
                }) => (
                  <Card key={booking.id} className="hover:border-orange-500/50 transition-colors">
                    <CardContent className="p-4">
                      <Link href={`/admin/bookings/${booking.id}`} className="block">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {booking.customers?.full_name || "Unknown"}
                              </h3>
                              <Badge className={statusColors[booking.status]} variant="secondary">
                                {statusLabels[booking.status]}
                              </Badge>
                              {booking.time_window && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {booking.time_window}
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              {booking.customers?.phone && (
                                <a
                                  href={`tel:${booking.customers.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 hover:text-green-500"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  {formatPhone(booking.customers.phone)}
                                </a>
                              )}
                              {booking.customers?.address_line_1 && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {booking.customers.city}, {booking.customers.state}
                                </span>
                              )}
                              {booking.leads?.load_size && (
                                <span>{booking.leads.load_size}</span>
                              )}
                            </div>

                            {booking.crew_notes && (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                                Notes: {booking.crew_notes}
                              </p>
                            )}
                          </div>

                          {booking.leads?.quote_min && booking.leads?.quote_max && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Quote</p>
                              <p className="text-lg font-bold text-orange-500">
                                ${booking.leads.quote_min} - ${booking.leads.quote_max}
                              </p>
                            </div>
                          )}
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No bookings found</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/admin/bookings/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Booking
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
