-- Allow public read access to active hero images
DROP POLICY IF EXISTS "Allow public read access to active hero images" ON public.hero_images;

CREATE POLICY "Allow public read access to active hero images" 
ON public.hero_images 
FOR SELECT 
USING (is_active = true);

-- Allow authenticated users to manage all hero images (admin functionality)
DROP POLICY IF EXISTS "Allow authenticated users to manage hero images" ON public.hero_images;

CREATE POLICY "Allow authenticated users to manage hero images" 
ON public.hero_images 
FOR ALL
USING (auth.uid() IS NOT NULL);