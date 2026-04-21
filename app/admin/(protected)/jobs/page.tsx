import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DollarSign, Calendar, User } from "lucide-react"

const paymentStatusColors: Record<string, string> = {
  unpaid: "bg-red-500/10 text-red-500 border-red-500/20",
  partial: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  refunded: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const paymentStatusLabels: Record<string, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
  refunded: "Refunded",
}

interface JobsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("jobs")
    .select(`
      id,
      final_price,
      payment_status,
      payment_method,
      completed_at,
      created_at,
      bookings (
        id,
        scheduled_date,
        customers (full_name, phone),
        leads (job_type, load_size, quote_min, quote_max)
      )
    `)
    .order("created_at", { ascending: false })

  if (params.status) {
    query = query.eq("payment_status", params.status)
  }

  const { data: jobs } = await query

  // Get payment status counts
  const { data: statusCounts } = await supabase.from("jobs").select("payment_status")
  const counts = statusCounts?.reduce((acc, job) => {
    acc[job.payment_status] = (acc[job.payment_status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jobs</h1>
        <p className="text-muted-foreground">Completed work and payment tracking</p>
      </div>

      {/* Payment Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/jobs">
          <Badge
            variant={!params.status ? "default" : "outline"}
            className={!params.status ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-muted"}
          >
            All ({statusCounts?.length || 0})
          </Badge>
        </Link>
        {Object.entries(paymentStatusLabels).map(([key, label]) => (
          <Link key={key} href={`/admin/jobs?status=${key}`}>
            <Badge
              variant={params.status === key ? "default" : "outline"}
              className={params.status === key ? paymentStatusColors[key] : "hover:bg-muted"}
            >
              {label} ({counts[key] || 0})
            </Badge>
          </Link>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs && jobs.length > 0 ? (
          jobs.map((job: {
            id: string
            final_price: number | null
            payment_status: string
            payment_method: string | null
            completed_at: string | null
            created_at: string
            bookings: {
              id: string
              scheduled_date: string
              customers: { full_name: string; phone: string } | null
              leads: {
                job_type: string | null
                load_size: string | null
                quote_min: number | null
                quote_max: number | null
              } | null
            } | null
          }) => (
            <Card key={job.id} className="hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <Link href={`/admin/jobs/${job.id}`} className="block">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {job.bookings?.customers?.full_name || "Unknown Customer"}
                        </h3>
                        <Badge
                          className={paymentStatusColors[job.payment_status]}
                          variant="secondary"
                        >
                          {paymentStatusLabels[job.payment_status]}
                        </Badge>
                        {job.bookings?.leads?.load_size && (
                          <Badge variant="outline">{job.bookings.leads.load_size}</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {job.bookings?.scheduled_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(job.bookings.scheduled_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        {job.payment_method && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.payment_method}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {job.final_price ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Final Price</p>
                          <p className="text-xl font-bold text-green-500">
                            ${job.final_price.toFixed(2)}
                          </p>
                        </div>
                      ) : job.bookings?.leads?.quote_min && job.bookings?.leads?.quote_max ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Quote</p>
                          <p className="text-lg font-bold text-orange-500">
                            ${job.bookings.leads.quote_min} - ${job.bookings.leads.quote_max}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Jobs are created when bookings are marked as completed
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
