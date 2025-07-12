-- Add company column to existing contact_submissions table
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS company TEXT;

-- Make subject column optional since feedback won't have it
ALTER TABLE contact_submissions 
ALTER COLUMN subject DROP NOT NULL;