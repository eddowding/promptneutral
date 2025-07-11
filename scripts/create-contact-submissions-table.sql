-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  notes TEXT,
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for inserting (anyone can submit)
CREATE POLICY "Anyone can create contact submissions" ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy for reading (only authenticated users can read)
CREATE POLICY "Authenticated users can read contact submissions" ON contact_submissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy for updating (only authenticated users can update)
CREATE POLICY "Authenticated users can update contact submissions" ON contact_submissions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- Add comments
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN contact_submissions.status IS 'Status of the contact submission: new, read, replied, or archived';
COMMENT ON COLUMN contact_submissions.notes IS 'Internal notes about this contact submission';
COMMENT ON COLUMN contact_submissions.replied_at IS 'Timestamp when a reply was sent';