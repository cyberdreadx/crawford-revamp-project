-- Allow anyone to insert into luxury_surveys (public form submission)
CREATE POLICY "Anyone can submit a luxury survey"
ON public.luxury_surveys
FOR INSERT
WITH CHECK (true);