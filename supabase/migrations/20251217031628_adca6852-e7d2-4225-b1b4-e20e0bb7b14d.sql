-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Public can submit luxury survey" ON public.luxury_surveys;

-- Create INSERT policy for both anonymous and authenticated users
CREATE POLICY "Anyone can submit luxury survey"
ON public.luxury_surveys
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);