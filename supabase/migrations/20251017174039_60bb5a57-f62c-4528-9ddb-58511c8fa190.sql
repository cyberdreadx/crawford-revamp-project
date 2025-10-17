-- Add public SELECT policy for properties table to allow public browsing
CREATE POLICY "Public can view properties" 
ON public.properties 
FOR SELECT 
USING (true);