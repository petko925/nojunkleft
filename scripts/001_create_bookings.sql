-- Create bookings table for No Junk Left Behind
-- This stores all pickup bookings with status tracking

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trailer_id TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'complete', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries by date and status
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Enable Row Level Security (but allow all operations for admin API using service role)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role full access (admin operations)
CREATE POLICY "Allow service role full access" ON bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy to allow public inserts (customer bookings)
CREATE POLICY "Allow public inserts" ON bookings
  FOR INSERT
  WITH CHECK (true);
