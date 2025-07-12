-- Fix RLS policy for contact_submissions to work with anonymous users
-- The issue is that the policy needs to be set for anon role explicitly

-- Drop existing insert policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;

-- Create new insert policy that explicitly allows anon and authenticated roles
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Also ensure the anon role can execute the insert
GRANT INSERT ON contact_submissions TO anon;
GRANT USAGE ON SEQUENCE contact_submissions_id_seq TO anon;

-- Make sure authenticated users can still view
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON contact_submissions;
CREATE POLICY "Authenticated users can view submissions" ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);