-- Add unique constraint for upsert operations on usage_data table
-- This constraint allows ON CONFLICT (user_id, date, model) to work properly

ALTER TABLE usage_data 
ADD CONSTRAINT usage_data_user_date_model_unique 
UNIQUE (user_id, date, model);