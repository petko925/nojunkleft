/**
 * Simple in-memory bookings store for demo purposes
 * In production, this would be replaced with a database (Supabase, etc.)
 */

export type BookingStatus = "pending" | "in-progress" | "complete" | "cancelled"

export interface Booking {
  id: string
  trailerId: string
  date: string // ISO date string (YYYY-MM-DD)
  timeSlot: "morning" | "afternoon" | "evening"
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  notes?: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

// In-memory store (would be database in production)
const bookings: Booking[] = []

// Event listeners for real-time updates
type BookingListener = (bookings: Booking[]) => void
const listeners: Set<BookingListener> = new Set()

export function subscribeToBookings(listener: BookingListener): () => void {
  listeners.add(listener)
  // Immediately call with current bookings
  listener([...bookings])
  // Return unsubscribe function
  return () => listeners.delete(listener)
}

function notifyListeners() {
  listeners.forEach(listener => listener([...bookings]))
}

export function addBooking(booking: Omit<Booking, "id" | "createdAt" | "updatedAt" | "status">): Booking {
  const now = new Date().toISOString()
  const newBooking: Booking = {
    ...booking,
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }
  bookings.push(newBooking)
  notifyListeners()
  return newBooking
}

export function updateBookingStatus(bookingId: string, status: BookingStatus): Booking | null {
  const booking = bookings.find(b => b.id === bookingId)
  if (!booking) return null
  
  booking.status = status
  booking.updatedAt = new Date().toISOString()
  notifyListeners()
  return booking
}

export function getBookingById(bookingId: string): Booking | null {
  return bookings.find(b => b.id === bookingId) || null
}

export function getBookings(): Booking[] {
  return [...bookings]
}

export function getBookingsForDate(date: string): Booking[] {
  return bookings.filter(b => b.date === date)
}

export function getBookingsForTrailer(trailerId: string): Booking[] {
  return bookings.filter(b => b.trailerId === trailerId)
}

export function isSlotBooked(trailerId: string, date: string, timeSlot: string): boolean {
  return bookings.some(
    b => b.trailerId === trailerId && b.date === date && b.timeSlot === timeSlot
  )
}

export function getAvailabilityForTrailerDay(
  trailerId: string, 
  date: string
): "available" | "partial" | "booked" {
  const dayBookings = bookings.filter(b => b.trailerId === trailerId && b.date === date)
  
  if (dayBookings.length === 0) return "available"
  if (dayBookings.length >= 3) return "booked" // All 3 slots booked
  return "partial"
}

// Format date as YYYY-MM-DD
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}
