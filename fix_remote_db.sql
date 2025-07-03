-- Add unique constraint for upsert operations to remote database
ALTER TABLE usage_data ADD CONSTRAINT usage_data_user_date_model_unique 
  UNIQUE (user_id, date, model);