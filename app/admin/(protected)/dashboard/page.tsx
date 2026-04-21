import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Phone,
} from "lucide-react"

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

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: totalLeads },
    { count: newLeads },
    { count: todayBookings },
    { count: unpaidJobs },
    { data: recentLeads },
    { data: upcomingBookings },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new_lead"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("scheduled_date", new Date().toISOString().split("T")[0]),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("payment_status", "unpaid"),
    supabase
      .from("leads")
      .select(`
        id,
        status,
        created_at,
        job_type,
        load_size,
        quote_min,
        quote_max,
        customers (full_name, phone, email)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select(`
        id,
        scheduled_date,
        time_window,
        status,
        customers (full_name, phone),
        leads (job_type, load_size)
      `)
      .gte("scheduled_date", new Date().toISOString().split("T")[0])
      .order("scheduled_date", { ascending: true })
      .limit(5),
  ])

  const stats = [
    {
      label: "Total Leads",
      value: totalLeads || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "New Leads",
      value: newLeads || 0,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Today's Bookings",
      value: todayBookings || 0,
      icon: CalendarDays,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Unpaid Jobs",
      value: unpaidJobs || 0,
      icon: DollarSign,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your junk removal business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Leads</CardTitle>
              <CardDescription>Latest quote requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/leads">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLeads && recentLeads.length > 0 ? (
              <div className="space-y-3">
                {recentLeads.map((lead: {
                  id: string
                  status: string
                  created_at: string
                  job_type: string | null
                  load_size: string | null
                  quote_min: number | null
                  quote_max: number | null
                  customers: { full_name: string; phone: string; email: string | null } | null
                }) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {lead.customers?.full_name || "Unknown"}
                        </p>
                        <Badge className={statusColors[lead.status]} variant="secondary">
                          {statusLabels[lead.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(lead.created_at)}
                        {lead.load_size && <span>• {lead.load_size}</span>}
                      </div>
                    </div>
                    {lead.quote_min && lead.quote_max && (
                      <p className="text-sm font-medium text-orange-500">
                        ${lead.quote_min}-${lead.quote_max}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No leads yet</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
              <CardDescription>Scheduled pickups</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/bookings">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking: {
                  id: string
                  scheduled_date: string
                  time_window: string | null
                  status: string
                  customers: { full_name: string; phone: string } | null
                  leads: { job_type: string | null; load_size: string | null } | null
                }) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {booking.customers?.full_name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(booking.scheduled_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {booking.time_window && <span>• {booking.time_window}</span>}
                      </div>
                    </div>
                    {booking.customers?.phone && (
                      <a
                        href={`tel:${booking.customers.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No upcoming bookings</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
