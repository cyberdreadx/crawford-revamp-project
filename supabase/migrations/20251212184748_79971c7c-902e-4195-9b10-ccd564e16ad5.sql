-- Create luxury_surveys table for storing survey responses
CREATE TABLE public.luxury_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Survey Responses (stored as arrays for multi-select questions)
  service_types TEXT[] DEFAULT '{}',
  advisor_qualities TEXT[] DEFAULT '{}',
  property_types TEXT[] DEFAULT '{}',
  lifestyle_preferences TEXT[] DEFAULT '{}',
  value_factors TEXT[] DEFAULT '{}',
  price_range TEXT,
  preferred_locations TEXT[] DEFAULT '{}',
  timeline TEXT,
  contact_preference TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.luxury_surveys ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a luxury survey
CREATE POLICY "Anyone can submit luxury survey"
ON public.luxury_surveys
FOR INSERT
WITH CHECK (true);

-- Only admins can view luxury surveys
CREATE POLICY "Admins can view luxury surveys"
ON public.luxury_surveys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update luxury surveys
CREATE POLICY "Admins can update luxury surveys"
ON public.luxury_surveys
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete luxury surveys
CREATE POLICY "Admins can delete luxury surveys"
ON public.luxury_surveys
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));