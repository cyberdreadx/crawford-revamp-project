-- Drop the existing restrictive INSERT policies
DROP POLICY IF EXISTS "Anyone can submit a luxury survey" ON public.luxury_surveys;
DROP POLICY IF EXISTS "Anyone can submit luxury survey" ON public.luxury_surveys;

-- Create a proper PERMISSIVE INSERT policy for public submissions
CREATE POLICY "Public can submit luxury survey"
ON public.luxury_surveys
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);