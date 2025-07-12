-- Add URL column to contact_submissions table to track where feedback was submitted from
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Add a type column to distinguish between contact form and feedback submissions
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'contact' CHECK (submission_type IN ('contact', 'feedback'));

-- Create an index on submission_type for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_type ON contact_submissions(submission_type);

-- Update the comment to reflect the dual purpose
COMMENT ON TABLE contact_submissions IS 'Stores both contact form and feedback submissions from the website';
COMMENT ON COLUMN contact_submissions.url IS 'The URL where the submission was made from (primarily for feedback)';
COMMENT ON COLUMN contact_submissions.submission_type IS 'Type of submission: contact or feedback';