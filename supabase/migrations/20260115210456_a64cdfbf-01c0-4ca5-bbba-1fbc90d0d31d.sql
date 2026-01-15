-- Add MLS-specific columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS listing_id TEXT,
ADD COLUMN IF NOT EXISTS originating_system_name TEXT,
ADD COLUMN IF NOT EXISTS modification_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mls_status TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS days_on_market INTEGER,
ADD COLUMN IF NOT EXISTS is_mls_listing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mls_raw_data JSONB,
ADD COLUMN IF NOT EXISTS original_list_price NUMERIC,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
ADD COLUMN IF NOT EXISTS listing_agent_mls_id TEXT,
ADD COLUMN IF NOT EXISTS listing_office_mls_id TEXT;

-- Create unique index on listing_id for MLS listings
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_listing_id ON public.properties(listing_id) WHERE listing_id IS NOT NULL;

-- Create index for incremental sync queries
CREATE INDEX IF NOT EXISTS idx_properties_modification_timestamp ON public.properties(modification_timestamp) WHERE modification_timestamp IS NOT NULL;

-- Create MLS sync log table
CREATE TABLE IF NOT EXISTS public.mls_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL DEFAULT 'full',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on mls_sync_log
ALTER TABLE public.mls_sync_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view sync logs
CREATE POLICY "Admins can view mls sync logs"
ON public.mls_sync_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert sync logs (via edge functions with service role)
CREATE POLICY "Admins can insert mls sync logs"
ON public.mls_sync_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update sync logs
CREATE POLICY "Admins can update mls sync logs"
ON public.mls_sync_log
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage sync logs (for edge functions)
CREATE POLICY "Service role can manage mls sync logs"
ON public.mls_sync_log
FOR ALL
USING (auth.role() = 'service_role');