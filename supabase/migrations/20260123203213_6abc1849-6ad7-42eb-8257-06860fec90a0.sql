-- Add email delivery tracking columns to luxury_surveys
ALTER TABLE public.luxury_surveys
ADD COLUMN email_status text DEFAULT 'pending',
ADD COLUMN email_sent_at timestamp with time zone,
ADD COLUMN email_error text,
ADD COLUMN matched_properties_count integer;

-- Add comment for documentation
COMMENT ON COLUMN public.luxury_surveys.email_status IS 'Status of the match report email: pending, sent, failed';
COMMENT ON COLUMN public.luxury_surveys.email_sent_at IS 'Timestamp when the email was successfully sent';
COMMENT ON COLUMN public.luxury_surveys.email_error IS 'Error message if email sending failed';
COMMENT ON COLUMN public.luxury_surveys.matched_properties_count IS 'Number of properties matched in the report';