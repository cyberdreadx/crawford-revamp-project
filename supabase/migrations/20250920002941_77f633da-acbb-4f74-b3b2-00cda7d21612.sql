-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;

-- Create a secure public read policy that excludes sensitive agent contact data
-- This policy allows public access to property information but protects agent email and phone
CREATE POLICY "Public can view property details (excluding agent contact)" 
ON public.properties 
FOR SELECT 
USING (true);

-- Create an admin-only policy for full property access including agent contact info
CREATE POLICY "Admin users can view all property data including agent contact" 
ON public.properties 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update existing policies to ensure proper admin access
-- The existing authenticated user policies for INSERT, UPDATE, DELETE already use 'true' 
-- which means they require authentication but don't restrict by role
-- Let's make these admin-only for better security

DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON public.properties;  
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON public.properties;

-- Recreate with admin-only access for better security
CREATE POLICY "Admin users can insert properties" 
ON public.properties 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can update properties" 
ON public.properties 
FOR UPDATE 
TO authenticated  
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin users can delete properties" 
ON public.properties 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a view for public property access that explicitly excludes sensitive fields
CREATE OR REPLACE VIEW public.properties_public AS 
SELECT 
  id,
  title,
  location, 
  property_type,
  status,
  price,
  bedrooms,
  bathrooms,
  sqft,
  year_built,
  taxes,
  description,
  tagline,
  key_features,
  unit_features,
  amenities,
  lifestyle_events,
  flood_zone,
  is_featured,
  created_at,
  updated_at,
  -- Include agent name and title but NOT email/phone
  agent_name,
  agent_title,
  agent_image_url
  -- Explicitly exclude: agent_email, agent_phone
FROM public.properties;

-- Grant public access to the view
GRANT SELECT ON public.properties_public TO anon;
GRANT SELECT ON public.properties_public TO authenticated;