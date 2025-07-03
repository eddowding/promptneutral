-- Create user_settings table for storing user preferences and metadata
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on row update
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();